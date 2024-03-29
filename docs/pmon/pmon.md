---
layout: article
title: Personal Monitoring
permalink: /docs/pmon/pmon.html
key: personalmonitoring
aside:
  toc: true
sidebar:
  nav: docs
---

Sometimes you want to monitor resource usage of the Pods deployed in your namespaces. **Personal Monitoring** application allows you to do so in a few easy steps. The application creates a personal Prometheus instance that collects all metrics from your namespace and displays them in a personal Grafana instance located on web address `pmon-[namespace].dyn.cloud.e-infra.cz`.

## Installation

Start with choosing **Personal Monitoring** application from Rancher application menu.
![choose](choose.png)

After choosing, click on `Install`.
![startinstall](startinstall.png)

Click `Next`. It is not possible to change deployed chart name as there can exist only one monitoring per namespace.
![next](next.png)

Change default credentials used to authenticate into Grafana instance. Click on `Install`.
![install](install.png)

Wait until bottom panel shows `SUCCESS` and installed app shows green `Deployed`.
![success](success.png)

Now you can access your monitoring instance on `pmon-[namespace].dyn.cloud.e-infra.cz` or find the final address in `Ingress` tab.
![ingress](ingress.png)

After clicking on the link, you are redirected to your Grafana. Authenticate with credentials you put in the form.
![grafana](grafana.png)
