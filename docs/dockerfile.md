---
layout: article
title: Dockerfile
permalink: /docs/dockerfile.html
key: desktop
aside:
  toc: true
sidebar:
  nav: docs
---
## Docker Image

Docker image is an essential part of container infrastructure. It is an image that contains an application and all its required parts (libraries and other files).

Docker image is usually created using a `Dockerfile`. The `Dockerfile` contains commands to build the image, environment variables, command to run when the container starts, entry point, and many other items.

Docker images are named using the following scheme `registry/name:tag`. If `registry` is omitted, the docker hub registry is used. An example of a docker image name is: `cerit.io/xserver:v1.0`.

Before building your own docker image, it is strongly recommended to search the public registry for an existing image that contains the desired application, but also to check what is the timestamp of the last image, i.e. if someone is making new releases and bug fixes. For example, we can recommend `bitnami` images. There are some limitations to using external docker images on our infrastructure, see [limitations](/docs/limitations.html).

## Creating your own Docker Image

If you find it necessary to create your own image, you will find a short guide below. For a complete guide, see [official docker documentation](https://docs.docker.com/develop/). Knowledge of installing Linux applications and basics of Linux packaging systems is required.

Here are the most common Dockerfile commands:

1. `FROM image` -- defines the image name to start your docker image from, e.g. `ubuntu`.
2. `RUN cmd` -- run command that changes the starting image, more than one `RUN` command can be used.
3. `COPY localfile containerfile` -- copy local files to the docker image, you can use optional `--chown=user:group` to change ownership during copying. Copying and changing ownership later using `RUN chown` is discouraged, as the resulting image will be twice as large.
4. `USER uid` -- change the user to `uid` (or name), from this line all other commands will run as the specified user, if this command is not used, everything will be done as the `root` user. The last `USER uid` directive also specifies which user the container will run as by default.
5. `CMD command` -- run `command` as the default command when the container is started.
6. WORKDIR dir` -- specifies current working directory, last working directory will be used as initial directory in a running container.

Example for Dockerfile:
```dockerfile
FROM debian:buster
RUN apt update -y && apt upgrade -y && apt install build-essential libssh-dev git -y
RUN git clone https://gitlab.con/zvon/iobench && cd iobench && make && make install
USER 1000
CMD /bin/bash -c "tail -f /dev/null"
```

## Dockerfile Tips

* Containers usually do not have a user created in `/etc/passwd`. In this case you will see the `I have no name` prompt. Also in this case there is no `home` directory which defaults to `/`, many applications fail here as `/` will not be writable. It is recommended to create a default user to run the container as. The name of the user is not important. The following command will create a group named `group` and a user named `user`, double `user` at the end of the command is not an error.
```dockerfile
RUN addgroup --gid 1000 group && \
    adduser --gid 1000 --uid 1000 --disable-password --gecos user user
```

* The container defaults to the UTC timezone. If this is not desired, it should be set to the correct default, e.g.
```dockerfile
RUN echo 'Europe/Prague' > /etc/timezone
```

* Packaging tools must not be interactive. For example, for `deb' systems:
```dockerfile
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y curl
```
Do not forget to add `-y` to most packaging tools.

* Debian family systems usually install recommended packages by default, which is not desired here, disable it:
```dockerfile
RUN apt-get install -y --no-install-recommends curl
```

* Keep the resulting image as small as possible. It is needed to clean up temporary files. For example, for `deb`:
```dockerfile
RUN apt-get update && apt-get -y install curl && apt-get clean && rm -rf /var/lib/apt/lists/*
```
for `conda`:
```dockerfile
RUN conda install package && conda clean --all -f -y && rm -rf "~/.cache
```
**Cleaning must be done within a single `RUN' command.

* Each `RUN' command creates a new Docker image layer. It is recommended to merge related commands into a single `RUN` command, for example, install all required packages at once, not one at a time.

* For Kubernetes, there is no need to use the `EXPOSE' command to publish network ports. See [Exposing Applications](docs/kubectl-expose.html).

* Running `chown` or `chmod` will double the size of the change files in the docker file, i.e. `chown` on all files in the docker file will double the size of the docker file.

* When chaining commands, always chain with `&&` and never with just `;`. If one of the commands fails, chaining with `&&` will stop the build of the whole image, which is usually what you want. Chaining with `;` can hide some failing commands and make it hard to debug why the image is not what it should be.

## Building Docker Image

### Manual Build

Once the `Dockerfile' is created, the docker image can be built. The following describes how to build a docker image manually. Manual building can be useful for debugging the build process.

To build a docker image locally, you need a machine running Linux with docker installed. To install docker, follow the instructions for your Linux distribution, usually `docker-ce` is the right package. You may need to become a member of the `docker` group to be able to use docker.

Put the `Dockerfile` in a directory, e.g. `mydocker`, and run the following, replacing `repo/name:tag` with the correct name and tag
```
docker build -t repo/name:tag mydocker
```

If the build was successful, the image is built locally and needs to be pushed to a registry. If you are not logged in to the registry, issue `docker login registry', replacing `registry' with the real registry name.
```
docker push repo/name:tag
```
The `repo/name:tag' must be exactly the same as in the build case.

### Automated Build

Automated build can be done using a CI/CD pipeline. The build is done using the *runner* component which is part of many github/gitlab installations. You can use [gitlab.ics.muni.cz](https://gitlab.ics.muni.cz), see [GitLab Containers](/docs/containers_build.html) how to do it. This gitlab also provides docker registry, so once built image can be stored here for use from Kubernetes. The registry is public or private depending on the project settings, see [GitLab Containers](/docs/containers_build.html#how-to-use-images-from-gitlab-registry).

The automated build can be slow, so it is not the best option for debugging the build process.

## Running Docker Images

It can be useful to manually run the built image before running it on Kubernetes, for example to check that all files are in place, important directories are writable, and so on. Running it manually is fast and has no privilege restrictions. However, be careful about running unknown images on your machine. To run a docker image locally, you need a Linux machine with docker installed, see manual build above.

Running locally can also be useful for inspecting the image, for example, to get the `UID` of the running user if it is not known, as the `UID` may be needed for running in Kubernetes.

For testing purposes, you can run the Docker image using:
```
docker run -it --rm registry/name:tag command
```

This command will run the `registry/name:tag` image and run the `commend` inside it. You can add `-u uid` to run the image as user `uid`.

If the image used has `ENTRYPOINT` set, the `command` will not be executed, but will only be passed as an argument to the `ENTRYPOINT` script. If you need to avoid execution, you can pass the `--entrypoint /bin/bash` option to `docker run`. However, not all images have `/bin/bash` or even `/bin/sh` available. In such a case, you will need to rebuild the image and add/install `bash` or `sh`.

Pressing `ctrl-c` or `ctrl-d` will kill the running Docker image. All changes inside the container will be lost unless you use `docker commit', see the [official docker documentation](https://docs.docker.com/develop/), in this case do not use the `--rm' option which automatically removes terminated images.
