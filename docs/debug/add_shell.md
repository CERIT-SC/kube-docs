---
layout: article
title: Add shell to an image without one
permalink: /docs/addshell.html
key: addshell
aside:
  toc: true
sidebar:
  nav: docs
---

Some images do not include a shell in order to save space, however you might need one
to debug a misbihaving container. This article explains how to add a shell
into an existing image.

## Prerequisites
- Access to docker

## Adding a shell

You will need a script called `add_shell.sh`, which you can download from our [GitHub repository](https://github.com/CERIT-SC/k8s-utils/blob/main/add_shell.sh).

Now you need to start the script and provide it with the name of the image you are using. Optionally you can also specify a UID of the image user if it is not root (this is required for correct permissions of the shell). Start the script like this:

```bash
./add_shell.sh $IMAG_NAME (optional)$UID
```

The script will now create an image with the same name as the provided one, but with tag `:with-shell`. You can now run this image and `exec` into it using the added shell at `/bin/sh`.

However you will only be able to use this image locally on your computer. If you wish
to use this image in Kubernetes you will have to publish it into a docker repository
that you have write access to.
