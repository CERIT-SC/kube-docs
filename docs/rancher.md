---
layout: article
title: Rancher
permalink: /docs/rancher.html
key: rancher
aside:
  toc: true
sidebar:
  nav: docs
---

The _Rancher_ instance is available at [rancher.cloud.e-infra.cz](https://rancher.cloud.e-infra.cz). Please log in using CESNET, ELIXIR or EGI.
After login you should see default dashboard. You should see default clusters as shown below. If no cluster is shown, please reload the page, it may take up to a minute before a cluster is shown.

The world of Rancher and Kubernetes is organized into *clusters*, *projects*, and *namespaces*. *Clusters* correspond to groups of physical nodes. *Projects* are created within *clusters*, and *namespaces* are created within *Projects*. The *Projects* are a Rancher-only concept and are not a native Kubernetes concept. [Namespaces](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) provide a mechanism to isolate groups of resources within a single cluster. Resource names must be unique within a namespace, but not across namespaces. Namespace names must be unique within a cluster. That is, it is usually not a good idea to create a namespace called *test*, and so on.

Each user is given a *Default Project* with a first and last name and a default *Namespace* called `surname-ns`. The default project and namespace are created automatically the first time the user logs in to the Rancher dashboard. Users can create additional namespaces either using the Rancher GUI in the namespace overview by pressing the `Create Namespace` button (do not use `kubectl` to create namespace). See [quota](/docs/rancher-quotas.html) for more information about creating namespaces and quotas.

Assigned clusters that you are allowed to access can be found in the upper left corner:

![clusters](cluster1.jpg)

or in the list on the home page:

![home page](cluster2.jpg)

When you select a cluster, you can see your *projects and namespaces*:

![projects and namespaces](projects.jpg)

It is possible to work with Rancher only to a certain extent. However, the command line tool `kubectl` allows more actions. You can use both ways, but we do not recommend `kubectl` for users who are not used to working in a terminal.
