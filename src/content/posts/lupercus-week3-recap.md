---
author: Massimo Lo Polito
pubDatetime: 2026-07-18T10:00:00.000Z
title: "Week Three: A Million Attacks and a Revolving Door of Attackers"
slug: lupercus-week3-recap
featured: false
draft: false
tags:
  - lupercus
  - honeypot
  - threat-intelligence
  - weekly-recap
description: "Third week of lupercus.cc data: 1 million attacks, a completely new top-10 attacker list, a Cisco ASA surge, and Ripple20 IoT vulnerabilities showing up in the wild."
---

Third week. One million attacks, sixteen sensors, and a pattern that is becoming clearer with each seven-day snapshot. But the most interesting thing this week is not what happened — it is what *stopped* happening.

![Lupercus week 3 — main dashboard showing 1 million attacks](/assets/images/week3-dashboard.png)

## The Revolving Door

Three weeks in, we now have enough data to see something that a single week cannot show: **the attackers rotate completely**.

Week 1's top attacker was AS23470 (ReliableSite.Net), a US hosting provider that drove 82,000 events — mostly scanning AI/ML ports. It ran its campaign, found nothing, and left. By week 2, it was gone from the top 10 entirely.

Week 2's champion was AS205997 (the infamous WHOIS entry that coincided with a Romanian politician's name), hammering RDP from eight IPs to the tune of 313,000 attacks. This week? Also gone. Not in the top 10 at all.

Week 3's new leader is **AS201814, MEVSPACE sp. z** — a Polish hosting provider — with 214,557 attacks. Behind it, **Clouvider Limited** (AS62240) at 130,867, followed by Modat B.V., TechTies, and a roster of names that were nowhere to be seen two weeks ago.

The individual actors rotate. The pattern does not. Every week has a dominant attacker driving 200-300k events; every week that attacker is a small hosting provider or bulletproof hoster; every week the previous leader vanishes and a new one takes its place. **The background radiation of the internet has a consistent shape even as its sources change.** This is the single most useful observation for defenders after three weeks of data: if you build your defenses around blocking specific IPs or ASNs, you are always fighting the last war. The threat is structural, not individual.

## The Cisco ASA Surge

Here is the headline change in the sensor data this week. **Ciscoasa jumped from 51,000 last week to 245,000 this week** — nearly a fivefold increase, catapulting it from a minor sensor to the second-most-hit honeypot, behind only RDPHoneypot (631k).

Ciscoasa emulates a Cisco Adaptive Security Appliance — a firewall and VPN concentrator that is one of the most widely deployed pieces of enterprise network infrastructure in the world. A fivefold increase in scanning against this specific target type in a single week is not noise. Someone — likely multiple someones — started or escalated a campaign targeting Cisco ASA infrastructure specifically.

The timing aligns with a broader trend: critical Cisco ASA vulnerabilities have been a recurring theme in recent years, and the scanning reflects an attacker ecosystem that shifts focus toward whatever attack surface is currently in play. The enterprise perimeter is the target this week; last week it was RDP endpoints; the week before, it was AI/ML tool ports.

## Ports: MikroTik Enters the Chat

The port distribution histogram tells the same RDP-and-SIP story as always (3389 and 5060 remain permanent fixtures), but a new entrant is worth noting: **port 8728**, which is the management port for **MikroTik RouterOS (Winbox)**. It appears in the country-and-port breakdown, particularly from traffic originating in Bulgaria and The Netherlands.

![Geographic specialization, OS fingerprinting, Suricata alerts, and credential clouds](/assets/images/week3-geo-suricata.png)

MikroTik routers are a well-documented botnet recruitment target: affordable, widely deployed in small businesses and ISPs, and frequently running outdated firmware. Port 8728 showing up alongside the usual 3389/5060/445 suggests that the scanning ecosystem is actively hunting MikroTik management interfaces alongside the traditional RDP and SIP targets. If you run a MikroTik device, check your Winbox access settings.

Port 5038 (Asterisk Manager Interface) also appears in the top five — consistent with the SIP/VoIP scanning pattern that has been a constant since week 1.

