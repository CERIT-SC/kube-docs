---
layout: article
title: Use case Omero
permalink: /docs/omero/omero.html
key: omero
aside:
  toc: true
sidebar:
  nav: docs
---

We have got a task to run [Omero](https://www.openmicroscopy.org/omero/) application in Kubernetes. Basically, we need two things: Docker container of the application and deployment manifest. The application may have some depencencies like database, in this case we need to deploy those as well.

Searching for the term `omero docker`, we got the result [https://github.com/ome/omero-server-docker](https://github.com/ome/omero-server-docker) which explains how to deploy the Omero server. It has two options:
 
1. Running OMERO with docker-compose
2. Running the images (manual)

For Kubernetes, we need to choose the second option because docker-compose cannot be applied directly to Kubernetes.

The second option starts with database and it seems to be the Postgres database. Here, we are lucky because Kubernetes provide a Postgres operator for easy database deployment, see our [Operators](/docs/operators/postgres-cnpg.html) documentation.

In all the commands below, replace the `[namespace]` with your own namespace name.

## Postgres

The Postgres operator creates random passwords by default, but in this example, we will create an explicit password for the Postgres database. We will use `omero` as database user and some secret password e.g., `xxxpassword`. First, we need to create a secret with the name and the password. Both of them must be [base64](https://www.base64encode.org/) encoded. 
You can use the link or use `echo -e 'omero' | base64` in Linux shell. The `-n` switch is essential, the string (name, password) must not contain the newline character (`\n`). Once we have two base64 encoded values, we create and deploy secret:
```yaml
apiVersion: v1
data:
  password: b21lcm9rb2tvcw==
  username: b21lcm8=
kind: Secret
metadata:
  name: omero-db-app
type: kubernetes.io/basic-auth
```

The `metadata.name` can be arbitrary but will be referenced in subsequent manifests. [Link](/docs/omero/deployments/db-app-secret.yaml).

```
kubectl create -f db-app-secret.yaml -n [namespace]
```

Once we have the secret, we deploy the database. Simple configuration is enough.
```yaml
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: omero
spec:
  instances: 1
  imageName: 'ghcr.io/cloudnative-pg/postgresql:15.3-2'
  primaryUpdateStrategy: unsupervised
  bootstrap:
    initdb:
      database: omero
      owner: omero
      secret:
        name: omero-db-app
  resources:
    requests:
      memory: 2Gi
      cpu: 100m
    limits:
      memory: 6Gi
      cpu: 2
  storage:
    size: 10Gi
    storageClass: zfs-csi
```
This manifest references the secret name in the `spec.bootstrap.initdb.secret.name`, it must match the name of the secret we created. If the database is slow to handle all the load, the `spec.resources.limits.cpu` can be increased. For non-demo purposes, the `spec.resources.requests.cpu` should be increased to match actual typical load. [Link](/docs/omero/deployments/db-cluster.yaml).

```
kubectl create -f db-cluster.yaml [namespace]
```

After a while, a new Pod should be created in the `[namespace]` namespace. It will be named `omero-1`. 

The cluster create has only a single Pod, it is not a real and resilient cluster. For high availability clusters, see [documentation](/docs/operators/postgres2.html).

## Omero Server

Running the `omero-server` was the second step. The page shows how to run it in the Docker:
```
docker run -d --name omero-server --link postgres:db \
    -e CONFIG_omero_db_user=postgres \
    -e CONFIG_omero_db_pass=postgres \
    -e CONFIG_omero_db_name=postgres \
    -e ROOTPASS=omero-root-password \
    -p 4063:4063 -p 4064:4064 \
    openmicroscopy/omero-server
```

Application in the managed Kubernetes cannot run as root. It is a good idea to get the expected user id from the container using the docker. So on a machine with docker installed, issue:
```
docker run -it --rm --entrypoint /bin/bash openmicroscopy/omero-server
```

This will create and run the Omero server docker container. Next, issue the `id` command, it will show the expected user id and group id. It should look like this:
```
xhejtman@osiris:~$ docker run -it --rm --entrypoint /bin/bash openmicroscopy/omero-server
bash-4.2$ id
uid=1000(omero-server) gid=997(omero-server) groups=997(omero-server)
bash-4.2$
```

So, for the server deployment, we use user id `1000` and group id `997`. 

We can see, that we should pass four environment variables: `CONFIG_omero_db_user`, ` CONFIG_omero_db_pass`, `CONFIG_omero_db_name`, and `ROOTPASS`. We need to pass an additional variable `CONFIG_omero_db_host` to specify the database hostname. The created database has the hostname in the form `[name]-rw`, so in our case `omero-rw`.

We will use the database secret to fill the `CONFIG_omero_db_user` and `CONFIG_omero_db_pass` variables. The specific part of the manifest looks like this:
```yaml
name: CONFIG_omero_db_user
valueFrom:
  secretKeyRef:
    name: omero-db-app
    key: username
```

where `name: omero-db-app` is the name of the secret and the `key: username` is the key in the secret.

Scrolling down the github page, we can see that we will also need some persistent storage:
* `/opt/omero/server/OMERO.server/var`: The OMERO.server var directory, including logs
* `/OMERO`: The OMERO data directory

We will use a non-persistent `emptyDir` volume for the logs and a persistent volume for the `/OMERO` directory. This solution is based on the assumption, that the `/OMERO` contains valuable data, while `/opt/omero/server/OMERO.server/var` does not.

For the persistent volume, a PVC must be created using the following manifest:
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-omero-data
spec:
  accessModes:
  - ReadWriteMany
  resources:
    requests:
      storage: 100Gi
  storageClassName: nfs-csi
```
[Link](/docs/omero/deployments/pvc-data.yaml).

```
kubectl create -f pvc-data.yaml -n [namespace]
```

Finally, we are ready to deploy the `omero-server` using the [complete manifest](/docs/omero/deployments/omero-server.yaml). It also exposes two ports in the same way as the Docker command. **Do not forget to set your own ROOT password in the following fragment.** Also, rather a Secret object should be used to pass the password.
```yaml
name: ROOTPASS
value: omero-root-password
```

```
kubectl create -f omero-server.yaml -n [namespace]
```

Now, we should have the `omero-server` running. However, to be accessible from the cluster, another manifest needs to be ddeployed---service.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: omero-server
spec:
  type: ClusterIP
  ports:
  - port: 4064
    name: ssl
    targetPort: 4064
  - port: 4063
    name: plain
    targetPort: 4063
  selector:
    app: omero-server
```
[Link](/docs/omero/deployments/omero-server-svc.yaml).

```
kubectl create -f omero-server-svc.yaml -n [namespace]
```

This manifest ensures, that the `omero-server` is accessible using the name `omero-server` (it is the value of the `metadata.name`). The ports in this service must match the ports from the Docker command `-p 4063:4063 -p 4064:4064`. The name can be arbitrary, but will be different for each port.

## Omero WEB

Running the `omero-server` is not enough, it does not provide a web interface. So, after some searching, we can follow the [omero-web](https://hub.docker.com/r/openmicroscopy/omero-web) description.

The Docker command is:
```
docker run -d --name omero-web \
    -e OMEROHOST=omero.example.org \
    -p 4080:4080 \
    openmicroscopy/omero-web-standalone
```

Obviously, we replace the `OMERHOST` with `omero-server` which references our service from the `omero-server`. Using the same steps as for the `omero-server`, we get the expected user id and user group:
```
xhejtman@osiris:~$ docker run -it --rm --entrypoint /bin/bash openmicroscopy/omero-web-standalone
bash-4.2$ id
uid=999(omero-web) gid=998(omero-web) groups=998(omero-web)
bash-4.2$
```

Similar to the `omero-server`, the web page states data volume: 

* `/opt/omero/web/OMERO.web/var`: The OMERO.web `var` directory, including logs

For demo purposes, the volume type `emptyDir` is sufficient. 

Now, we are able to deploy the `omero-web` [manifest](/docs/omero/deployments/omero-web.yaml).

```
kubectl create -f omero-web.yaml -n [namespace]
```

The `omero-web` should be running now. To access it from the internet, we need a Service and an Ingress -- because it is a web application. The Service is simple enabling the port from the Docker command `-p 4080:4080`:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: omero-web
spec:
  type: ClusterIP
  ports:
  - port: 4080
    name: web
    targetPort: 4080
  selector:
    app: omero-web
```

[Link](/docs/omero/deployments/omero-web-svc.yaml).

```
kubectl create -f omero-svc.yaml -n [namespace]
```

And finally the Ingress:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: omero
  annotations:
    kubernetes.io/ingress.class: nginx
    kubernetes.io/tls-acme: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
   - hosts:
       - "[omero-test].dyn.cloud.e-infra.cz"
     secretName: [omero-test]-dyn-cloud-e-infra-cz
  rules:
  - host: [omero-test].dyn.cloud.e-infra.cz
    http:
      paths:
        - pathType: Prefix
          path: "/"
          backend:
            service:
              name: omero-web
              port:
                number: 4080
```

[Link](/docs/omero/deployments/omero-web-ingress.yaml).

Replace the `[omero-test]` with your own name. The total hostname must not exceed 63 characters. The port number (`4080`) must match the service port number.

```
kubectl create -f omero-web-ingress.yaml -n [namespace]
```

You may see the `cm-acme-http-solver-` Pod running, in this case, wait until it is finished, then you can open your Omero link in the browser. Log in using the username `root` and the password from the `omero-server` deployment (the value): 
```yaml
- name: ROOTPASS
  value: omero-root-password
```

Now we are done!
