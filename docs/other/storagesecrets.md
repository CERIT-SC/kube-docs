---
layout: article
title: Storage Secrets
permalink: /docs/other/storagesecrets.html
key: vpn
aside:
  toc: true
sidebar:
  nav: docs
---

If you want to connect your MetaCentrum home to any of the offered applications or you want to connect it to your own deployment, you have to generate a specific set of objects. To simplify the process we provide a website where you can generate either SSH secrets for accessing storage servers or directly usable PVC to access common storage `brno-12` inside our Kubernetes cluster. 

As of right now you can create 2 types of objects:
- SSH key for accessing SSHFS or to connect via SSH to one of our servers which is saved as Kubernetes Secret
- PVC representing your `brno-12` home can be directly connected

To create the objects, visit 
[https://storagesecrets.cloud.e-infra.cz/](https://storagesecrets.cloud.e-infra.cz/)

## Reuqirements before use

To use this service you **must be a part of the META kerberos realm**, simply put: you must have MetaCentrum account.

❗️In addition to being in the correct realm you also need to have your
kerberos name associated with your Rancher account. This association
should happen automatically upon login to Rancher, but is a recent
addition, so you may have to log out and back into Rancher at
[https://rancher.cloud.e-infra.cz](https://storagesecrets.cloud.e-infra.cz/).
It may take up to 5 minutes for your kerberos name to be associated
with your Rancher account, so please wait a bit before trying to access
the site again.

## Using the site

The site provides you with a form where you can select what type of object
you want to create and which server you want to access with it.

At the bottom of the site is a namespace selector, here you should select
a namespace into which the generated objects will be saved. If you don't
know what a namespace is or need a quick refresher, you can find more
information [here](http://docs.cerit.io/docs/quotas.html).

Once you press the "Submit" button your secrets are generated and
saved in your desired namespace. You can use Rancher UI to access
your secrets and view their contents.

## What to use the secrets for

You can use the Samba secret for example when launching a Matlab
application to use your home directory on storage-brno12-cerit.metacentrum.cz
as persistent storage.