## Suricata: Ripple20 Surfaces

The CVE table this week shows two entries with 11 hits each. One is the returning CVE-2022-37055 (the D-Link router buffer overflow from last week's analysis). The other, appearing for the first time, is **CVE-2020-119** (truncated in Kibana — verify the full ID in the raw data).

If this is CVE-2020-11910, it belongs to the **Ripple20** family — a collection of 19 vulnerabilities in the Treck TCP/IP stack that affects hundreds of millions of IoT and embedded devices. The Treck stack is used in medical devices, industrial control systems, printers, power grids, and enterprise networking equipment. CISA issued an advisory (ICSA-20-168-01) specifically because of its cross-sector impact, including healthcare.

The connection to the broader data is consistent: the P0f fingerprinting continues to show Linux 2.2-3.x kernels as the dominant attacker OS — the signature of embedded devices. The D-Link CVE from last week and the potential Ripple20 CVE this week tell the same story from different angles: **compromised embedded devices exploiting other embedded devices**, a self-sustaining ecosystem of IoT recruitment.

A note on the numbers: 11 CVE hits in a million events is vanishingly small. The overwhelming majority of traffic remains brute-force and reconnaissance. But the CVEs that do appear are not random — they point specifically at the embedded/IoT stack, which is exactly what P0f says is generating the traffic. The data is internally consistent.

## Credentials: The CI/CD and Web Framework Hunt

![Credential wordclouds, top ASNs, top source IPs, and Suricata CVE/signatures](/assets/images/week3-credentials.png)

The username and password clouds show the usual suspects: Administrator and blank dominating, followed by the standard vendor-default catalog (admin, root, ubnt, postgres, pi, debian). But this week brings a few new entries worth flagging:

**"frappe"** — this is the username for Frappe, the Python web framework behind ERPNext, one of the most popular open-source ERP systems. Someone is scanning for default Frappe/ERPNext installations, which typically expose an admin panel on port 8000. ERP systems contain financial data, customer records, and business logic — high-value targets.

**"deployer"**, **"runner"**, **"validator"**, **"scans"** — these are not vendor defaults. They are usernames associated with CI/CD pipelines, deployment automation, and infrastructure tooling. Their presence in the wordlist indicates that the scanning ecosystem is evolving beyond IoT defaults toward targeting DevOps and automation infrastructure.

**"www"** and **"anonymous"** — web server and FTP defaults, consistent with opportunistic scanning of misconfigured web hosts.

The password cloud remains dominated by blank credentials and numeric sequences, with the same IoT-specific passwords that have appeared every week (1qaz@WSX, P@ssw0rd, rootroot, solana). The "claude" username continues to appear, as does "solana" — the AI agent and crypto infrastructure scanning that started in week 1 persists.

## Three Weeks In: What the Pattern Says

After 21 days and roughly 3.6 million total events, the honeypot has generated enough data to distinguish signal from noise. Three things are now clear:

**The actors rotate; the pattern does not.** Every week brings a new top attacker, but the shape of the attack — RDP/SIP brute force from IoT botnets, short-lived targeted campaigns, commodity scanning — is stable. Defenders should build for the pattern, not the actor.

**Enterprise infrastructure is a target alongside consumer IoT.** The Cisco ASA surge this week, coming after the AI/ML port scanning of week 1, shows that the scanning ecosystem does not limit itself to low-hanging fruit. When a new attack surface becomes viable — a Cisco vulnerability, an exposed ML tool, a MikroTik management port — it gets added to the scan lists within days.

**The embedded device ecosystem is self-sustaining.** Compromised routers scan for vulnerable routers. The CVEs that appear (D-Link, potentially Ripple20) target the same class of device that P0f identifies as the source of most traffic. The botnet recruitment cycle feeds itself, and the only intervention point is patching or retiring the vulnerable hardware — which, for devices running embedded Linux 2.x kernels from 2005, is unlikely to happen.

---

*Week 3 data covers 12-18 July 2026. All data collected by T-Pot (telekom-security) on Hetzner Cloud. Next recap: Saturday 25 July.*
