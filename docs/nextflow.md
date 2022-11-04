---
layout: article
title: Running Nextflow Pipelines in Kubernetes
permalink: /docs/nextflow.html
key: nextflow
aside:
  toc: true
sidebar:
  nav: docs
---

The following text describes how to run [Nextflow](https://nextflow.io) pipelines in CERIT-SC Kubernetes cluster.

You need to install Nextflow on your local computer or any computer that you will start the Nextflow, the pipeline will not run on that computer it will run in Kubernetes cluster and the computer serves only for starting it. The computer does not need to be online while the pipeline is still running.

## Nextflow Installation

To install Nextflow enter this command in your terminal:
```
curl -s https://get.nextflow.io | bash
```
You can install specific Nextflow version exporting `NXF_VER` environment
variable before running the install command, e.g.:
```
export NXF_VER=20.10.0
curl -s https://get.nextflow.io | bash
```

Currently, 22.04.5 is highest available version using this method. However, you should use version 22.06.1-edge or later from github:
`https://github.com/nextflow-io/nextflow` installable as follows:
```
git clone https://github.com/nextflow-io/nextflow.git
cd nextflow
git checkout v22.06.1-edge
make compile install
```

## Architecture of Nextflow 

The Nextflow pipeline gets started by running the `nextflow` command, e.g.:

```
nextflow run hello
```

which starts `hello` pipeline. The pipeline run consists of two parts:
*workflow controller* and *workers*. The *workflow controller* manages
pipeline run while *workers* run particular tasks. 

Nextflow engine expects that the *workflow controller* and the *workers* have
access to some shared storage. On a local computer, this is usually just a
particular directory, in case of distributed computing, this has to be a
network storage such as NFS mount. User needs to specify what storage can be
used when running the Nextflow.

## Runing Nextflow in Kubernetes

In case of K8s, *workflow controller* is run as a
[Pod](https://kubernetes.io/docs/concepts/workloads/pods/) in Kubernetes
cluster. Its task is to run *worker* pods according to pipeline definition.
The *workflow controller* pod has some generated name like `naughty-williams`.
The *workers* have hashed names like `nf-81dae79db8e5e2c7a7c3ad5f6c7d59c6`.


Firstly, you must have:
- installed [`kubectl`](https://cerit-sc.github.io/kube-docs/docs/kubectl.html) with `kubeconfig` file in an expected location `$HOME/.kube/config`. 
- Kubernetes [Namespace](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) to run in (see [here](ns.html) how to know your namespace).
- created [PVC](https://kubernetes.io/docs/concepts/storage/persistent-volumes/) (see [here](pvc.html) how to do it).

### Configuration 🧩

Running a Nextflow pipeline in Kubernetes requires local configuration with some necessary content:
```
k8s {
   namespace = '[your_namespace]'
   runAsUser = 1000
   computeResourceType = 'Job'
   storageClaimName = '[name_of_created_pvc]'
   storageMountPath = '[mountpath]'
   launchDir = '[mountpath_from_storageMountPath]/[some_launchDir_path]'
   workDir = '[mountpath_from_storageMountPath]/[some_workDir_path]'
}

executor {
  queueSize = 30
}

process {
   executor = 'k8s'
   pod = [[securityContext:[fsGroupChangePolicy:'OnRootMismatch', runAsUser:1000, runAsGroup:1, fsGroup:1]], [automountServiceAccountToken:false]]
}
```

You must set the `namespace` to correct value (namespace you can access). Set the name of PVC you created as `storageClaimName`, it will serve as shared working space for nextflow. Set `storageMountPath` to any path, where you would like to connect this PVC (we advise `/mnt`). Set `launchDir` and `workDir` to point somewhere on the PVC. Take care, if running Nextflow in parallel, always use different `launchDir` and `workDir` for the parallel runs.

There are plenty of other customization options for workers or individual processes. It is possible to:
- mount another PVC or secret
- set resource requirements (cpu, memory)
- add labels or annotations
- etc.

For customizing individual processes (e.g., memory, cpu), see nextflow documentation section on [processes](https://www.nextflow.io/docs/latest/process.html). For customizing the pod itself (e.g., mount pvc) see details in [nextflow pod documentation](https://www.nextflow.io/docs/latest/process.html#pod). If you specify some configuration as 
```
process {...}
```
it will be applied to *ALL* processes and will overwrite configuration set in main `.nf` file. If you specify some configuration as 
```
process abc {...}
```
it will be applied *just* to process abc and will overwrite configuration set in main `.nf` file as well as in `process{...}`. 

### Run ⏱

To start a pipeline, you must use the `kuberun` subcommand of `nextflow`. If you use `nextflow` version 22.06.1 or later, you must add options 
```
-head-image 'cerit.io/nextflow/nextflow:22.06.1' -head-memory 4096Mi -head-cpus 1
```
These options are required just for *workflow controller pod* in our cluster. `head-memory`/`head-cpus` specify amount of memory/cpu dedicated to the controller pod  - use higher number if your pipeline is expected to generate thousands of tasks.

Example run command:
```
nextflow kuberun hello -head-image 'cerit.io/nextflow/nextflow:22.06.1' -head-memory 4096Mi -head-cpus 1 -v PVC:/mnt 
```

If you are using `nextflow` version below 22.06.1 or you get an error message informing about `head-image not known`, you must add option
```
 -pod-image 'cerit.io/nextflow/nextflow:22.06.1' 
 ```
 Example run command:
```
nextflow kuberun hello -pod-image 'cerit.io/nextflow/nextflow:22.06.1'
```

A configuration file might look as following:
```
k8s {
   namespace = 'nf-ns'
   runAsUser = 1000
   computeResourceType = 'Job'
   storageClaimName = 'pvc-nf'
   storageMountPath = '/mnt'
   launchDir = '/mnt/data1'
   workDir = '/mnt/data1/tmp'
}

executor {
  queueSize = 30
}

process {
   executor = 'k8s'
   memory = '500M' // THIS WILL BE APPLIED TO ALL WORKERS
   pod = [[label: 'hpctransfer', value: 'must'], [securityContext:[fsGroupChangePolicy:'OnRootMismatch', runAsUser:1000, runAsGroup:1, fsGroup:1]], [automountServiceAccountToken:false], [secret: 'keythings', mountPath: '/etc/secrets']] // THIS WILL BE APPLIED TO ALL WORKERS
   
   withLabel:VEP { // THIS WILL BE APPLIED ONLY TO PROCESS WITH LABEL VEP
       memory = {check_resource(14.GB * task.attempt)}
   }
   
}

process mdrun { // THIS WILL BE APPLIED ONLY TO PROCESS NAMED mdrun
  cpus 20
}
```

### Debug 🐞 
We recommend watching your namespace in Rancher GUI or on command line when you submit a pipeline. Not all problems are propagated to terminal, especially error related to Kubernetes such as quota exceeded. You can open `Jobs` tab in Rancher GUI and watch out for jobs that are `In progress` for too long or in `Error` state. Useful commands might include 

```
kubectl get jobs -n [namespace] // GET ALL JOBS IN NAMESPACE
kubectl describe job [job_name] -n [namespace] // FIND OUT MORE ABOUT JOB AND WHAT IS HAPPENING WITH IT

kubectl get pods -n [namespace] // GET ALL PODS IN NAMESPACE
kubectl describe pod [pod_name] -n [namespace] // FIND OUT MORE ABOUT POD AND WHAT IS HAPPENING WITH IT
kubectl logs [pod_name] -n [namespace] // GET POD LOGS (IF AVAILABLE)
```

If job is waiting for start for too long, try describing a job. It might reveal quota exceeded in your namespace:
```
  Warning  FailedCreate  18m    job-controller  Error creating: pods "nf-5dd9dc33d33c729b5cd57c818bafba86-lk4tl" is forbidden: exceeded quota: default-kbz9v, requested: requests.cpu=8, used: requests.cpu=16, limited: requests.cpu=20
```
If this happens to you, consider lowering problematic resource requests of workflow controller or processes that might demand a little too much. If you don't know what to do, <a href="mailto:k8s@ics.muni.cz">contact us</a> and we will come with solution together.

## Running Nextflow Hello pipeline

Download [nextflow.config](deployments/nextflow.config) which is prepared to be used as is, just hange `namespace` to correct value (namespace you can access) and specify `launchDir` and `workDir` to point somewhere on the PVC. Take
care, if running Nextflow in parallel, always use different `launchDir` and
`workDir` for the parallel runs.

You need to keep the file in the current directory where the `nextflow`
command is run and it has to be named `nextflow.config`.

To instruct the Nextflow to run the `hello` pipeline in Kubernetes, run the
following command:
```
nextflow kuberun hello -pod-image 'cerit.io/nextflow/nextflow:22.06.1' -v PVC:/mnt 
```
where PVC is name of the PVC as discussed above. It will be mounted as /mnt.
You should use this mount point as some pipelines expect this location.

If using `nextflow` version 22.06.1 or later as mentioned above, use instead:
```
nextflow kuberun hello -pod-image 'cerit.io/nextflow/nextflow:22.06.1' -head-memory 4096Mi -head-cpus 1 -v PVC:/mnt 
```

If everything was correct then you should see output like this:
```
Pod started: naughty-williams
N E X T F L O W  ~  version 22.06.1-SNAPSHOT
Launching `nextflow-io/hello` [naughty-williams] - revision: e6d9427e5b [master]
[f0/ce818c] Submitted process > sayHello (2)
[8a/8b278f] Submitted process > sayHello (1)
[5f/a4395f] Submitted process > sayHello (3)
[97/71a2e0] Submitted process > sayHello (4)
Ciao world!
Hola world!
Bonjour world!
Hello world!
```

### Caveats

* If pipeline runs for a long time (not the case of the `hello` pipeline), the `nextflow` command ends with connection terminated. This is normal and it does not mean that pipeline is not running anymore. It stops logging to your terminal only. You can still find logs of the workflow controller in Rancher GUI.

* Running pipeline can be terminated from Rancher GUI, hitting `ctrl-c` does not terminate the pipeline.

* Pipeline debug log can be found on the PVC in `launchDir/.nextflow.log`. Consecutive runs rotate the logs, so that they are not overwritten.

* If pipeline fails, you can try to resume the pipeline with `-resume` command line option, it creates a new run but it tries to skip already finished tasks. See [details](https://www.nextflow.io/blog/2019/demystifying-nextflow-resume.html).

* All runs (success or failed) will keep *workflow controller* pod visible in Rancher GUI, failed workers are also kept in Rancher GUI. You can delete them from GUI as needed.

* For some *workers*, log are not available in Rancher GUI, but the logs can be watched using the command:
    ```
kubectl logs POD -n NAMESPACE 
    ```
    where `POD` is the name of the *worker* (e.g., `nf-81dae79db8e5e2c7a7c3ad5f6c7d59c6`) and `NAMESPACE` is used namespace.

## nf-core/sarek pipeline

[nf-core/sarek](https://nf-co.re/sarek) is analysis pipeline to detect germline
or somatic variants (pre-processing, variant calling and annotation) from WGS /
targeted sequencing.

### Kubernetes Run

The Sarek requires specific
[nextflow.config](deployments/nextflow-sarek.config),
it sets more memory for a VEP process which is a part of the pipeline. With
basic settings, VEP process will be killed most probably due to memory.
It also requires specific
[custom.config](deployments/custom.config)
as the git version of the Sarek contains bug so that output stats will be
written to wrong files.

The Sarek pipeline uses functions in the pipeline configuration. However,
functions in the pipeline configuration are not currently supported by
`kuberun` executor. 

To deal with this bug, you need Nextflow version 22.06.1-edge or later.

Download
[nextflow-cfg.sh](deployments/nextflow-cfg.sh)
and
[nextflow.config.add](deployments/nextflow.config.add)
and put both on the PVC (into its root). Do not rename the files and make
`nextflow-cfg.sh` executable (`chmod a+x nextflow-cfg.sh`).

Now, if you have prepared your data on the PVC, you can start the Sarek
pipeline with the following command:
```
nextflow kuberun nf-core/sarek -head-memory 4096Mi -head-cpus 1 -head-prescript /mnt/nextflow-cfg.sh -pod-image 'cerit.io/nextflow/nextflow:22.06.1' -v PVC:/mnt --input /mnt/test.tsv --genome GRCh38 --tools HaplotypeCaller,VEP,Manta
```

where `PVC` is the mentioned PVC and `test.tsv` contains input data located on
the PVC. 

### Caveats

* It is recommended to download *igenome* from S3 Amazon location to local PVC. It rapidly speeds up `-resume` option in the case the pipeline run fails and you run it again to continue. It also mitigates Amazon overloading or network issues leading to pipeline fail. Once you download the *igenome*, just add something like `--igenomes_base /mnt/igenome` to the command line options of `nextflow`.

* If you receive error about unknown `check_resource`, then you failed with the `nextflow-cfg.sh` and `nextflow.config.add` setup.

* The pipeline run ends with stacktrace and `No signature of method: java.lang.String.toBytes()` error. This is normal and it is result of not specifying email address to send final email. Nothing to be worried about.

* The pipeline run does not clean workDir, it is up to user to clean/remove it.

* Manual resuming of Sarek is possible using different `--input` spec. See [here](https://nf-co.re/sarek/2.7.1/usage#troubleshooting).


## vib-singlecell-nf/vsn-pipelines pipeline

[vsn-pipelines](https://vsn-pipelines.readthedocs.io/en/latest/) contain multiple workflows for analyzing single cell transcriptomics data, and depends on a number of tools.

### Kubernetes Run

You need to download pipeline specific [nextflow.config](deployments/nextflow-vsn.config) and put it into the current directory where you start Nextflow from. This pipeline uses `-entry` parameter to specify entry point of workflow. Unless this [issue #2397](https://github.com/nextflow-io/nextflow/issues/2397) is resolved, patched version of Nextflow is needed. To deal with this bug, you need Nextflow version 22.06.1-edge or later.

On the PVC you need to prepare data into directories specified in the `nextflow.config` see all occurrences of `/mnt/data1` in the config and change them accordingly.

Consult [documentation](https://vsn-pipelines.readthedocs.io/en/latest/index.html) for further config options. 

You can run the pipeline with the following command:
```
nextflow -C nextflow.config kuberun vib-singlecell-nf/vsn-pipelines -pod-image 'cerit.io/nextflow/nextflow:22.06.1' -head-cpus 1 -head-memory 4096Mi -v PVC:/mnt -entry scenic
```

where `PVC` is the mentioned PVC, `scenic` is pipeline entry point, and `nextflow.config` is the downloaded `nextflow.config`.

### Caveats

* For parallel run, you need to set `maxForks` in the `nextflow.config` together with `params.sc.scenic.numRuns` parameter. Consult [documentation](https://vsn-pipelines-examples.readthedocs.io/en/latest/PBMC10k_multiruns.html).

* `NUMBA_CACHE_DIR` variable pointing to `/tmp` or other writable directory is requirement otherwise execution fails on permission denied. It tries to update readonly parts of running container.

## Using GPUs

Using GPUs in containers is straightforward, just add:
```
  accelerator = 1
```

into process section of `nextflow.config`, e.g.:
```
process {
   executor = 'k8s'

   withLabel:VEP {
      accelerator = 1
   }
}
```
