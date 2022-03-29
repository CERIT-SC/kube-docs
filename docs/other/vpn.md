---
layout: article
title: VPN
permalink: /docs/other/vpn.html
key: vpn
aside:
  toc: true
sidebar:
  nav: docs
---

Secure VPN is based on [WireGuard](https://www.wireguard.com/).

## Connecting to Secure VPN

### Windows

   1. Install WireGuard, download Windows installer [here](https://www.wireguard.com/install/)
   2. Create configuration file `sensitive-vpn.conf` in your personal, safe directory, e.g., `C:\Users\<username>\Documents\sensitive-vpn.conf` with content that you obtained from our team. Example of configuration file:

   ```
    [Interface]
    PrivateKey = DESKTOP_CLIENT_PRIVATE_KEY
    Address = 10.0.0.2/24

    [Peer]
    PublicKey = SERVER_PUBLIC_KEY
    Endpoint = SERVER_IP_ADDRESS:PORT
    AllowedIPs = 0.0.0.0/0
   ```
   3. Run `WireGuard` application.
   4. In the `WireGuard` application, choose `Import tunnel(s) from file` and select the `sensitive-vpn.conf` stored in the 2nd step.   
   ![wg1](./vpn_img/wg1.jpg)   
   5. In order to activate the tunnel `(1) Select the tunnel you want to activate` and `(2) Activate the tunnel`
   ![wg2](./vpn_img/wg2.jpg)
   6. Tunnel is activated, to disable tunnel use `Deactivate` button.
   ![wg3](./vpn_img/wg3.jpg)

### Linux based OS

   1. Install WireGuard, download for Linux [here](https://www.wireguard.com/install/)
   2. Create configuration file `/etc/wireguard/wg0.conf` with content that you obtained from our team.   
   Example:

   ```
    [Interface]
    PrivateKey = DESKTOP_CLIENT_PRIVATE_KEY
    Address = 10.0.0.2/24

    [Peer]
    PublicKey = SERVER_PUBLIC_KEY
    Endpoint = SERVER_IP_ADDRESS:PORT
    AllowedIPs = 0.0.0.0/0
   ```
   3. In order to activate the tunnel, enter into `terminal` and use following command:   
   ```
   wg-quick up wg0
   ```
   4. To check tunnel stats (if tunnel is active) use:
   ```
   wg-quick show
   ```
   5. To deactivate the tunnel use:
   ```
   wg-quick down wg0
   ```