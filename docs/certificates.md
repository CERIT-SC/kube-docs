---
layout: article
title: Certificate
permalink: /docs/certificate.html
key: certificate
aside:
  toc: true
sidebar:
  nav: docs
---

Kubernetes can issue and manage custom trusted certificates using the ACME protocol. Certificates are stored as secrets.

This is especially important for enabling TLS when exposing non-web applications, so without Ingress.

There are currently four issuers available:
* The `letsencrypt-prod` issuer is web-only and automatically checks the web on the specified domain name during the issuance process. It is automatically used when exposing an application via [ingress](kubectl-expose.html#web-based-applications).
* The `letsencrypt-prod-dns' issuer is for other applications. The difference is the dns check. However, the dns check is slower because the dns change has to be propagated first.
* `letsencrypt-stage` is the same as `letsencrypt-prod` but uses staging servers suitable for testing.
* `letsencrypt-stage-dns' is the same as `letsencrypt-prod-dns', but it uses staging servers suitable for testing.

To issue a Kubernetes managed certificate, the following configuration can be used.

```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: application-dyn-cloud-e-infra-cz-tls
spec:
  secretName: application-dyn-cloud-e-infra-cz-tls
  issuerRef:
    group: cert-manager.io
    kind: ClusterIssuer
    name: letsencrypt-prod-dns
  dnsNames:
  - "application.dyn.cloud.e-infra.cz"
  usages:
  - digital signature
  - key encipherment
```
Where `metadata.name`, `spec.secretName` refer to the name of the generated certificate. The `spec.dnsNames` items are the target dns names of the certificate. The issuer is specified in `spec.issuerRef.name` and should be set to `letsencrypt-prod-dns`.

The configuration generates a secret, specified in `spec.secretName`, containing the certificate and private key pair.
