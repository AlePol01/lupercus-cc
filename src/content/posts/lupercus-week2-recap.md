---
author: Massimo Lo Polito
pubDatetime: 2026-07-11T10:00:00.000Z
title: "Settimana 2: due milioni di attacchi e un ministro che non c'era"
slug: lupercus-week2-recap
featured: false
draft: false
tags:
  - lupercus
  - honeypot
  - threat-intelligence
  - weekly-recap
description: "Il secondo recap di lupercus.cc: due milioni di attacchi, un singolo Autonomous System che genera 313.000 richieste, e una lezione su quanto siano inaffidabili i dati di attribution."
---

Seconda settimana online. Il contatore è passato da 639.000 a due milioni di attacchi. Ma come la scorsa settimana, il numero grande non è la parte interessante. La parte interessante è chi c'è dietro e ancora di più a cosa succede quando lo si legge male.

![Dashboard lupercus settimana 2 — due milioni di attacchi](/assets/images/week2-dashboard.png)

## Un attaccante di nome... il Ministro della Giustizia rumeno?

Partiamo dalla chicca, perché è anche una lezione?

L'attaccante numero uno della settimana è un Autonomous System, AS205997, con 313.523 attacchi da solo. Nel database di registrazione delle reti (WHOIS/RIPE), quell'AS risulta intestato a un nome che coincide con quello di un politico rumeno. Facile titolare "il Ministro della Giustizia rumeno attacca il mio server", ma sarebbe falso.

Il nome nel WHOIS è l'intestatario del blocco di rete, quasi certamente un piccolo provider o rivenditore di hosting, non l'attaccante che preme i tasti. Attribuire un attacco RDP a una persona perché il suo nome compare nel WHOIS dell'ASN è un errore di attribution da manuale. I dati di registrazione delle reti sono notoriamente inaffidabili: nomi vecchi, intestazioni di comodo, informazioni mai aggiornate.

La storia vera è più interessante dell'omonimia. Quell'intero AS possiede in tutto 512 indirizzi IP, su due soli blocchi /24 (185.136.15.0/24 e 185.218.138.0/24). E i 313.000 attacchi non arrivano nemmeno da tutti e 512: si concentrano su una manciata di IP consecutivi dello stesso blocco — 185.218.138.3, .5, .16, .17, .20, .26, .28, .29; i quali martellano tutti la porta 3389 (RDP) su bersagli Windows. è una piccola farm di brute-force, otto indirizzi vicini di casa che scansionano senza sosta. Un "provider" che nella pratica è una manciata di macchine per forzare credenziali RDP.

