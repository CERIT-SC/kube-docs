---
layout: article
title: Postgres Operator Cloudnative-PG
permalink: /docs/operators/postgres-cnpg.html
key: postgrescnpg
aside:
  toc: true
sidebar:
  nav: docs
---

The [Postgres Operator](https://cloudnative-pg.io/documentation/1.18/) provides easy to run PostgreSQL cluster on Kubernetes. We have provided cluster-wide Postgres Operator for easy deployment of Postgres SQL database servers. The Postgres Operator defines a kind of `Cluster` that ensures the existence of a database or database cluster. For your convenience, we provide some working examples in the next sections together with some advanced features.

The original, full documentation about PostgresOperator structure is available [on its website](https://cloudnative-pg.io/documentation/1.18/) with the official manual for creating a minimal PostgreSQL cluster located in the [quickstart section](https://cloudnative-pg.io/documentation/1.18/quickstart/). If you seek advanced configuration or description and explanation of the YAML fields, consult the official documentation.


## Deploying a Cluster Instance

It is possible to deploy either a single or cluster instance. For testing purposes, we advise to deploy a minimal (single) instance that uses NFS storage as an underlying storage and consumes limited resources (performance is low). For better availability and performance, cluster deployment can be used. In this case, multiple instances run in the cluster where one of them is a leader and others follow and sync data from the leader.

### Single Instance

In this example, a single instance with generated username and password is created. It is possible to provide a custom `Secret` object instead of an automatically generated username/password - see section **Custom Database Credentials**.

```yaml
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: test-cluster       # name, can be modified
spec:
  instances: 1             # single instance

  imageName: 'cerit.io/cloudnative-pg/postgresql:15.0'  # image to use

  primaryUpdateStrategy: unsupervised

  bootstrap:
   initdb:
     database: mydb        # db to create, can be modified
     owner: myowner        # user to create, can be modified

  storage:
    size: 10Gi
    storageClass: nfs-csi  # storage class to use, can be modified
```

Run `kubectl create -f minimal-cn.yaml -n [namespace]`, you should see a pod named `test-cluster-1` (if `metadata.name` has not been changed from the example) running in your namespace.

The minimal manifest can be downloaded [here](/docs/postgres/minimal-cn.yaml).

### Cluster Instance

To deploy the cluster version, you can download [cluster manifest](/docs/postgres/cluster-cn.yaml). The only difference is in the line denoting number of instances:

```yaml
numberOfInstances: 3
```

That requests 3 node cluster. This type of setup is resilient to node failure --- if a node running this instance fails, the database is recreated on another node, data is reconnected from NFS storage, and operations resume. On the other hand, this setup is not speed-superior even when resources are added.

*Note*: Cluster instances consume more resources and you must consider how many resources are available in your namespace/project. Cluster instance consumes `numberOfInstances * limits` of resources.


## Accessing the Database

To access the database, you need to know the credentials and the location of the database. 

### Database Credentials

If you used custom `Secret` object, use those credentials. Otherwise, issue command (`test-cluster-app` if `metadata.name` has not been changed from the example, otherwise `[metadata-name]-app`)
```shell
kubectl get secret test-cluster-app -n [namespace] -o 'jsonpath={.data.pgpass}' | base64 -d
```

It will show the string in the form: `dbhost:port:dbname:dbuser:password`. For example:
```
test-cluster-rw:5432:mydb:myowner:uLUmkvAMwR0lJtw5ksUVKihd5OvCrD28RFH1JTLbbzO6BhEAtnWJr1L0nWpTi3GL
```

Use `dbuser:password` as credentials to connect. 

### Database Access 

Database can be accessed (connected to) from the same namespace where it is deployed, a different namespace, or from outside of the Kubernetes cluster. Databases commonly use read-only connections (targeting usually replicas) and read-write connections (targeting master instances).

#### Access From the Same Namespace

If the cluster has been created with the name `test-cluster`:

```yaml
kind: Cluster
metadata:
  name: test-cluster
...
```

The hostname to use of the read-only replica is `test-cluster-ro` and the hostname of the writable master is `test-cluster-rw`. If not explicitly set otherwise, the port is well-known postgres port `5432`.

#### Access From a Different Namespace

Assuming the database name is `test-cluster`, the read-only hostname is `test-cluster-ro.[namespace].svc.cluster.local`, and the writable master is `test-cluster-rw.[namespace].svc.cluster.local`, replace `[namespace]` with the name of the namespace where the database is deployed. 

If not explicitly set otherwise, the port is well-known postgres port `5432`.

#### Access from outside of the Kubernetes Cluster

To access the database from the external world (outside the Kubernetes cluster), a new service object of type `LoadBalancer` must be created. 

If you want read-only access as well (in addition to writable access), two LoadBalancers must be created. In this case, please contact us at **k8s@ics.muni.cz**.

There is a slight difference in created objects depending on whether you are accessing the database **from Masaryk University/Masaryk University VPN** or from **anywhere else**.

##### MU/MU VPN

Assuming the database name is again `test-cluster`, the following are examples of needed services for both to and rw accesses.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: test-cluster-lb-rw
  annotations:
    metallb.universe.tf/address-pool: privmuni
spec:
  type: LoadBalancer
  ports:
  - port: 5432
    targetPort: 5432
  selector:
    cnpg.io/cluster: test-cluster # if name was changed provide [cluster-name]
    role: primary
```

The annotation `metallb.universe.tf/allow-shared-ip` ensures that both LoadBalancers share the same IP address and are distinguished by ports:
- `5433` port is for read-only replicas
- `5432` is for writable replicas

This example assigns IP addresses that are reachable **only from internal network from Masaryk University or via VPN service of Masaryk University**. 



##### Non-MU accesses

Assuming the database name is again `test-cluster`, the following are examples of needed services for both to and rw accesses.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: test-cluster-lb-rw
  annotations:
spec:
  type: LoadBalancer
  ports:
  - port: 5432
    targetPort: 5432
  selector:
    cnpg.io/cluster: test-cluster # if name was changed provide [cluster-name]
    role: primary
```

In this case, the IP addresses are allocated from the public IP pool. When accessing the database from the external world, we **strongly recommend** to setup the Network Policy.

##### Retrieve Public IP to Connect

After creating this service, the database is reachable on a public IP address that can be found via command:
```shell
kubectl get svc [name_of_loadbalancer_service_from_previous_step] -n [namespace_where_cluster_is_deployed]
```

The output will be similar to the one below where `EXTERNAL-IP` denotes IP to connect (hostname/address in pgAdmin) and `PORT` port to connect.
```shell
kubectl get svc test-cluster-external -n test-postgres-ns          
NAME                    TYPE           CLUSTER-IP    EXTERNAL-IP       PORT(S)    AGE
test-cluster-external   LoadBalancer   10.43...      147.251.X.Y       5432/TCP   21h
```

### Network Policy

To increase security, a *network policy* is used to allow network access to the database only from certain pods. The network policy is recommended in all cases mentioned above and **strongly recommended** if access from outside of the Kubernetes cluster has been set up. See [Network Policy](/docs/security.html) for general concepts.

You should restrict access from either a particular Pod or a particular external IP address. However, access from `cloudnativegp` namespace must be allowed so that the operator managing the Postgres cluster can manage the instance. 

#### Access Only from Specific Namespace Allowed

This example enables access only from the specific namespace of the Kubernetes cluster ([download here](/docs/postgres/netpolicy-internal.yaml)). Provide the cluster's name (if it was changed) as `spec.podSelector.matchLabels.cnpg.io/cluster` and replace `[namespace]` with the namespace where postgres is deployed. Other namespaces are allowed by adding more `namespaceSelector` items into the list.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: cnpg-network-policy
spec:
  podSelector:
    matchLabels:
      cnpg.io/cluster: test-cluster
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: cloudnativepg
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: [namespace]
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: [any_other_namespace]
    ...
```

#### Access Only from Specific External IP Address Allowed

This example enables access only from the specific external IP address ([download here](/docs/postgres/netpolicy-external.yaml)). Provide the cluster's name (if it was changed) as `spec.podSelector.matchLabels.cnpg.io/cluster`, replace `[namespace]` with the namespace where the cluster is deployed, and replace `[IP]/32` with your external IP `/32` (this `slash 32` part must be provided as the trailing part of the address). More IP blocks can be allowed by adding whole `ipBlock` part into the yaml.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: cnpg-network-policy
spec:
  podSelector:
    matchLabels:
      cnpg.io/cluster: test-cluster
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: cloudnativepg
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: [namespace]
    - ipBlock:
        cidr: [IP]/32
    - ipBlock:
        cidr: [another_IP]/32
```

## Data Backups

Postgres operator offers automatic backups to S3 storage implemented via periodic wal streaming and regular backups (basically `pgdump` equivalent) using `CronJobs`.

Firstly, you need to get an S3 storage account, e.g. at [DU Cesnet](https://du.cesnet.cz/en/navody/object_storage/cesnet_s3/start), particularly `KEY-ID` and `SECRET-ID` are needed. Using these two IDs, you can create a `Secret` object via [template](/docs/postgres/secret-cn.yaml), replacing `KEY-ID` and `SECRET-ID` with real values obtained from S3 account. 

To enable the backup, add the `backup` section to the cluster manifest. See [template](/docs/postgres/minimal-cn-backup.yaml), the last section `backup`.

```yaml
...
  backup:
    barmanObjectStore:
      destinationPath: "s3://[BUCKET]"
      endpointURL: "https://[S3URL]"
      s3Credentials:
        accessKeyId:
          name: aws-creds
          key: ACCESS_KEY_ID
        secretAccessKey:
          name: aws-creds
          key: ACCESS_SECRET_KEY
    retentionPolicy: "30d"
```

Replace `[BUCKET]` and `[S3URL]` with real values. **Do not replace `ACCESS_KEY_ID` and `ACCESS_SECRET_KEY`, they need to match the Secret keywords that identify the values for them.**

### Full Backups

For full backups, additional resources must be created. 

```yaml
apiVersion: postgresql.cnpg.io/v1
kind: ScheduledBackup
metadata:
  name: [backup-name]
spec:
  schedule: "0 0 0 * * *"
  backupOwnerReference: self
  cluster:
    name: [db-name]
```

Replace `[backup-name]` with the appropriate name of the resource (must be unique within a namespace), and `[db-name]` with the name of the database cluster from the main manifest, these two names must match. E.g., cluster manifest beginning with:
```yaml
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: test-cluster
```

Needs backup manifest:
```yaml
apiVersion: postgresql.cnpg.io/v1
kind: ScheduledBackup
metadata:
  name: backup
spec:
  schedule: "0 0 0 * * *"
  backupOwnerReference: self
  cluster:
    name: test-cluster
```

The schedule is **NOT** a standard `cron` schedule - this second/minutes/hours/day in month/month/day of week.

## High Availability Cluster Setup

A replicated cluster can be utilized for high-availability cases. Starting from Postgres version 11, the operator supports additional settings to increase high availability. 

1. Increase `wal` segments history using the following snippet. Change the `wal_keep_size` value as appropriate. The default value is about 500MB which might be small. However, this value is allocated from the underlying storage. If `zfs-csi` is used, it enforces disk size and DB `wals` can easily consume all disk space.
```yaml
postgresql:
    parameters:
      wal_keep_size: 64GB
```

2. Enable high availability option:
```yaml
replicationSlots:
    highAvailability:
      enabled: true
```

Keep in mind that these options work for Postgres 11 and newer only. Full cluster example with the HA options:
```yaml
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: test-cluster
spec:
  instances: 3

  imageName: 'ghcr.io/cloudnative-pg/postgresql:14.7-3'

  primaryUpdateStrategy: unsupervised

  bootstrap:
    initdb:
      database: dbname
      owner: dbowner

  postgresql:
    parameters:
      wal_keep_size: 64GB

  replicationSlots:
    highAvailability:
      enabled: true

  resources:
    requests:
      memory: "4096Mi"
      cpu: 1
    limits:
      memory: "4096Mi"
      cpu: 1

  storage:
    size: 10Gi
    storageClass: zfs-csi
```

## Local Storage vs NFS

It is possible to use local storage (SSD) instead of NFS or any network supported PVC. While it is not possible to directly request local storage in the `volume` section, it is possible to use local storage. You can download the [single instance manifest](/docs/postgres/minimal-local-cn.yaml) which can also be used for the cluster instance (set the desired `numberOfInstances`).

Basically, the `zfs-csi` storage class can be used to use local storage. Special care must be taken when setting the limit. It cannot be increased in the future and the limit is enforced, however, it is fasted storage that is offered.

## Custom Database Credentials

If you want to use custom database credentials, a `Secret` object must be created (save this yaml to `secret.yaml`)

```yaml
apiVersion: v1
kind: Secret
type: kubernetes.io/basic-auth
stringData:
  password: [password]
  username: [username]
metadata:
  name: [secret_name]
```
Run `kubectl create -f secret.yaml -n [namespace_where_postgres_will_be_deployed]`.

In the cluster manifest, change the `boostrap.initdb` section to reference the newly created secret.

```yaml
...
bootstrap:
    initdb:
      database: [database-name]
      owner: [username_from_secret]
      secret:
        name: [secret_name]
```

## Egress Network Policy

If you want to control the outgoing traffic (egress), it is necessary to allow particular ports and ipblocks - see the following example. If ingress-only restriction is suitable for you, you can remove the egress rules.

**Please note that if you want to use the data backups and also restrict the egress communication, you may need to add an egress rule enabling the communication to the backup server!** 

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: postgres-cnpg-np
spec:
  podSelector:
    matchLabels:
      # This Network Policy is applied to our Postgres CNPG Cluster resource named "test-cluster"
      cnpg.io/cluster: test-cluster
  policyTypes:
  - Ingress
  - Egress # <---
  ingress:
    # Enables ingress Postgres port for all Pods
  - ports:
    - port: 5432
      protocol: TCP
    from:
    - podSelector: {}
    # Enables ingress communication from the Postgres CNPG Operator installed in the Kubernetes
  - ports:
    - port: 8000
      protocol: TCP
    from:
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: cloudnativepg
      podSelector:
        matchLabels:
          app.kubernetes.io/name: cloudnative-pg
  egress: # <---
    # Enables egress communication to the Postgres CNPG Operator installed in the Kubernetes
  - ports:
    - port: 6443
      protocol: TCP
    to:
    - ipBlock:
        cidr: 10.43.0.1/32
    - ipBlock:
        cidr: 10.16.62.14/32
    - ipBlock:
        cidr: 10.16.62.15/32
    - ipBlock:
        cidr: 10.16.62.16/32
    - ipBlock:
        cidr: 10.16.62.17/32
    - ipBlock:
        cidr: 10.16.62.18/32
```

## Caveats

### Deploy Errors

1. If you encounter a deployment error and want to delete and recreate, **you must** make sure that the running instance is deleted before recreating. If you create a new instance too early, the instance will never be created and you will have to use a different name.

2. If you run out of quotas during the *cluster* deployment, only instances within quotas will be deployed. Unfortunately, even in this case, you cannot remove/redeploy a database using these deployments.

3. Local SSD variant is not resilient to cluster failure. Data may be lost in this case (e.g. if cluster is restored from backup, local data may not be available). Regular backups are strongly recommended.

4. It may happen that a replica fails and cannot join the cluster, in which case the replica and PVC must be removed at once using kubectl delete pod/test-cluster-1 pvc/test-cluster-1 -n [namespace]` if the failed replica is `test-cluster-1`. The replica will be rebuilt and synchronized with the rest of the cluster. However, its number will be increased.

### Images

Currently, cloudnative-pg docker images do not contain `cs_CZ` locale, so Czech collate cannot be used. For this reason, we have created two local images: `cerit.io/cloudnative-pg/postgresql:10.23-3` and `cerit.io/cloudnative-pg/postgresql:15.0` which contain Czech locales.

List of public images is available [here](https://github.com/cloudnative-pg/postgres-containers/pkgs/container/postgresql).

