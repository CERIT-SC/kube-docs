---
layout: article
title: ownCloud
permalink: /docs/owncloud.html
key: owncloud
aside:
  toc: true
sidebar:
  nav: docs
---

## Running ownCloud Client

If not already logged, log to [rancher.cloud.e-infra.cz](https://rancher.cloud.e-infra.cz), see [Rancher](https://cerit-sc.githu
b.io/kube-docs/docs/rancher.html) section.

Following the steps below, you can run ownCloud client application. This application is meant to share and sync data between a pod (another running application) and ownCloud server, e.g., [owncloud.cesnet.cz](https://owncloud.cesnet.cz).

### Notes

* Important prerequisite: application pod needs to use [PVC](pvc.html) in order to ownCloud client can sync data into the pod. If no PVC is used, no sync is possible.
  * For most applications here it is possible to select *persistent home* which implies using *PVC*.

### Check your Application

Select your `Namespace` (1),  navigate through `Workload` (2), `Pods` (3), and name of the application (4), e.g., `ansys-0` -- click on the name. See screenshot below.

![findpod](owncloud/findpod.png)

Click on vertical dots (1) and select Execute Shell (2). 

![enterpod](owncloud/enterpod.png)

Issue `df` command in the new *terminal area* (1) and check you see some remote file system connected to home (2) or somewhere else.

![inpod](owncloud/inpod.png)

### Select Application to Run

Ensure, you did not select any namespace and see `Only User Namespaces` (1) at the top of the Rancher page.

Navigate through `App & Marketplace` (2), `Charts` (3), limit charts only to `cerit-sc` (4) and select `ownCloud` (5). See screenshot below.

![selectapp](owncloud/selectapp.png)

### Select Version of the Application

When you click on the chart, hit `Install` to continue.

![selectversion](owncloud/selectversion.png)

### Install the Application

Now you can install the ownCloud application. In most cases, keep both `Namespace` (1) and `Name` (2) intact, however, you must select the same namespace as the Pod, from which you want transfer data, is running. The `Name` will be in URL to access the application. The `Name` must be unique in the `Namespace`, i.e., you cannot run two or more instances with the same `Name` in the same `Namespace`.  

![appinst](owncloud/appinst.png)

In the first part of the form, you select ownCloud server, for [owncloud.cesnet.cz](https://owncloud.cesnet.cz) keep default value. Fill in `username` and `password`. You can find [here](https://du.cesnet.cz/en/navody/owncloud/start#access_via_webdav_protocol) (see Access via WebDAV protocol) how to obtain those for `owncloud.cesnet.cz`. Select `PVC` that you want to sync to and from. In most cases, `PVC` containing name `home` is connected to `/home/user` while `PVC` containing name `storage` is connected to `/storage`.

Fill in `Local Directory`. This is relative directory to connected `PVC`. E.g., if you set the `Local Directory` to `owncloud-data` and select "home" `PVC`, your data is synced into `/home/user/owncloud-data`. 

Fill in `Remote Directory`, `/` means that all remote files and directories will be synced, or you can type particular directory or path from the ownCloud server such as `documents`.

![appform](owncloud/appform1.png)

### Wait for Application to Start

When you hit `Install`, you will see installation log. Once you see `SUCCESS` (see screenshot below), the application is running. 

![apphelm](owncloud/apphelm.png)

Once this application is running, you will not see anything special except data is synced.

## Delete Running Instance

If you feel you do not need the application anymore, you can delete it. Just navigate to `App & Marketplace` (1), `Installed Apps` (2), select the application (3) and hit `Delete` (4). The data in home directory is not deleted in case you check persistent home. Running the application again with the same `Name` restores access to the home directory folder.

![appdel](owncloud/appdel.png)
