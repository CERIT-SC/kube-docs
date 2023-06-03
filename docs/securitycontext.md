---
layout: article
title: New Security Context
permalink: /docs/securitycontext.html
key: securitycontext
aside:
  toc: true
sidebar:
  nav: docs
---

Kubernetes version 1.25 is coming and we will upgrade to this version by the beginning of July 2023. Starting with this release, [PSP](https://kubernetes.io/docs/concepts/security/pod-security-policy/) is deprecated and will be removed. Instead of the PSP, [PSA](https://kubernetes.io/docs/concepts/security/pod-security-admission/) will be used. Although this change is basically a matter of Kubernetes administration and not directly related to users, there is sill a user action required.

PSP has been mutating security policy, which means that any missing security options in the deployment manifest have been injected into the manifest, and users will not notice that the manifest has been changed. The PSA is only validating policy, so any required security options must be added by the user prior to deployment.

All security options are specified in the `securityContext`. There are two security contexts: (1) Pod security context and (2) Container security context. The Pod security context is at the same level as container, the container security context is inside all containers of the Pod.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: example
spec:
  replicas: 1
  selector:
    matchLabels:
      app: example
  template:
    metadata:
      labels:
        app: example
    spec:
      securityContext: # Pod security context
        fsGroupChangePolicy: OnRootMismatch
        runAsNonRoot: true
        seccompProfile:
          type: RuntimeDefault
      containers:
      - image: ubuntu
        name: example
        securityContext: # Container security context
          runAsUser: 1000
          allowPrivilegeEscalation: false
          capabilities:
            drop:
            - ALL
```


The important new options for the Pod security context are the following:
```yaml
runAsNonRoot: true
seccompProfile:
  type: RuntimeDefault
```

`fsGroupChangePolicy: OnRootMismatch` is not required but it is strongly recommended to add so that there are no problems when attaching PVCs.

The important new options for the Container sercurity context are the following:
```yaml
allowPrivilegeEscalation: false
capabilities:
  drop:
  - ALL
```

Whithout all these important options, the deployments/daemonsets/cronjobs/jobs/pods will fail after upgrade. All options can be added now. 

If running any CERIT-SC application from the Rancher, upgrade to the latest version is required. Again, this can be done now.
