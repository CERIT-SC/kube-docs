---
layout: article
title: Operator Summary
permalink: /docs/operatorsummary.html
key: operatorsummary
aside:
  toc: true
sidebar:
  nav: docs
---

The Operator pattern was developed to replace human operator who is managing a service or set of services. Operators automate taking care about repeatable tasks. More on Operator pattern can be found in official [Kubernetes documentation](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/).

Some of the things that operators automate include:
- event-driven deployments
- montioring application's state
- handling upgrades of the application code alongside related changes such as database schemas or extra configuration settings
- application deployment on-demand

Since Operators often require cluster administrator privileges, users can't deploy Operators or their own. However, it can happen that some Operators offer namespaced deployment but we strogly discourage you to do so for following reasons:
- others might like to use same Operator as well --- cluster-wide deployment would be beneficial
- you have to maintain the operator yourself
- you will most probably encounter permission issues at some point
- it can be tricky to configure Operator properly which will inevitably take your time

Instead, if you are interested in using some Operator contact us at <a href="mailto:k8s@ics.muni.cz">IT Service desk</a> and we will prepare evrything for you. When Operator is installed in cluster, you directly use `Custom Resource` (CR, [official documentation](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/)). CRs are new Kubernetes kinds defined by majority of operators. Since Operator perform specific tasks, they need different configuration options than e.g. Pod therefore Custom Resources are usually specified.

You can check various Operators at [operatorhub](https://operatorhub.io) but hub does not feature all operators out there. We recommend to use a search engine and check if there exists operator that would satisfy your needs.  