![I soli IP del blocco 185.218.138.x che compongono l'intero AS205997](/assets/images/week2-attribution-ips.png)

## Lo stesso film della settimana scorsa, in grande

Il pattern di fondo non è cambiato rispetto al primo recap, si è solo amplificato. Due sensori dominano tutto il resto di un ordine di grandezza:

- **Honeytrap: 970.000 attacchi** — connessioni generiche su tutte le porte
- **RDPHoneypot: 941.000 attacchi** — Remote Desktop Protocol, porta 3389

Insieme fanno circa il 95% del traffico totale. Dietro di loro, a enorme distanza, Cowrie (SSH/Telnet, 166k), Dionaea (malware multi-protocollo, 52k) e Ciscoasa (51k). L'istogramma delle porte racconta la stessa storia della settimana 1: la 3389 (RDP) e la 5060 (SIP) sono presenze fisse, attive a ogni ora del giorno. Questo è il rumore di fondo permanente di qualsiasi indirizzo IP pubblico.

## Geografia: il Brasile entra in scena

![Reputazione IP, distribuzione OS, paesi e categorie Suricata](/assets/images/week2-geo-os.png)

Una novità rispetto al primo recap: il Brasile è primo tra i paesi di origine, davanti a Stati Uniti, Germania, Bulgaria e Singapore. Nella settimana 1 non era nella testa della classifica. Il grafico paese-per-porta mostra la solita specializzazione: alcuni paesi concentrano il traffico su RDP, altri distribuiscono su più porte, segno di infrastrutture botnet diverse dietro le diverse origini.

Il fingerprinting passivo del sistema operativo (P0f) conferma il quadro della settimana scorsa: dominano i kernel Linux 2.2-3.x, che non girano su server moderni ma su dispositivi embedded, parlo di router economici, videocamere IP, DVR. La maggior parte del traffico è infrastruttura IoT compromessa che scansiona in cerca di altri dispositivi da reclutare per una buona vecchia botnet.

## Suricata: qualcosa bussa più forte, e ha senso

Qui c'è un cambiamento rispetto al primo recap, dove le rilevazioni CVE erano praticamente zero. Questa settimana in cima alle firme CVE compare CVE-2022-37055 con 11 rilevazioni, seguita da alcune vecchie conoscenze del 2014 e 2020 con conteggi bassi.

CVE-2022-37055 non è una CVE a caso, ed è qui che i pezzi si incastrano. È un buffer overflow nei router D-Link Go-RT-AC750, dispositivi ormai end-of-life e senza più patch. Ricordate il fingerprinting P0f del paragrafo precedente, dominato da kernel Linux 2.2-3.x tipici dei dispositivi embedded? Ecco cosa sono: proprio quel tipo di hardware. Gli attacchi CVE che vedo non sono casuali, sono botnet di router e device IoT compromessi che scansionano internet in cerca di *altri* router vulnerabili da reclutare. Il tipo di OS che colpisce l'honeypot e il tipo di vulnerabilità che tenta di sfruttare raccontano la stessa storia: infrastruttura IoT compromessa che si autoalimenta. CISA ha aggiunto questa CVE al suo catalogo Known Exploited Vulnerabilities proprio perché sfruttata attivamente in campagne reali.

Detto questo, i conteggi restano piccolissimi rispetto ai due milioni di eventi totali, e la stragrande maggioranza degli alert Suricata resta nelle categorie di anomalia generica di protocollo: pacchetti malformati, problemi di stream TCP, retransmission. Il quadro complessivo è sempre quello: in prevalenza ricognizione e brute force, non sfruttamento di vulnerabilità. Si continua a bussare alle porte molto più di quanto si provi a scassinarle.

## Le credenziali: la solita fauna, con qualche nuovo arrivo

![Tagcloud delle credenziali tentate e tabelle di ASN, IP e firme](/assets/images/week2-credentials.png)

Come nella settimana 1, le credenziali più tentate sono vuote, username e password in bianco; il segno degli scanner che testano se un servizio risponde prima di investire in una wordlist. Dopo il vuoto, la distribuzione degli username è il solito catalogo di default: Administrator, admin, root, ubuntu, support, postgres, pi.

Sul lato password, il consueto mix di numerici banali (000000, 123456, 123456789) e default. E riappaiono le curiosità già viste: username come claude, solana, openclaw, minecraft, firedancer — qualcuno continua a scriptare ricerche di agenti AI, wallet crypto (firedancer e solana sono entrambi legati all'ecosistema Solana) e server di gioco. Compare di nuovo anche la protocol confusion: tra le password tentate su Telnet spunta "Host: 62.238.33.127:23", il segno di un bot così automatizzato da parlare HTTP a un servizio Telnet senza accorgersene.

## Cosa portarsi a casa dalla settimana 2

**L'attribution è difficile e i dati grezzi ingannano.** Il caso del "ministro rumeno" è il promemoria migliore: un nome nel WHOIS non è un colpevole, un intero Autonomous System può ridursi a otto IP vicini su 512, e prendere i dati di registrazione alla lettera porta a conclusioni sbagliate. La threat intelligence seria parte dal dubitare del dato grezzo.

**Il pattern è stabile, e questo è esso stesso un dato.** Due settimane, stesso identikit: RDP e SIP dominano, un singolo attore genera ondate sproporzionate, il grosso è commodity scanning da IoT compromesso. La stabilità del pattern è ciò che permette a un difensore di sapere cosa aspettarsi.

**Esporre RDP nudo su internet resta un suicidio statistico.** Quasi un milione di attacchi in una settimana su un solo sensore RDP. Se hai un desktop remoto raggiungibile da internet senza VPN, senza MFA, con credenziali deboli, non è questione di *se* verrà forzato, ma di *quando*.

---

*I dati della settimana 2 coprono il periodo 5-11 luglio 2026. Tutti i dati sono raccolti da T-Pot (telekom-security) su Hetzner Cloud. Prossimo recap: sabato 18 luglio.*
