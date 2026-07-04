---
author: Massimo Lo Polito
pubDatetime: 2026-07-05T10:00:00.000Z
title: "Week One: 639,000 Knocks, Almost No Lock-Picking"
slug: lupercus-week1-recap
featured: false
draft: false
tags:
  - lupercus
  - honeypot
  - threat-intelligence
  - weekly-recap
description: "Seven days of data from a public cloud honeypot: a gold rush that stopped, two thirds of traffic chasing RDP and SIP, one IP generating 37,000 attacks, and bots speaking HTTP to a Telnet server."
---

The first week is in. Seven days, 639,000 recorded attack events, sixteen honeypot sensors listening. Here is what the data actually says.

## The Number That Matters Less

639k sounds large. It is not particularly meaningful on its own. The number that tells the real story is the one next to it on the Kibana dashboard: **unique source IPs**, which runs nearly flat against the attack volume curve. A small number of machines is generating an enormous number of requests. This is not an army. It is automation, scaled.

The top autonomous system alone — **AS23470, ReliableSite.Net LLC** — accounts for 84,066 events. Second place, **IONOS SE (AS8560)**, sits at 47,030. Third is **AS205997, attributed to Vlad Cojuhari**, with 37,322 — a count that maps exactly to a single source IP: **185.218.138.28**. One address, one hosting provider fragment, 37,000 requests in seven days. The entire top-ten ASN list reads like a catalog of bulletproof or low-oversight hosters.

## The Gold Rush That Stopped

The launch post documented a spike in the first 24 hours driven by a single actor hunting AI-adjacent ports: TensorBoard on 6006, ComfyUI on 8188, Gradio on 7860, Streamlit on 8501. That campaign came almost entirely from AS23470, which logged 82,831 events in day one.

By the end of the week, AS23470 sat at 84,066 total. The AI-tool ports dropped out of the weekly top five entirely. The scan ran, found nothing useful, and moved on. This is a meaningful observation: **targeted opportunistic campaigns are short-lived and goal-oriented**. When the target surface does not yield, the scanner reallocates.

## What Replaced It: The Background Noise of the Internet

With the AI-hunt over, the steady-state traffic became visible. Two honeypot categories dominate everything else by an order of magnitude:

- **Honeytrap: 221,000 events** — a low-interaction sensor catching generic connection attempts across all ports
- **RDPHoneypot: 205,000 events** — Windows Remote Desktop Protocol, port 3389

Together they account for roughly two thirds of all traffic. Behind them, **Sentrypeer at 80,000** (VoIP/SIP, port 5060) and **Dionaea at 73,000** (a multi-protocol malware trap catching SMB, HTTP, FTP and others).

The port histogram tells the same story: 3389 and 5060 are permanent fixtures, running at volume every hour of every day. This is not a campaign. This is the baseline condition of any publicly routable IP address in 2026.

## Geographic Specialization

The country-and-port breakdown reveals something more interesting than raw origin counts. **Germany** traffic skews heavily toward port 5060 — SIP brute force aimed at VoIP infrastructure. **Azerbaijan** traffic concentrates almost entirely on port 3389 — RDP credential stuffing. The United States shows a mixed profile across ports, consistent with distributed botnet infrastructure rather than a single campaign.

Top source countries by volume: United States, Germany, Azerbaijan, The Netherlands, Bangladesh, with Canada, Taiwan, France, Vietnam, and the Philippines rounding out the top ten. The geographic spread matters less than the port specialization: whoever is operating these scanners has segmented their tooling by target type.

## OS Fingerprinting: Mostly Ghosts

P0f passive OS fingerprinting produces a distribution that should not be surprising but is still striking. The dominant identified fingerprint is **Linux 2.2.x–3.x (bare-metal)**, followed by generic Linux 2.2.x–3.x. Windows NT kernel variants appear, as do Windows 7/8 signatures. Linux 3.11 and newer — the kernel version range of most modern systems — is a small slice.

The old Linux kernels are not running on servers or workstations. They are the kernel version range of embedded devices: cheap routers, IP cameras, DVRs, industrial controllers. The traffic is largely **IoT botnet infrastructure**, recruited devices scanning for more recruitable devices.

## Suricata: 639,000 Events, 2 CVE Hits

The IDS numbers put everything in context. Out of 639,000 events, Suricata logged **2 matches against CVE signatures** — a single CVE ID in the top-ten list, count 2. Everything else falls into generic protocol anomaly categories: AF-PACKET truncated packets, IPv4 truncated packets, TCP stream issues, ICMP unreachables.

The dominant Suricata category is **Generic Protocol Command Decode**, followed by **Misc Activity** and **Not Suspicious Traffic**. The alert category histogram is flat and rhythmic, not spiked. There is no exploitation attempt pattern visible. This is reconnaissance and credential stuffing: **door-knocking, not lock-picking**.

The CVE finding deserves a separate note when the full CVE ID becomes readable in the next data pull.

## Credential Intelligence

The Cowrie SSH/Telnet honeypot and the other credential-capturing sensors produced the most operationally interesting output of the week.

**Blank credentials are the dominant category** — both username and password. This reflects automated scanners testing whether a service responds at all before investing in a wordlist. After blank, the username distribution looks like a vendor default catalog: `Administrator`, `admin`, `root`, `ubuntu`, `support`, `pi`, `supervisor`, `ubnt`.

The password side is a mix of trivial numerics (`000000`, `666666`, `123456789`) and vendor-specific defaults. Two stand out as indicators of targeted IoT hunting:

- **`7ujMko0admin`** — the factory default for Dahua IP cameras
- **`hi3518`** — tied to HiSilicon HI3518 chip-based cameras, a common DVR and IP camera SoC

Both confirm that a portion of the scanning is purpose-built to recruit surveillance hardware into botnets.

The credential data also contains evidence of **protocol confusion**: usernames include `GET / HTTP/1.1`, `OPTIONS rtsp://example.com RTSP/1.0`, `Accept-Encoding: gzip`, and raw hex sequences (`b'\xcc\xd1\xd1\xca'`). These are bots so aggressively automated that they throw HTTP or RTSP handshakes at whatever port responds, regardless of the underlying service. A Telnet listener receives an HTTP request because the scanner does not check first.

Finally, the username cloud includes `claude`, `solana`, `minecraft`, and `openclaw`. Someone is scripting searches for AI agents, crypto wallet infrastructure, and game servers alongside the standard credential lists.

## Takeaways After Week One

Three things are clear from the first seven days:

**Exposure is immediate and permanent.** There is no grace period on a public IP. The first scan hit within seconds of the server going live. RDP and SIP surfaces receive sustained brute-force traffic every hour, not periodically.

**Volume does not indicate sophistication.** The highest-volume actor ran a coherent campaign, did not find what it wanted, and stopped. The bulk of ongoing traffic is commodity scanning from compromised IoT devices. Two CVE exploitation attempts in 639,000 events is a ratio that should calibrate expectations about the actual threat level facing a correctly hardened target.

**Default credentials remain the primary vector.** The wordlists in use are not sophisticated. `7ujMko0admin`, `admin`, `1234`, `gpon`. The attack surface for default credentials is enormous because shipped firmware defaults never change. Every device with a vendor-default password and a public IP is a node in someone's botnet.

---

*Week 1 data covers 28 June – 4 July 2026. All data collected by T-Pot (telekom-security) running on Hetzner Cloud, accessible via Cloudflare Tunnel. Next recap: Saturday 11 July.*
