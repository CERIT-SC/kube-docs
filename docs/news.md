---
layout: article
title: News
permalink: /docs/news.html
key: news
aside:
  toc: true
sidebar:
  nav: docs
---
## January 2023

### New Features

* New Rancher UI version 2.7.0

* Kubernetes upgraded to 1.24.8 version

* New version of Jupyterhub allowing to access K8s API (it is possible to run new containers)

* New Postgresql operator available for public use [https://cloudnative-pg.io/](https://cloudnative-pg.io/)

* Ultra fast local Storage Class `zfs-csi`

* Fast shared Storage Class `beegfs-csi`

* More GPUs available including latest NVIDIA H100 Cards (80GB) and NVIDIA A100 (80GB)

* Infiniband availabe in both native via `rdma/hca` resource or as IPoverIB with secondary network interface

* It possible to request fixed network MAC address, e.g., for licencing servers

* Container registry hub.cerit.io can use mirror at Cesnet (fully automatic, images are synced)

* Jupyterhub usage statistics [https://kuba-mon.cloud.e-infra.cz/d/H5q_43FVk/jupyterhub](https://kuba-mon.cloud.e-infra.cz/d/H5q_43FVk/jupyterhub)

* Launcher from MPIOperator now waits until all workers are ready, no need to sleep/restart/fix on user side

### Fixed Bugs

* Parallel storage attaching/detaching should no more get stuck and should be reliable

### Known Issues

* Zalando Postgres operator may upgrade postgres version, mainly from 13 to 14 without upgrading data which leads to failed instance. 

  * It is recommended to fix docker image in DB resources using `dockerImage: registry.opensource.zalan.do/acid/spilo-13:2.1-p1` field.

* Default `500Mi` memory limit for postgres server is not enough if DB needs to recover after restart.
 
  * It is reommended to specify `resources` filed in DB resource and set limit to `2500Mi`.

* Deployments with `seccompProfile` fail as it is not allowed by pod security policy.
