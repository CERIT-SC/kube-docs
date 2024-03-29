---
layout: article
title: Requesting a Project, Access Control
permalink: /docs/reqproj.html
key: requestproj
aside:
  toc: true
sidebar:
  nav: docs
---

In Kubernetes cluster we differentiate between 2 types of projects:
- individual project
- group project

Everybody who signs into the [Rancher instance](rancher.cloud.e-infra.cz) is assigned his/her default individual project (more information [here](https://docs.cerit.io/docs/rancher.html)) with default quotas described [here](https://docs.cerit.io/docs/quotas.html). 

To access projects in Rancher, you must be a valid member of MetaCentrum. If you are not a member of MetaCentrum, registration form is available [here](https://metavo.metacentrum.cz/en/application/index.html).

## Requesting Group Project
We are preparing a convenient request form, it will be available at this page when ready. In the meantime, if you need a group project, you have to contact us at  <a href="mailto:k8s@ics.muni.cz">k8s@ics.muni.cz</a>. By default, group project is assigned (and so its namespace) 12 CPU *request* 64 CPU *limit* and  40GB RAM *request* 256GB RAM *limit*. 

### Use Existing Group for Access Control
If you already have a group in **perun.e-infra.cz**, please include the group's VO in the email. If the group is in VO e-infra.cz, include the group's ID as well.

Other required information:
- name of the new project
- desired resource quota (not necessary if the default is enough)
- the person responsible for the project (name + UCO)

❗️ **Access control = assigning the group** is the responsibility of the requestor - you - according to the [tutorial below](#access-control)

### No Group Yet for Access Control
If you don't have a group, we will create it for you. Please include information "create a new group for a Rancher project".

Other required information:
- name of the new project
- desired resource quota (not necessary if the default is enough)
- the person responsible for the project (name + UCO)


## Access Control
We need the name of responsible person for project access control. It is up to you (or selected person from your group) to manage people allowed to access the project. Even if you know name of the existing group you would like to use from Perun, you have to assign it yourself. Once the Perun resource is prepared, a responsible person is assigned an administrator role on this resource which means the person can add other people as administrators, assign allowed groups on the resource or add members. 

The most widespread way of access control is assigning a group containing several members on Perun resource. Below we provide a tutorial on how **an administrator** (a person you chose to be an administrator in the email) can assign such group.

1. Log into [CESNET Perun](https://perun.aai.cesnet.cz).
2. Scroll on the home page until you see table `Manager in Resources`.
![manager](request-project-images/manager.png)
3. Click on the resource with same name as the requested project name.
4. Click on `Assigned Groups`.
![manager](request-project-images/assign_button.png)
5. Click on `Assign Groups`, write groupname into the search bar and select desired group.
![manager](request-project-images/assign_group.png)
6. Click `Next`, leave all options as they are and click `Assign group`. 
7. It takes 5-10 minutes to propagate the change so you have to wait for a bit. After 10 minutes, the change should be propagated so you can log out and back into Rancher or just refresh the page. You (and all group  members) should now see the project.

❗️ Don't forget administrator needs to be member of the group as well to have access to the project/service ❗️

## Requesting Larger Individual Project
We are preparing a convenient request form, it will be available at this page when ready. In the meantime, if you need a larger project for your own use, you have to contat us at <a href="mailto:k8s@ics.muni.cz">k8s@ics.muni.cz</a>.

In your email, please include following information:
- name of the new project
- desired resource quota 
