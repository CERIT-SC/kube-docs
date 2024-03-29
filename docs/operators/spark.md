---
layout: article
title: Spark Operator
permalink: /docs/operators/spark.html
key: spark
aside:
  toc: true
sidebar:
  nav: docs
---

The [Spark Operator](https://github.com/GoogleCloudPlatform/spark-on-k8s-operator) aims to make specifying and running Spark applications as easy and idiomatic as running other workloads on Kubernetes. We have deployed cluster-wide Spark Operator that defines kinds `ScheduledSparkApplication` and `SparkApplication`, full documentation on kinds' structure is available [here](https://github.com/GoogleCloudPlatform/spark-on-k8s-operator/blob/master/docs/api-docs.md). The official and detailed user guide is available [here](https://github.com/GoogleCloudPlatform/spark-on-k8s-operator/blob/master/docs/user-guide.md).

## Important Configuration
You have to set `spec.driver.serviceAccount` to  `default`, otherwise your spark application will fail on permission issues. The Spark example feature `hostPath` as volume source but this won't work in the cluster since host mounts are forbidden. Please use `persistentVolumeClaim` instead ([examples](https://github.com/GoogleCloudPlatform/spark-on-k8s-operator/blob/master/docs/user-guide.md#mounting-volumes)) and don't forget to create [PVC](https://docs.cerit.io/docs/pvc.html#pvc).

## Other Configuration

### Spark UI

Spark UI is automatically created for your applications on HTTPS address
```
https://spark-[app_namespace].dyn.cloud.e-infra.cz/[app_namespace]/[app_name]
```
and is also visible in Rancher UI, follow the steps to see its final form. When you copy the address into the browser, omit the last character group `(/|$)(.*)` (a Rancher related issue). 

![sparkaddress](sparkaddress.png)  

When you access the path, you should be presented with dashboard similar to

![sparkdashboard](sparkdashboard.png)  

#### Custom SparkUI Ingress

If you want to provide custom annotations to Ingress (e.g. use different certificate issuer, we use `letsencrypt`) or custom TLS secret you have to include following code snippet in spark application YAML. 

```
  sparkUIOptions:
    ingressAnnotations:
      [annotation_key]: [annotation_value]
      ...
    ingressTLS: (optional section)
      - secretName: [secretname_in_app_namespace]
        hosts:
          - [host]
```

We merge the items provided by you with our configuration. If you set the same annotation as we do, your value is propagated. 



