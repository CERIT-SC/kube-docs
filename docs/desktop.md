---
layout: article
title: Desktop
permalink: /docs/desktop.html
key: desktop
aside:
  toc: true
sidebar:
  nav: docs
---

## Running Desktop

If you are not already logged in, log in to [rancher.cloud.e-infra.cz](https://rancher.cloud.e-infra.cz), see [Rancher](https://cerit-sc.githu
b.io/kube-docs/docs/rancher.html) section.

You can run a desktop application by following the steps below. This application can have a persistent home directory, which means that if you delete the application and later reinstall the application under the same name, the contents of the home directory will be preserved. It is also possible to connect some storage from e-infra.

### Notes

* Default project had quota limit for 12 guaranteed CPUs and quota limit for 16 CPUs. Do not select more than 10 guaranteed CPUs and more than 14 CPUs limit. If you need more, just [ask](mailto:k8s@ics.muni.cz). This may be increased in the future so you can ask for more CPUs.

### Select the Application to Run

Make sure you have not selected a namespace and see `User Namespaces Only` (1) at the top of the Rancher page.

Navigate through `App & Marketplace` (2), `Charts` (3), limit charts only to `cerit-sc` (4) and select `desktop` (5). See the screenshot below.

![selectapp](desktop/selectapp.png)

### Selecting the Version of the Application

When you click on the chart, you can select the version of the application as shown below. Chart versions can vary over time. Press `Install` to continue.

![selectversion](desktop/selectversion.png)

### Installing the Application

Now you are ready to install the desktop application. In most cases you will leave both `Namespace` (1) and `Name` (2) as they are, but you can choose any namespace except `default`. The `default` namespace is available, but is not intended to be used. The `Name` will be in the URL to access the application. The `Name` must be unique in the `Namespace`, i.e. you cannot run two or more instances with the same `Name` in the same `Namespace`. If you delete the application and later reinstall it using the same `Name`, the contents of the home directory will be preserved if enabled.

![appinst](desktop/appinst.png)


In the first part of the form you select `Desktop` `Image`, currently LTS Ubuntu 18, 20, 22 are available, but images can vary in time.

![appform1](desktop/appform1.png)

In the second part of the form, select the display protocol. The default is [VNC]((https://cs.wikipedia.org/wiki/Virtual_Network_Computing)). You will need a vncview program [realvnc](https://www.realvnc.com/en/connect/download/viewer/) or `vncviewer` on most Linux distributions. On MacOS, just type `vnc://host` in the Safari browser, replacing `host` according to the instructions below. Do not press `Install` until the form is complete. When using *VNC*, only software drawing is available, no 3D acceleration is possible.

If VNC is not selected, the *WEBRTC* method will be used. This option is still in beta, but full 3D OpenGL acceleration is available.

#### Note

*WEBRTC* method is available in Chromium based web browsers such as `Google Chrome`, Microsoft Edge; or in Apple Safari. Notably, it does not work in Mozilla Firefox.

![appform2](desktop/appform2.png)

In the third part of the form you choose `password`. This password is used for VNC login. If VNC is not selected, you must also fill in `username`, these credentials will be used in the browser to connect to the *WEBRTC* session.

#### For VNC
![appform3](desktop/appform3.png)

#### For WEBRTC
![appform3-rtc](desktop/appform3-rtc.png)

In the fourth part of the form, you select whether you want a persistent home, i.e. a home that will be preserved even if you uninstall the application. Note: persistent home is bound to application name from the very beginning of the installation form. That is, if you set the name to `desktop`, the persistent home will be bound to the name `desktop`. If you select the name `desktop-0` next time, you will get a new home bound with the name `desktop-0`.

In this part you can select the **e-infra** storage to connect to the application. If you check `External Storage`, some more options will appear. You can select storage and credentials. Currently only `storage-brno12-cerit.metacentrum.cz` is supported. Username is e-infra ([metacentrum](https://metavo.metacentrum.cz/)) login and password **is not** metacentrum password, but different set by administrator, [ask](mailto:k8s@ics.muni.cz) if you need to set. We prepare more convenient way. This storage will be mounted to `/storage` directory.

![appform3](desktop/appform4.png)

In the fifth part of the form you can select requested resources. This step is optional. Minimum' CPU or RAM is a guaranteed amount of CPU and RAM, the system reserves these resources for the application. However, the application can exceed the guaranteed resources up to `Maximum`. In this case, the resources are not exclusive and can be shared with other applications. If the application exceeds `Maximum` CPU, it will be limited, if it exceeds `Maximum` RAM, it will be terminated (you will see an OOMKill report) and restarted. See note above about maximum values.

![appform4](desktop/appform5.png)

### Wait for Application to Start

When you press `Install' you will see the installation log. When you see `SUCCESS` (1) (see screenshot below), the application is running. In case of `VNC` version you can see URL that should be passed to VNC viewer (2) or in case of WebRTC version to browser (2).

#### Notes

* If entered password for storage was not correct, it will be pending indefinitely. In this case delete the application and start again.

#### VNC

![apphelm](desktop/apphelm.png)

#### WebRTC

![apphelm](desktop/apphelm-rtc.png)

### Connect to the Running Instance

Once the application is running, for *VNC* version, navigate through `Service Discovery` (1) and `Services` (2), hover with mouse over `Target` (3) and depending on the browser used, you should see the target URL (4). Chrome browser shows it in the lower left corner. This is the IP and port you need to pass to your `vncviewer` application or fill in the Safari navigation bar, e.g. `vnc://147.251.253.246`. Or just use the viewer URL from the screenshots above.

In case of *WEBRTC*, instead of `Services`, navigate to `Ingresses` (5) and you will see the full URL to click to start the *WEBRTC* connection.

The *VNC* client will ask for the password. Enter the password from the form. *WEBRTC* connection will ask for username and password, these **are not** metacentrum username and password, but the ones from the beginning of the form.

![apphelm](desktop/appservice.png)

## Desktop

At the first login the desktop will look like this, depending on the chosen version:

![appdesktop](desktop/ubuntu18.png)

## Delete Running Instance

If you feel you no longer need the application, you can delete it. Just go to `Apps & Marketplace` (1), `Installed Applications` (2), select the application (3) and press `Delete` (4). The data in the home directory will not be deleted if you select persistent home. Running the application again with the same name will restore access to the home folder.

![appdel](desktop/appdel.png)

## Installing Additional Software

It is possible to install additional software into a running desktop using either system install or `conda` system.

### System Install

The `apt-get install', `apt install' or `dpkg -i' commands can be used to install any package into the running desktop. However, if the desktop is rebooted, all installed packages are lost and must be reinstalled. All mentioned commands are shell aliases using `fakeroot` and these aliases only work in `bash`, if you are using another shell you may need to use e.g: `fakeroot apt-get install [package]`.

### Conda

We strongly recommend to use the `mamba` tool instead of `conda` as it is faster. If you set up a virtual conda environment in your home directory, everything installed with `conda` or `mamba` will be persistent. For more information, see the official conda documentation (https://conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html#managing-environments), especially `Specifying a location for an environment`.
