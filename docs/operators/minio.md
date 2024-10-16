---
layout: article
title: MinIO Operator
permalink: /docs/operators/minio.html
key: minio
aside:
  toc: true
sidebar:
  nav: docs
---

The [MinIO Operator](https://min.io/docs/minio/kubernetes/upstream/index.html) provides easy to run MinIO Tenant on Kubernetes. We have provided cluster-wide MinIO Operator for easy deployment of MinIO S3 object storage servers. The MinIO Operator defines a kind of `Tenant` that ensures the existence of a object storage. Full documentation about its structure is available [here](https://min.io/docs/minio/kubernetes/upstream/index.html). The official manual for creating an example MinIO tenant can be found [here](https://github.com/minio/operator/blob/master/docs/examples.md). For your convenience, we provide some working examples below, divided into sections.

## Deploying a single instance

You can start with an example instance, which is suitable for testing. This example creates a resource Tenant defined by the installed Minio operator. You can download the example [here](minio-minimal-tenant.yaml).

```yaml
apiVersion: minio.min.io/v2
kind: Tenant
metadata:
  name: myminio
spec:
  ## Create configuration in the Tenant using this field. Make sure to create a secret with root credentials with the same name as in this section.
  ## Secret should follow the format used in `myminio-root-secret`.
  configuration:
    - name: myminio-root-secret
  ## Specification for MinIO Pool(s) in this Tenant.
  pools:
    ## Servers specifies the number of MinIO Tenant Pods / Servers in this pool.
    ## For standalone mode, supply 1. For distributed mode, supply 4 or more.
    ## Note that the operator does not support upgrading from standalone to distributed mode.
    - servers: 4
      ## custom pool name
      name: pool-0
      ## volumesPerServer specifies the number of volumes attached per MinIO Tenant Pod / Server.
      volumesPerServer: 2
      ## Request CPU resources
      resources:
        limits:
          cpu: 2
          memory: 2Gi
        requests:
          cpu: 100m
          memory: 512Mi
      ## This VolumeClaimTemplate is used across all the volumes provisioned for MinIO Tenant in this Pool.
      volumeClaimTemplate:
        metadata:
          name: data
        spec:
          accessModes:
            - ReadWriteOnce
          resources:
            requests:
              storage: 2Gi
      ## Configure Pod's security context
      securityContext:
        runAsNonRoot: true
        fsGroup: 1000
        runAsUser: 1000
        runAsGroup: 1000
      ## Configure container security context
      containerSecurityContext:
        runAsNonRoot: true
        privileged: false
        runAsUser: 1000
        runAsGroup: 1000
        allowPrivilegeEscalation: false
        capabilities:
          drop:
          - ALL
        seccompProfile:
          type: "RuntimeDefault"
```

This example also requires to deploy secret for the root access to the minio console. You can download the [secret example](minio-minimal-tenant-secret.yaml).
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: myminio-root-secret
type: Opaque
stringData:
  config.env: |-
    export MINIO_ROOT_USER=<root-user-name>
    export MINIO_ROOT_PASSWORD=<root-user-password>
```

Run `kubectl create -n [namespace] -f example-tenant-secret.yaml -f example-tenant.yaml`, you should see pod named `myminio-pool-0-0` (possibly similar pods depending on the configuration) running in the specified namespace.

## Minio Console Access (Tenant Administration)
You can access `myminio-console` service that is automatically created from other Pods in the Kubernetes cluster. That service works like a DNS name so you can use it as an endpoint for another applications within the Kubernetes cluster. If exposure to another namespace is required, use the full name - e.g. `myminio-console.[namespace].svc.cluster.local`.
To access the Minio console from the internet you need to configure the ingress rule. There you can define a custom hostname. You can download the [ingress example](minio-minimal-console-ingress.yaml). Adding this ingress rule will generate the appropriate secret (certificate) for your hostname and bind to `myminio-console` service within Kubernetes. There You must change `host` property in `rules` section to your own and consequently also the properties in `tls` section. **You must** change the DNS name in the ingress rule, i.e. "[myminio-console]" string to your own.  For `secretName` use the hostname where you replace dots with dashes and append `-tls`, i.e. *[myminio-console]-dyn-cloud-e-infra-cz-tls*. This secret will be generated automatically **DO NOT** generate it in advance or **DO NOT** use any existing. You can fully rely on Let's Encrypt service to obtain the correct secret (certificate). You can check the port number of `myminio-console` service by running the command `kubectl -n [namespace] get svc`, default `myminio-console` service port is 9443.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    kubernetes.io/tls-acme: "true"
    nginx.ingress.kubernetes.io/backend-protocol: HTTPS
  name: myminio-ingress-console
spec:
  ingressClassName: nginx
  rules:
  - host: [myminio-console].dyn.cloud.e-infra.cz
    http:
      paths:
      - backend:
          service:
            name: myminio-console
            port:
              number: 9443
        pathType: ImplementationSpecific
  tls:
  - hosts:
    - [myminio-console].dyn.cloud.e-infra.cz
    secretName: [myminio-console]-dyn-cloud-e-infra-cz-tls
```
## S3 Storage Access (S3 Storage Endpoint for uploading and downloading data)
To access the S3 storage from other Pods in Kubernetes cluster you can use `myminio-hl` service that is automatically created. That service works like DNS names so you can use it as endpoint for another application within the Kubernetes cluster. If exposure to another namespace is required, use the full name - e.g. `myminio-hl.[namespace].svc.cluster.local`.
To access the Minio S3 storage from the internet you need to configure the ingress rule. There you can define a custom S3 endpoint hostname. You can download the [ingress example](minio-minimal-s3endpoint-ingress.yaml). Adding this ingress rule will generate the appropriate secret (certificate) for your hostname and bind to `myminio-hl` service within Kubernetes. There You must change `host` property in `rules` section to your own and consequently also the properties in `tls` section. **You must** change the DNS name in the ingress rule, i.e. "[myminio-s3]" string to your own. For `secretName` use the hostname where you replace dots with dashes and append `-tls`, i.e. *[myminio-s3]-dyn-cloud-e-infra-cz-tls*. This secret will be generated automatically **DO NOT** generate it in advance or **DO NOT** use any existing. You can fully rely on Let's Encrypt service to obtain the correct secret (certificate). You can check the port number of `myminio-hl` service by running the command `kubectl -n [namespace] get svc`, default `myminio-hl` service port is 9000.
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    kubernetes.io/tls-acme: "true"
    nginx.ingress.kubernetes.io/backend-protocol: HTTPS
  generation: 2
  name: minio-ingress-s3
spec:
  ingressClassName: nginx
  rules:
  - host: [myminio-s3].dyn.cloud.e-infra.cz
    http:
      paths:
      - backend:
          service:
            name: myminio-hl
            port:
              number: 9000
        pathType: ImplementationSpecific
  tls:
  - hosts:
    - status:
  loadBalancer:
    ingress:
    - hostname: [myminio-s3].dyn.cloud.e-infra.cz
    secretName: [myminio-s3]-dyn-cloud-e-infra-cz-tls
```

## Network Policy

To increase security, a *network policy* can be used to allow network access to the S3 storage only from certain pods. See [Network Policy](/docs/security.html) for more information. External access, i.e. access from the public Internet, is disabled by default. However, it is possible to expose the S3 via [Load Balancer](/docs/kubectl-expose.html#other-applications).

This is an example of a NetworkPolicy applied to the Minio tenant. You can download this example [here](minio-minimal-tenant-np.yaml)
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: myminio-np
spec:
  podSelector:
    matchLabels:
      # This NetworkPolicy is applied to the `myminio` Tenant
      app: myminio
  policyTypes:
  - Egress
  - Ingress
  egress:
    # Enables egress communication to the local DNS resolver
  - to:
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: kube-system
      podSelector:
        matchLabels:
          k8s-app: kube-dns
    ports:
    - protocol: UDP
      port: 53
    # Enables egress communication to the Minio operator installed in Kubernetes.
  - to:
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
    ports:
    - port: 6443
      protocol: TCP
  ingress:
    # Enables ingress communication from any Pod to the 9000 and 9443 ports
    # for web management console access and S3 connection
  - from:
    - podSelector: {}
    ports:
    - protocol: TCP
      port: 9000
    - protocol: TCP
      port: 9443
```

This is an example of a NetworkPolicy applied to a hypothetical application. You can download this example [here](minio-minimal-application-np.yaml)
```yaml
kind: NetworkPolicy
apiVersion: networking.k8s.io/v1
metadata:
  name: myapplication-allow-s3
spec:
  podSelector:
    matchLabels:
      # This NetworkPolicy is applied to `myapplication` Pod
      app: myapplication
  policyTypes:
  - Egress
  egress:
    # Enables egress S3 communication from `myapplication` to the `myminio` Tenant
  - to:
    - podSelector:
        matchLabels:
          app : myminio
    ports:
    - protocol: TCP
      port: 9000
```
