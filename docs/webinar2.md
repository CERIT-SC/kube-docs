---
layout: article
title: Sitola - Úvod do Kubernetes
permalink: /docs/webinar2.html
key: webinar
aside:
  toc: true
---
## Instalace

### kubectl

CLI nástroj na manipulaci s kubernetes: [kubectl](https://kubernetes.io/docs/tasks/tools/). Pozor, je nutné najít verzi vyšší než 1.19 a nižší než 1.23.

Přímé linky pro [Windows](https://dl.k8s.io/release/v1.21.0/bin/windows/amd64/kubectl.exe), [Linux](https://dl.k8s.io/release/v1.21.0/bin/linux/amd64/kubectl), [MacOS Intel](https://dl.k8s.io/release/v1.21.0/bin/darwin/amd64/kubectl), [MacOS Apple Silicon -- M1](https://dl.k8s.io/release/v1.21.0/bin/darwin/arm64/kubectl).

### docker

[Instrukce pro instalaci](https://docs.docker.com/get-docker/)

## Rancher

### Přihlášení

Přihlášení do webového rozhraní rancher je na adrese [https://rancher.cloud.e-infra.cz](https://rancher.cloud.e-infra.cz). Na úvodní obrazovce pokračujte kliknutím na `Log in with Shibboleth`.

![login1](webinar1/login1.png)

Následně zvolte `e-INFRA CZ AAI`

![login2](webinar2/login2.png)

Dále pak `e-INFRA CZ password`. Abyste nemuseli v dlouhém seznamu hledat, doporučujeme do políčka `Log in with` napsat `infra`. A následně vybrat `e-INFRA CZ password`.

![login3](webinar2/login3.png)

Zobrazí se výzva pro zadání jména a hesla do Metacentra. V případě, že nemáte účet v Metacentru, lze zvolit vaši domovskou instituci.

![login4](webinar2/login4.png)

Pro pokračování je třeba odsouhlasit předání údajů jako je např. vaše e-mailová adresa.

![login5](webinar2/login5.png)


Může se stát, že se zobrazí tato chybová stránka, k tomu dojde v případě, že přihlašovací proces byl příliš pomalý (např. přepínání mezi návodem a přihlašováním). Pak stačí celý proces jen zopakovat a přihlášení se již povede.

![login6](webinar1/rancher-fail.png)

### Dashboard

Po úspěšném přihlášení se zobrazí úvodní plocha. 

![dashboard](cluster.png)

Může se stát, že po přihlášení není viditelný žádný cluster, zejména `kuba-cluster`. V tomto případě počkejte cca 1 minutu a dejte obnovit stránku prohlížeče (Reload). Přebytečná okna jako `Getting Started` nebo `What do you want to see when you log in?` křížkem zavřít. 

Dále je třeba pokračovat kliknutím na `kuba-cluster`.

![dashboard1](cluster2.jpg)

Tím se dostáváte k ploše konkrétního clusteru, kde lze zobrazit přehledy, pouštět předpřipravené aplikace, atd. Šipky odkazují na stažení `kube-config` (2) a na `kubectl` konzoli (1).

![dashboard2](webinar2/rancher-kubectl.png)

### Kube-config

Dle obrázku výše je pro zpřístupnění příkazové řádky potřeba stáhnout a uložit `kube-config` soubor. Tento je potřeba na Linuxu a MacOS umístit do `HOME` do `~/.kube/config`. Na Windows do `%USERPROFILE%\.kube\config`.  Variantně lze `kube-config` uložit kamkoliv a odkazovat ho pomocí volby `--kubeconfig`, tj. např. `kubectl --kubeconfig /tmp/kube-config get pods`.

---

## Aplikace

Následuje ukázka spuštění předpřipravených aplikací jako je RStudio server.

Žádný kroků uvedených níže nelze vynechat, jde o nezbytné minimum.

Na úvod upozornění, pro aplikace se zadávají požadavky na zdroje. Jak bylo zmíněno v prezentaci, je limit 20 CPU a 40GB Memory, zadání vyšších požadavků způsobí nespuštění aplikace.

### Rstudio

V předchozí sekci bylo ukázáno jak se dostat na hlavní plochu `kuba-cluster`. Pro úspěšný začátek spuštění je nutné začít na táto ploše.

![dashboard2](kuba-cluster.png)

#### Výběr Aplikace

Prvně je třeba se ujistit, že není zvolený žádný *Namespace* (viz šipka číslo 1). Jde o dočasnou chybu Rancheru, kdy při zvoleném *Namespace* neukazuje některé položky v Menu vlevo. Následně se pokračuje v navigaci přes `Apps & Marketplace` (šipka 2) a pak `Charts` (šipka 3). Dle šipky 4 je třeba vybrat pouze `cerit-sc`, jinak se nepřehledně ukazují i ostatní nerelevantní aplikace. A nakonec se vybere samotná aplikace `rstudio-server` (viz šipka 5, skutečná poloha ikony aplikace se liší, jak aplikace přibývají). 

![selectapp](rstudio/selectapp.png)

#### Instalace Aplikace

Pod `Chart Versions` lze vybrat verzi instalační šablony. Vybereme verzi 1.3. Tato verze nijak nesouvisí s verzí RStudio serveru. Následně pokračujeme `Install`.

![selectapp](rstudio/selectversion.png)

Nyní začínáme parametrizovat instalaci a spuštění aplikace. Ve většině případů necháme vybraný *Namespace* ve tvaru `příjmení-ns` (šipka 1). Rovněž jméno aplikace lze nechat výchozí (šipka 2). Pokračujeme Next (šipka 3).

![appinst](rstudio/appinst.png)

Nyní se dostáváme k samotné parametrizaci aplikace. V první odrážce vybereme verzi R, pro vyzkoušení vybereme `R 4.0.5/Ubuntu 20.04` bez `Full` přípony. 

![appinst](rstudio/appform1.png)

V další záložce s názvem `Security` vyplníme heslo. Je vhodné se vyvarovat jednoduchých hesel a zároveň z technických důvodů je nutné nepoužívat znaky `{` a `}`. Zároveň je doporučeno zvolit heslo, které není běžně použité jinde. `Network policy` zůstane nezatrhnutá.

![appform1](rstudio/appform2.png)

V třetí záložce necháme pouze zatrženou volbu `Enable persistent home`. 

![appinst](rstudio/appform3.png)

Poslední záložku se zdroji necháme pro demo s předvyplněnými hodnotami. A pokračujeme volbou Install. 

![appform2](rstudio/appform4.png)

Zobrazí se následující překryv, kde je nutné počkat na oznámení `SUCCESS` (šipka 1). Tímto se aplikace nainstalovala a je připravena k použití. Předchozí výpis s instalací zavřeme křížkem (šipka 2).

![apphelm](rstudio/apphelm.png)

#### Přihlášení do běžící instance

Projdeme přes menu vlevo `Service Discovery` (šipka 1) do `Ingresses` (šipka 2). Pokud uvidíme řádek s názvem `cm-acme-http-solver...` (šipka 3), je třeba chvíli vyčkat dokud nezmizí (v tomto momentě se získává SSL certifikát). Následně se pokračuje kliknutím na odkaz u šipky 4. Každý uživatel má vlastní podobu odkazu. Obsahuje zvolené jméno (typicky `rstudio`) a zvolený *Namespace*. 

![appacme](rstudio/appacme.png)

Pokud vše šlo dobře, po kliknutí na zmíněný odkaz se zobrazí přihlašovací obrazovka. Zde se vyplní jméno **`rstudio`** (to je fixně přednastavené) a heslo, které bylo zadáno do formuláře při parametrizaci (to, co nemělo obsahovat znaky `{` a `}`).

![applogin](rstudio/applogin.png)

#### Použití aplikace

Po spuštění lze aplikaci začít používat např. jednoduchým `print` příkazem nebo `barplot` příkazem (červené upozornění nemá na demo vliv, při použití `Full` verze R by se nemělo zobrazit). 

![appuse](rstudio/rstudio-w2.png)

#### Smazání aplikace

Pokud aplikace již není potřeba, je vhodné ji smazat. Ze základní plochy Rancheru se pokračuje do `App & Marketplace` (šipka 1) přes `Installed Apps` (šipka 2), vybereme aplikaci (šipka 3) a následně přes `Delete` (šipka 4) smažeme. 

![appdel](rstudio/appdel.png)


## Docker Image

### Veřejné registry docker images

![docker](webinar2/docker-logo.png)[https://hub.docker.com](https://hub.docker.com)

### Naše vlastní registry přístupné přes e-INFRA AAI

![hub](webinar2/harbor.png)[https://hub.cerit.io](https://hub.cerit.io)

### Nvidia containers

![nvidia](webinar2/nvidia.png)[https://catalog.ngc.nvidia.com/containers](https://catalog.ngc.nvidia.com/containers)

### Samotné registry s možností CI/CD

![gitlab](webinar2/gitLab-logo.png)[https://gitlab.ics.muni.cz](https://gitlab.ics.muni.cz)


## Spuštění

**Prerekvizita:** nainstalované `kubectl` a stažený `kube-config`.

Spuštění existujícího image z docker hubu:
```
kubectl run -it --rm  alpine --image=alpine -n hejtmanek1-ns --overrides='{ "spec": { "securityContext": { "runAsUser": 1000 } } }'
```

Spuštění pomocí `yaml` definice, ke [stažení](webinar2/pod.yaml):
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: alpine
spec:
  containers:
  - name:  alpine
    command: [sleep, infinity]
    image: alpine
    securityContext:
      runAsUser: 1000
```

```
kubectl create -f pod.yaml -n xhejtmanek1-ns
```

Tentokrát ke kontejneru nemáme terminál.

Do běžícího kontejneru se lze dostat z UI Rancher. Kliknutím postupně na Workspace (1), Pods (2) a šipku 3.

![shell1](webinar2/shell1.png)

![shell2](webinar2/shell2.png)

![shell3](webinar2/shell3.png)

Druhá možnost přístupu do bežícího kontejneru z CLI pomocí příkazu:
```
kubectl exec --tty --stdin alpine -n hejtmanek1-ns -- /bin/sh
```

Celá tato ukázka předpokládá, že v kontejneru je nainstalovaný `shell`, což není vždy zaručené.

## Modifikace existujícího kontejneru

**Prerekvizita:** přístup k dockeru a docker registry.

### Dockerfile

Je třeba vytvořit [Dockerfile](webinar2/Dockerfile).

```
FROM ubuntu:20.04

RUN apt-get update && apt-get -y install python3 python3-pip

USER 1000
```

A následně sestavit image pomocí příkazu `docker build -t cerit.io/sitola/hejtmanek - < Dockerfile`. 

Je-li sestavení úspěšné, je potřeba vzniklý image nahrát do registry: `docker push cerit.io/sitola/hejtmanek`.

Následně lze image zkráceně spustit pomocí: `kubectl run -it --rm test --image=cerit.io/sitola/hejtmanek -n hejtmanek1-ns`

Další tipy na naší dokumentaci [https://docs.cerit.io](https://docs.cerit.io) -- sekce: Docker, GitOps.

## Vytvoření nového kontejneru

**Prerekvizita:** přístup k dockeru a docker registry, fungující `kubectl`.

Reálně jde skoro vždy o modifikaci základního kontejneru.

### Příklad s [caverdock](https://loschmidt.chemi.muni.cz/caverdock/)

[Dockerfile](webinar2/Dockerfile-caverdock)

```
FROM ubuntu:18.04

RUN apt-get update && apt-get -y install wget python xz-utils libopenmpi2 libboost-serialization1.65.1 libboost-thread1.65.1 libboost-program-options1.65.1 python-pip && pip install pylatex numpy sklearn && apt-get clean && rm -rf /var/cache/apt/* && rm -rf /root/.cache

RUN mkdir /opt/caverdock && cd /opt/caverdock && wget https://www.fi.muni.cz/~xfilipov/caverdock/caverdock-1.1-ubuntu-18.04.tar.xz -O - | tar xJf - && chown -R 1000:1000 /opt/caverdock

RUN wget http://repo.cerit-sc.cz/misc/rsh -O /usr/bin/rsh && chmod a+rx /usr/bin/rsh

USER 1000

WORKDIR /opt/caverdock/example
```

`docker build -t cerit.io/sitola/hejtmanek-caverdock - < Dockerfile-caverdock`

`docker push cerit.io/sitola/hejtmanek-caverdock`

#### Spuštění

Vytvoříme `Job` deployment, ke stažení [zde](webinar2/job.yaml).

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: caverdock
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
      - name: caverdock
        image: cerit.io/sitola/hejtmanek-caverdock
        command:
         - "mpirun"
         - "-np"
         - "4"
         - "/opt/caverdock/bin/caverdock"
         - "--config"
         - "caverdock.conf"
         - "--out"
         - "test"
         - "--log"
         - "log"
        securityContext:
          runAsUser: 1000
          runAsGroup: 1000
        resources:
          limits:
            cpu: 4
            memory: 8192Mi
```

Spustíme: `kubectl create -f job.yaml -n hejtmanek-ns` a úloha běží. 
