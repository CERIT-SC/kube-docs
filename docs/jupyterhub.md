---
layout: article
title: JupyterHub
permalink: /docs/jupyterhub.html
key: jupyterhub
aside:
  toc: true
sidebar:
  nav: docs
---

# JupyterHub 

It is necessary to be a **valid** member of MetaCentrum to access JupyterHub on [hub.cloud.e-infra.cz](https://hub.cloud.e-infra.cz/).

## MetaCentrum Membership
If you are already a member of MetaCentrum, you can check your membership status in [user profile](https://profile.e-infra.cz/profile/organizations), row `MetaCentrum`. If the account is expired, ask for renewal by clicking on button in the same row.

If you are not a member, you can [apply](https://metavo.metacentrum.cz/en/application/index.html) for a MetaCentrum account.

## Choosing image

We pre-prepared the following images:
- minimal-notebook ([spec](https://jupyter-docker-stacks.readthedocs.io/en/latest/using/selecting.html#jupyter-minimal-notebook))
- datascience-notebook ([spec](https://jupyter-docker-stacks.readthedocs.io/en/latest/using/selecting.html#jupyter-datascience-notebook))
- scipy-notebook ([spec](https://jupyter-docker-stacks.readthedocs.io/en/latest/using/selecting.html#jupyter-scipy-notebook))
- tensorflow-notebook ([spec](https://jupyter-docker-stacks.readthedocs.io/en/latest/using/selecting.html#jupyter-tensorflow-notebook))
- tensorflow-notebook with GPU support ([spec](https://jupyter-docker-stacks.readthedocs.io/en/latest/using/selecting.html#jupyter-tensorflow-notebook) but TF v. 2.7.0 and TensorBoard installed)
- RStudio with R 4.2.1 or 4.3.1
- Jupyter environment with Python 3.11 and R 4.3.1 kernels
- MATLAB R2022b
- MATLAB R2023a
- Alphapose

You can choose to build your own image with all dependencies and sotware you need. However, don't forget to include whole jupyter stack, otherwise the the deployment will not work. We recommend building from [existing image](https://jupyter-docker-stacks.readthedocs.io/en/latest/using/selecting.html) which already incorporates all nexessary software. If you choose custom image, you have to provide image name together with its repo and optional tag --- input text in format `repo/imagename:tag`. If you build your own image, you have to make sure repository is public. If you don't know what repository to choose, we maintain our own docker registry which you can freely use and does not require any further configuration. More information on registry is available [at a harbor site](https://docs.cerit.io/docs/harbor.html).

### Working environment

If you choose RStudio, you will be redirected to jupyter lab. It is then necessary to click on RStudio icon to be redirected to the RStudio environment. 

![rstudio](jupyterhub-images/rstudio-click.png)

![rstudio](jupyterhub-images/rstudio.png)

Other images are redirected to the `/lab` version of JupyterHub. 
![lab](jupyterhub-images/lab.png)

## Storage
By default, every notebook runs with persistent storage mounted to `/home/jovyan`. Therefore, we recommend to save the data to `/home/jovyan` directory to have them accessible every time notebook is spawned. 

If you create a new named notebook, new persistent storage is mounted to it. If you have ever created a notebook with the same name, new persistent storage is not created but old one is mounted. However, you can choose to delete existing storage which will result in losing all the data from it. Furthermore, you can choose to mount any already existing storage (to `/home/jovyan`) instead of creating a new one which enables sharing data across spawns and instances.

### MetaCentrum home
You can mount your MetaCentrum home --- check the options and select the desired home. Currently, it is possible to mount only one home per notebook. In hub, your home is located in `/home/meta/{meta-username}`.

Possibilities:

brno11-elixir | brno12-cerit | brno14-ceitec 
--- | --- | --- |
brno1-cerit | brno2 | praha1
budejovice1 | du-cesnet | praha2-natur
liberec3-tul | pruhonice1-ibot | praha5-elixir
plzen1 | plzen4-ntis | vestec1-elixir        

❗️ If you choose storage where you do NOT have a home, spawn will fail. Please, make sure you are choosing storage where your home exists. If you are not sure about home location, contact <a href="mailto:k8s@ics.muni.cz">IT Service desk</a> who will help.

## Resources
Each Jupyter notebook can request 3 types of resources --- CPU, memory, GPU --- up to the set limit. Because we want to support effective computing, we have implemented a simple shutdown mechanism that applies to each notebook instance. Please, read the mechanism description below.

#### CPU
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;You are guaranteed **1 CPU** and can request up to **32 CPU** limit. Resource limits represent a hard limit which means you can't use more than set amount for that specific instance. If computation inside notebook requires more CPUs than assigned, it will not be killed but throttled --- the computation will continue, perhaps just slower.  

#### Memory
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;You are guaranteed **4G of RAM** and can request up to **256G of RAM**. Resource limits represent a hard limit which means you can't use more than set amount for that specific instance. If computation inside notebook consumes more memory than assigned, it will be killed. The notebook will not disappear but the computation will either error or abruptly end.

#### GPU
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;It is possible to utilize GPU in your notebook, you can request whole GPU or MIG GPU.

- For whole GPU, **using GPU requires particular setting (e.g. drivers, configuration) so it can be effectively used only in images with GPU support.** (marked as `...with GPU...` in the selection menu). If you assign GPU with any other image, it will not be truly functional.

- For MIG GPU, see [NVIDIA MIG](https://www.nvidia.com/en-us/technologies/multi-instance-gpu/) documentation about MIG technology. It is possible to request up to 4 parts of 10GB MIG of NVIDIA A100/80GB card using `10GB part A100` option and up to 4 parts of 20GB MIG of NVIDIA A100/80GB card using `120GB part A100` optino. GPU memory is HW limited so there is no problem that someone else could overutilize requested amount of the resource. Individual MIG parts (up to 4) act as isolated GPUs so to utilize more than one MIG part, multi-GPU computation has to be setup in an application.


### Resource utilization
After providing JupyterHub for more than a year, we have collected enough data to safely state that most of the notebook instances request unreasonably high resource amounts that remain unused but blocked. We believe fine resource utilization is a key factor in effective computing and therefore we have implemented a simple mechanism that decides if your notebook instance will be deleted. It performs evaluations once a day.

If **at least 1 GPU** was requested, the mechanism checks GPU usage and does not care about CPU usage (GPU is a *more expensive* resource). After 2 days of <0.005 GPU usage, the notebook instance is deleted. The threshold `0.005` was chosen because this number is truly insignificant and means no usage. 

If **no GPU** was requested, the mechanism checks only CPU usage. After 7 days of <0.01 CPU usage, the notebook instance is deleted. The threshold was chosen based on data collected by monitoring --- CPU usage below 0.01 suggests that the notebook just exists and no computation is performed.

The mechanism works for both ways as following: 

> Notebook's CPU usage is measured over 24h and is calculated as the average of notebook CPU usage (in CPU seconds) over 5-minute-long segments. The final maximum is chosen from all segments. If the resulting maximum *equals to zero/under 0.01*, the notebook instance is internally marked with "1" as the first warning. If usage is above 0.01, nothing happens.
>
> Notebook's GPU usage is measured over 24h and is calculated as the average portion of time graphics engine was active over 5-minute-long segments. The final maximum is chosen from all segments. If the resulting maximum *equals to zero/under 0.005*, the notebook instance is internally marked with "1" as the first warning. If usage is above 0.005, nothing happens.
> 
>  Next run performs the same but if maximum:
>  - is still less than 0.01 for CPU (0.005 for GPU), counter is increased by one. If counter reaches `threshold+1` (e.g. for CPU, 8 as 7 days have already passed), instance is deleted.
>  - changes from under the threshold above it, the mark is completely removed (you apparently started using notebook again).
>  - is over the threshold, nothing happens.


#### Low usage notification

If the notebook is marked for deletion, you will receive an e-mail informing about the situation for every warning until instance is truly removed. You will get an e-mail informing about deletion as well. You are not forced to do anything about instance if you receive an email --- if the usage does not go up, it will be deleted. We recommend saving the results or copying them elsewhere if you receive a warning. The email is sent to the address configured in your MetaCentrum account as a preferred address.

## Named servers
JupyterHub allows spawning more than one notebook instance; actually you can run multiple instances of various images at the same time. To do so, in the top left corner, go to `File &rarr; Hub Control Panel`. Fill in the `Server name` and click on `Add new server`, you will be presented with input form page. 

![add1](jupyterhub-images/add1.png)
![add2](jupyterhub-images/add2.png)

## Conda environment
Conda is supported in all provided images and is activate using `conda init`. New conda environment terminal is created in notebook's terminal with command `conda create -n tenv --yes python=3.8 ipykernel nb_conda_kernels` (`ipykernel nb_conda_kernels` part is required, alternatively irkernel). 

![moveenv](jupyterhub-images/move_env.png)

Check if environment is installed with `conda env list`. You can use the environment right away, either by creating new notebook or changing the kernel of existing one (tab `Kernel` → `Change Kernel...` and choose the one you want to use).

![checkenv](jupyterhub-images/check_env.png)
![selenv](jupyterhub-images/select_env.png)

## Install Conda packages
To install conda packages you have to create new conda environment (as described above). Then, install new packages in terminal into newly created environment e.g. `conda install keyring -n myenv`. 

Open new notebook and change the kernel in tab `Kernel` → `Change Kernel...` → `myenv` (or the nemae of kernel you installed packages into).


## Error handling
You receive _HTTP 500:Internal Server Error_ when accessing the URL `/user/your_name`. Most likely, this error is caused by:
1. You chose MetaCentrum home you haven't used before - The red 500 Error is followed by `Error in Authenticator.pre_spawn_start`
2. You chose MetaCentrum home you don't have access to - The red 500 Error is followed by `Error in Authenticator.pre_spawn_start`
3. While spawning, `Error: ImagePullBackOff` appears

Solutions:
1. Log out and log in back
2. You can not access the home even after logging out and back in - you are not permitted to use this particular home
3. Clicking on small arrow `Event log` provides more information. Most certainly, a message tagged `[Warning]` is somewhere among all of them and it provides more description. It is highly possible the repo and/or image name is misspelled. 
 - please wait for 10 minutes
 - The service has a timeout of 10 minutes and during this time, it is trying to create all necessary resources. Due to error, creation won't succeed and after 10 minutes you will see red progress bars with message `Spawn failed: pod/jupyter-[username] did not start in 600 seconds!`. At this point, it is sufficient to reload the page and click on `Relaunch server`.

## Deleting Notebook Instance

In the top left corner, go to `File ` &rarr; `Hub Control Panel` and click red `Stop My Server`. In a couple of seconds, your container notebook instance will be deleted (stop button disapperas). If you need to spin notebook instance again, fill in the `Server name` and click on `Add new server`, you will be presented with input form page. 

All of your named server are accessible under `Hub Control panel` where you can manipulate with them (create, delete, log in to).

## Feature requests
Any tips for features or new notebook types are welcomed at <a href="mailto:k8s@ics.muni.cz">IT Service desk</a>.


