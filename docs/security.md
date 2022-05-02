---
layout: article
title: Security and Network Policy
permalink: /docs/security.html
key: vmd
aside:
  toc: true
sidebar:
  nav: docs
---
## Ingress Authentication

If user wants to utilize basic auth or oauth at ingress, it can be done as described in [official documentation](https://kubernetes.github.io/ingress-nginx/examples/auth/basic/) or in [our documentation](/docs/kubectl-expose.html).

This approach has one big security flaw. Authentication is required when connecting via ingress only, e.g., from outside of Kubernetes cluster. However, user of the platform can also connect from inside cluster directly to the corresponding service (they need to guess it IP though) and in such a case, there is no authentication required.

This flaw can be mitigated using [Network Policy](https://kubernetes.io/docs/concepts/services-networking/network-policies/) that can limit origin of network traffic. In this case, it is useful to allow ingress traffic to server from *kube-system* namespace only. The *kube-system* namespace hosts Ingress Nginx instance, therefore, connection from this and only this namespace is required.

Example of network policy can be [downloaded here](deployments/netpolicy/yaml). This policy allows ingress traffic from *kube-system* to Pod named `myapp`. This policy is applied to the *namespace* where the Pod `myapp` is.

## E-infra Single Sign On (BETA)

It is possible to utilize e-infra's SSO service to secure your application. To enable this, some data must be added to the ingress.
We will show how to edit an existing ingress to include SSO.

This example represents an existing ingress:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-name
  annotations:
    kubernetes.io/ingress.class: "nginx"
    kubernetes.io/tls-acme: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
    - hosts:
        - "hostname.dyn.cloud.e-infra.cz"
      secretName: hostname-dyn-cloud-e-infra-cz-tls
  rules:
  - host: "hostname.dyn.cloud.e-infra.cz"
    http:
      paths:
      - path: /
        backend:
          service:
            name: service-name
            port:
              number: port-number
        pathType: Prefix
```

Firstly, we must add a few annotations to the ingress itself:

```diff
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-name
  annotations:
    kubernetes.io/ingress.class: "nginx"
    kubernetes.io/tls-acme: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
+   nginx.ingress.kubernetes.io/auth-url: "https://$host/oauth2/auth?allowed_emails=email1@ics.muni.cz, email2@ics.muni.cz, email3@ics.muni.cz"
+   nginx.ingress.kubernetes.io/auth-signin: "https://$host/oauth2/start?rd=$scheme%3A%2F%2F$host$escaped_request_uri"
spec:
  tls:
    - hosts:
        - "hostname.dyn.cloud.e-infra.cz"
      secretName: hostname-dyn-cloud-e-infra-cz-tls
  rules:
  - host: "hostname.dyn.cloud.e-infra.cz"
    http:
      paths:
      - path: /
        backend:
          service:
            name: service-name
            port:
              number: service-port-number
        pathType: Prefix
```

The `nginx.ingress.kubernetes.io/auth-url` annotation contains a query string
which specifies a list of users that should be able to access the website,
only change the list of emails in this field, do not change the URL in any
way.

The other annotation simply tells the ingress that it should redirect back
to the webpage after the user authenticates.

Now that the ingress is configured to use an SSO enpoint, we must configure
the SSO endpoint itself. To do this we must apply the following YAML file:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: ingress-name-oauth
spec:
  type: ExternalName
  externalName: oauth2-proxy.kube-system.svc.cluster.local
  ports:
  - name: http
    port: 4180
    protocol: TCP

---

apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-name-oauth
  annotations:
    kubernetes.io/ingress.class: "nginx"
    kubernetes.io/tls-acme: "true"
spec:
  tls:
    - hosts:
        - "hostname.dyn.cloud.e-infra.cz"
      secretName: hostname-dyn-cloud-e-infra-cz-tls
  rules:
  - host: "hostname.dyn.cloud.e-infra.cz"
    http:
      paths:
      - path: /oauth2
        backend:
          service:
            name: ingress-name-oauth
            port:
              number: 4180
        pathType: Prefix
```

Note that the `hosts` and `secretName` are the same as in the original ingress.
The only thing that needs to be changed in the file is all occurences of
`ingress-name` and `hostname`, replace them with the name of your ingress
and web page URL and apply the file.

With all the changes applied, your webiste is now secured with the
e-infra's SSO service.
