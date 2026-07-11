---
author: Massimo Lo Polito
pubDatetime: 2026-06-28T20:00:00.000Z
title: "Lupercus — le prime 24 ore di un honeypot pubblico"
slug: lupercus-launch-24h
featured: true
draft: false
tags:
  - lupercus
  - honeypot
  - threat-intelligence
  - blue-team
  - tpot
  - elk
  - suricata
description: "110.546 attacchi nelle prime 24 ore di un honeypot pubblico. Breakdown completo dei dati raccolti: concentrazione ASN, porte AI/ML sotto scan, credenziali IoT, e cosa cambia per chi difende un perimetro nel 2026."
---

Il 27 giugno 2026 ho acceso il mio primo honeypot pubblico. In 24 ore ha registrato **110.546 attacchi**. Questo writeup è il breakdown completo di cosa ho visto nei dati, cosa mi ha sorpreso e cosa ho imparato dalla prima sessione di analisi su Kibana.

---

## Cos'è Lupercus

Lupercus è un server progettato per essere attaccato. Gira su un VPS Hetzner Cloud ed espone una ventina di servizi apparentemente vulnerabili, registrando ogni tentativo di interazione. La dashboard di amministrazione vive su [honey.lupercus.cc](https://honey.lupercus.cc:64297/).

L'idea è semplice: esporre un server pubblico con servizi che sembrano veri (SSH, Telnet, FTP, SMB, HTTP, RDP, ICS/SCADA) e raccogliere telemetria reale su come operano gli scanner automatici nel 2026. Non è un lab simulato — è rumore vero del threat landscape contemporaneo.

Perché farlo:

- Per **imparare blue team su dati reali**, non sanitizzati. Un honeypot pubblico ti dà il rumore di fondo che nei lab non vedrai mai.
- Per **produrre threat intelligence riusabile**: pattern di IP, ASN, wordlist, exploit attempts che possono diventare detection rule o feed reputation.
- Per **documentare il processo di apprendimento** pubblicamente. Sono studente di medicina che si sta orientando verso cybersecurity in sanità. Pubblicare i writeup è il modo più onesto per costruire una traccia visibile di competenze hands-on.

## Lo stack tecnico

Il software di base è **T-Pot** di telekom-security — il framework di honeypot open source più maturo oggi disponibile. T-Pot orchestra via Docker una ventina di honeypot, ognuno specializzato su un protocollo:

| Honeypot | Protocollo / Funzione | Attacchi 24h |
|----------|----------------------|-------------|
| **Honeytrap** | Catch-all TCP/UDP generico | 96.000 |
| **Cowrie** | SSH e Telnet | 5.000 |
| **Sentrypeer** | VoIP / SIP | 4.000 |
| **Dionaea** | SMB, FTP, MSSQL, MySQL, SMTP | 3.000 |
| **Tanner** | Web honeypot (app vulnerabili) | 633 |
| **Adbhoney** | Android Debug Bridge | 600 |
| **RDPHoneypot** | Remote Desktop Protocol | 388 |
| **ConPot** | ICS / SCADA | 234 |
| **H0neytr4p** | HTTP trap | 196 |
| **Redishoneypot** | Redis | 112 |

Sopra tutti gira **Suricata** come IDS network-wide e lo stack **ELK** (Elasticsearch + Logstash + Kibana) per ingestione log, normalizzazione e dashboard interattive.

Hardware: VM Hetzner Cloud, 4 vCPU, 8GB RAM, 80GB SSD. Costo ~€8/mese. DNS e SSL gestiti da Cloudflare.

![Dashboard Kibana T-Pot, vista delle prime 24 ore di operatività](/assets/posts/lupercus-launch-24h/dashboard-main.png)

## I numeri delle prime 24 ore

| Metrica | Valore |
|---------|--------|
| **Attacchi totali** | 110.546 |
| **IP unici (Honeytrap)** | 3.884 |
| **Honeypot più colpito** | Honeytrap (96k — 87%) |
| **Paesi sorgenti** | 60+ |
| **Top paese** | United States |
| **IP reputation dominante** | Known attacker (~85%) |
| **Suricata CVE rilevati** | 0 (solo scan generico, niente exploit mirati) |

Due dati saltano subito all'occhio: Honeytrap domina il volume con l'87% degli attacchi totali, e **nessun CVE specifico è stato rilevato da Suricata** nelle prime 24 ore. Questo dice molto sulla natura del traffico: è scan massivo indifferenziato, non attacco mirato. I bot cercano qualsiasi porta che risponda, non vulnerabilità specifiche.

## La concentrazione su pochi ASN

Mi aspettavo distribuzione: tanti IP, tanti Autonomous System, tanti paesi. La realtà è opposta.

| Rank | AS | Owner | Country | Attacchi |
|------|-----|-------|---------|----------|
| 1 | AS23470 | ReliableSite.Net LLC | US | 82.831 |
| 2 | AS209334 | Modat B.V. | NL | 5.536 |
| 3 | AS36947 | Telecom Algeria | DZ | 2.271 |
| 4 | AS396982 | Google LLC | US | 1.989 |
| 5 | AS49870 | Alsycon B.V. | NL | 1.803 |
| 6 | AS4837 | China Unicom | CN | 1.445 |
| 7 | AS203273 | NetCrafters OU | EE | 1.132 |
| 8 | AS16276 | OVH SAS | FR | 977 |
| 9 | AS16509 | Amazon.com, Inc | US | 908 |
| 10 | AS9009 | M247 Europe SR | RO | 841 |

Il **75% del traffico totale viene da un solo ASN**: ReliableSite.Net, hosting provider statunitense. Guardando i top 10 IP individuali, 7 su 10 sono nello stesso range `104.243.x.x` — tutti appartenenti a quell'AS.

| Rank | Source IP | Attacchi |
|------|----------|----------|
| 1 | 104.243.32.126 | 11.539 |
| 2 | 185.150.191.23 | 10.371 |
| 3 | 206.221.176.60 | 8.912 |
| 4 | 104.243.35.94 | 8.756 |
| 5 | 104.243.35.120 | 8.516 |
| 6 | 104.243.35.104 | 8.136 |
| 7 | 104.243.32.235 | 7.802 |
| 8 | 104.243.43.7 | 6.441 |
| 9 | 104.243.43.19 | 5.955 |
| 10 | 209.222.101.19 | 5.482 |

Questo non è botnet residenziale distribuita. È un singolo operatore — o un piccolo gruppo coordinato — che ha noleggiato dozzine di macchine sulla stessa infrastruttura cloud per fare scan massivo. Quando una macchina viene bannata, la rinnovano in ore. Lo schema è industriale.

![Wordcloud credenziali tentate e top ASN attaccanti](/assets/posts/lupercus-launch-24h/creds-and-asn.png)

### Cosa significa per chi difende

La **geo-blocking semplice** — "blocca tutto il traffico da Cina, Russia, Iran" — è teatro di sicurezza nel 2026. Il rumore di fondo vero arriva da hosting provider commerciali in US, Olanda, Francia, Germania, Romania.

Più efficace:

- **Reputation feed a livello ASN**: AbuseIPDB, GreyNoise Trends, Spamhaus DROP, Team Cymru. Bloccare interi range di ASN noti per scan abusivo è molto più efficace che bloccare paesi.
- **Rate limiting per ASN**, non solo per IP singolo. Se un attaccante può ruotare IP nello stesso AS in pochi minuti, il rate limit per IP è inefficace.
- **Filtri sui range cloud commerciali** per servizi interni. L'admin panel della tua intranet non dovrebbe avere traffico da AWS, Hetzner, OVH, DigitalOcean.

## Le porte top attaccate — la sorpresa AI/ML

Le 5 porte di destinazione più colpite nel traffico generico (Honeytrap):

| Porta | Servizio comune | Nota |
|-------|-----------------|------|
| **6006** | TensorBoard | Dashboard di training ML |
| **8188** | ComfyUI | Interfaccia Stable Diffusion |
| **8501** | Streamlit | App dashboard Python |
| **7860** | Gradio | Interfacce Hugging Face |
| **5060** | SIP / VoIP | Protocollo telefonia IP |

Non SSH (22), non RDP (3389), non Telnet (23) nelle prime posizioni del traffico generico. Gli scanner stanno cercando **interfacce di tool AI/ML esposte senza autenticazione**.

Il razionale dell'attaccante è semplice. Developer che hanno lasciato un notebook con TensorBoard pubblico per debug, una demo Gradio "online solo per un attimo", una UI ComfyUI senza password. In molti di questi tool si possono:

- Caricare modelli arbitrari contenenti codice malevolo eseguito al load
- Eseguire codice Python lato server tramite plugin o estensioni
- Accedere a token API memorizzati nelle variabili d'ambiente del processo
- Esfiltrare dataset, prompt, output di modelli

Il pattern è chiaro: **ogni volta che una tecnologia esplode, gli scanner imparano nuove porte nel giro di mesi**. Con l'esplosione degli strumenti AI/ML nel 2024-2026, le porte 6006, 7860, 8188, 8501 sono entrate nei dizionari di scan automatico come lo erano state le porte Kubernetes API qualche anno prima.

La porta 5060 (SIP) è la coda lunga dello scan VoIP — meno sexy, ma ancora attiva e profittevole per chi cerca PBX aziendali esposti.

### Cosa fare se esponi strumenti ML

- **Autenticazione minima** (anche Basic Auth) su tutti gli endpoint
- Cambiare la porta di default — non fa miracoli ma elimina lo scan opportunistico
- **VPN, Cloudflare Tunnel, o reverse proxy autenticato** (Authelia + Caddy, Cloudflare Access)
- Mai chiavi API in variabili d'ambiente accessibili al processo del notebook
- Audit periodico delle porte aperte: un `nmap` del tuo IP pubblico una volta al mese

## Cowrie — il deep dive su SSH e Telnet

Cowrie è il honeypot specializzato per **SSH (porta 22) e Telnet (porta 23)**, e ha registrato **5.000 attacchi** nelle prime 24 ore. A differenza di Honeytrap (che cattura tutto), Cowrie simula un vero terminale Linux e registra comandi, sessioni interattive, file scaricati.

Il dato interessante di Cowrie è che la distribuzione geografica è **completamente diversa** dal traffico generico:

| Rank | Paese | Nota |
|------|-------|------|
| 1 | **Cina** | Dominante |
| 2 | **Pakistan** | Secondo |
| 3 | United States | Terzo |
| 4 | The Netherlands | — |
| 5 | Romania | — |

Mentre il traffico generico (Honeytrap) è dominato dagli USA via ReliableSite.Net, **il brute force SSH/Telnet arriva principalmente dall'Asia** — Cina e Pakistan in testa. Questo è coerente con la composizione botnet IoT: i dispositivi compromessi usati per brute force SSH sono prevalentemente router consumer, IP camera e NAS in mercati dove il firmware non viene aggiornato.

I top ASN per Cowrie confermano questa distribuzione:

| Rank | AS | Owner | Attacchi |
|------|-----|-------|----------|
| 1 | AS4837 | China Unicom | 1.342 |
| 2 | AS47890 | Unmanaged Ltd | 809 |
| 3 | AS9541 | Cyber Internet Services | 435 |
| 4 | AS197170 | TechTies Inc. | 408 |
| 5 | AS396982 | Google LLC | 251 |
| 6 | AS4134 | Chinanet | 240 |
| 7 | AS14061 | DigitalOcean, LLC | 211 |
| 8 | AS59257 | CMPak Limited | 154 |
| 9 | AS5533 | Claranet Portugal | 130 |
| 10 | AS17813 | Mahanagar Telephone | 118 |

La **differenziazione tra traffico generico e SSH-specific** è uno dei takeaway più interessanti di queste prime 24 ore. Chi fa scan massivo su porte casuali (Honeytrap) e chi fa brute force mirato su SSH sono **operatori diversi con infrastrutture diverse**.

## Le credenziali che ancora funzionano

### Username più tentati (tutte le fonti)

I dominanti nella wordcloud: **admin** e **root** sovrastano tutto il resto. Seguono: `administrator`, `user`, `dev`, `sa`, `guest`, `support`, `postgres`, `debian`, `supervisor`, `ubnt`, `Administrator`, `(blank)`, `ftpuser`, `telnet`.

Notevole: `ubnt` (Ubiquiti default), `draytek`, `keomeo`, `!!Huawei` — sono username di default di dispositivi di rete specifici. Le wordlist non sono generiche, sono **curate per vendor**.

### Password più tentate

La password dominante è **(blank)** — stringa vuota. I bot del 2026 testano ancora l'assenza totale di password come prima opzione, perché statisticamente trovano abbastanza dispositivi IoT con credenziali default.

Dopo blank: `admin`, `1234`, `password`, `123456`, `123456789`, `12345`, `qwerty`, `root`, `default`.

Password specifiche per dispositivi: `Strad123@#`, `e2008jl`, `dreambox`, `gpon`, `2010vesta`, `@HuaweiHgw`, `realtek`, `Zte521`, `hi3518`, `sp-admin`. Ognuna corrisponde al default di una famiglia di hardware specifica:

- `gpon` → router GPON fibra ottica
- `@HuaweiHgw` → Huawei Home Gateway
- `realtek` → dispositivi con chipset Realtek
- `Zte521` → ZTE router
- `hi3518` → IP camera con SoC HiSilicon
- `dreambox` → set-top box satellite

Questo profilo di credenziali dice che una parte significativa del brute force non è diretta a server — è diretta a **consumer electronics esposta su internet** con credenziali di fabbrica mai cambiate.

### Credenziali Cowrie-specific

Filtrando solo il traffico SSH/Telnet (Cowrie), le password cambiano profilo. Le dominanti diventano: `admin`, `Strad123@#`, `e2008jl`, `qwerty`, `gpon`, `2010vesta`, `123456789`, `@HuaweiHgw`, `realtek`.

Il mix è più specializzato — meno "password" e "123456" generiche, più credenziali di default di dispositivi IoT specifici. Questo è coerente con l'uso di Cowrie come target SSH: chi fa brute force su SSH sa che sta cercando device con firmware vecchio, non server con password generica.

## Distribuzione OS attaccanti

Il fingerprinting passivo **P0f** stima che la maggior parte degli attaccanti giri:

- **Linux 2.2.x-3.x** (dominante)
- Linux 3.11 and newer
- Linux 2.2.x-3.x (bare, no timestamp)
- Windows NT kernel
- Windows 7 or 8
- Linux 3.1-3.10
- Linux 2.4.x
- Mac OS X

Linux 2.2 e 3.x sono kernel del 2000-2010. Non significa che gli attaccanti usino davvero quei kernel — significa che il TCP/IP stack nei pacchetti **assomiglia** a quei kernel.

Probabile causa: dispositivi IoT compromessi che girano Linux modificato dai vendor con stack di rete arcaici. Modem, router consumer, IP camera, smart TV, NAS economici. Sono i soldati di fanteria delle botnet moderne: vengono compromessi via le credenziali default che abbiamo visto sopra, e usati come nodi di scan distribuito.

## Suricata — alert e assenza di CVE

Suricata ha generato migliaia di alert, ma **nessun CVE specifico è stato rilevato** (tabella "Suricata CVE - Top 10" completamente vuota). Questo è significativo: il traffico delle prime 24 ore è esclusivamente scan e brute force, non exploit targeting.

Le signature Suricata più frequenti:

| ID | Descrizione | Cosa significa |
|----|-------------|----------------|
| 2200122 | AF-PACKET truncated packet | Pacchetti malformati/troncati |
| 2200003 | IPv4 truncated packet | Stessa famiglia |
| 2260002 | Applayer Detect protocol only one direction | Connessioni half-open (SYN scan) |
| 2210037 | STREAM FIN recv but no session | Scan di porte senza handshake completo |
| 2260001 | Applayer Wrong direction first Data | Traffico anomalo a livello applicativo |
| 2100486 | GPL ICMP Destination Unreachable | Probe ICMP per discovery |
| 2001978 | ET INFO SSH session in progress | Sessioni SSH genuine (brute force) |

Il profilo è chiaro: **scan massivo** (pacchetti troncati, connessioni half-open, SYN scan), **probe di discovery** (ICMP unreachable), e **brute force SSH** (sessioni in progress). Nessun tentativo di exploit di vulnerabilità specifiche — almeno non nelle prime 24 ore.

Questo potrebbe cambiare con il tempo. Gli attaccanti spesso fanno scan di discovery nella prima fase, poi tornano con exploit mirati sugli host che hanno risposto. Monitorerò nei prossimi giorni se emergono CVE-specific nelle signature Suricata.

## La classificazione degli IP

La pie chart "Attacker Src IP Reputation" mostra una distribuzione netta:

- **Known attacker** (~85%) — IP già presenti in database di reputazione come fonti di attacco
- **Mass scanner** (~10%) — scanner commerciali o semi-commerciali (Shodan, Censys, simili)
- **Bot, crawler** (~5%) — bot generici, web crawler

L'85% di "known attacker" è un numero alto ma non sorprendente per un honeypot nuovo: chi scansiona internet su larga scala è già nelle blacklist da tempo. Il dato utile è che se un difensore avesse semplicemente implementato un filtro basato su AbuseIPDB o GreyNoise, avrebbe bloccato l'85% del traffico in ingresso senza toccare nulla del traffico legittimo.

## Paesi sorgenti — traffico generico vs SSH

### Traffico generico (tutti gli honeypot)

| Rank | Paese |
|------|-------|
| 1 | United States |
| 2 | Canada |
| 3 | France |
| 4 | The Netherlands |
| 5 | Algeria |
| 6 | China |
| 7 | United Kingdom |
| 8 | Pakistan |
| 9 | Germany |
| 10 | Romania |

### Traffico SSH/Telnet (Cowrie)

| Rank | Paese |
|------|-------|
| 1 | **China** |
| 2 | **Pakistan** |
| 3 | United States |
| 4 | The Netherlands |
| 5 | Romania |

La differenza è marcata. Il traffico generico è dominato dagli USA (via hosting provider commerciali). Il brute force SSH è dominato dalla Cina e dal Pakistan (via botnet IoT residenziali). Sono **due threat actor diversi con infrastrutture e obiettivi diversi** che colpiscono lo stesso honeypot.

## Cosa farò la prossima settimana

- **Recap settimanale in inglese** — sabato pubblicherò un riassunto con dataset 7 giorni e nuovi pattern
- **Aggiunta Dicompot + Medpot** — honeypot DICOM (imaging medico) e HL7 (scambi clinici) per raccogliere dati specifici sulla minaccia healthcare cybersec
- **Analisi credenziali avanzata** — clustering delle wordlist per individuare firme di botnet specifiche (varianti Mirai, dictionaries IoT-specific)
- **Monitoraggio CVE** — se Suricata inizia a rilevare exploit mirati, il profilo dell'honeypot cambia e il writeup successivo avrà contenuto molto diverso
- **Costruzione baseline statistica** — un mese di dati per stabilire "cosa è normale" e individuare anomalie reali

## Conclusioni — tre cose che ho imparato

**1. La geo-blocking è teatro.** Il 75% del traffico arriva da un hosting provider statunitense. Bloccare "paesi esotici" non tocca il rumore di fondo reale.

**2. Gli scanner hanno già imparato le porte AI/ML.** TensorBoard, Gradio, ComfyUI, Streamlit — se esponi interfacce ML su internet senza autenticazione, sei già nel dizionario di scan. Non tra un anno: adesso.

**3. SSH e Honeytrap sono due mondi diversi.** Il traffico generico e il brute force SSH hanno profili geografici, ASN e credenziali completamente diversi. Analizzarli insieme è fuorviante — vanno separati per produrre intelligence utile.

---

## Riferimenti tecnici

- **T-Pot Documentation** — [github.com/telekom-security/tpotce](https://github.com/telekom-security/tpotce)
- **Cowrie SSH Honeypot** — [github.com/cowrie/cowrie](https://github.com/cowrie/cowrie)
- **Suricata IDS** — [suricata.io](https://suricata.io)
- **AbuseIPDB** — [abuseipdb.com](https://www.abuseipdb.com)
- **GreyNoise** — [greynoise.io](https://www.greynoise.io)
- **P0f Passive OS Fingerprinting** — [github.com/p0f/p0f](https://github.com/p0f/p0f)

---

*Lupercus è un progetto personale di apprendimento blue team, parte del mio percorso verso un ruolo da SOC analyst con focus su healthcare security. Se trovi errori tecnici o vuoi discutere i risultati, scrivimi su [LinkedIn](https://www.linkedin.com/in/massimolopolito) o via email a LoPolitoMassimo@protonmail.com.*

*Recap settimanali ogni sabato. Il prossimo (5 luglio 2026) sarà in inglese.*