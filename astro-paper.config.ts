import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://lupercus.cc/",
    title: "Lupercus — Massimo Lo Polito | Cybersecurity & Honeypot",
    description: "Writeup di threat intelligence e blue team da un honeypot pubblico. Cybersecurity in sanità, NIS2, ricerca difensiva.",
    author: "Massimo Lo Polito",
    profile: "https://lupercus.cc/about/",
    ogImage: "lupercus-og.jpg",
    lang: "it",
    timezone: "Europe/Rome",
    dir: "ltr",
    googleVerification: "vLVu1DO-Iy-DAOxv8MFGCWsqmdUmy2IBCtE-wgLTsEQ", // googleVerification: "abc123",  // Lo popoli dopo, in Parte 20 (Google Search Console)
  },
  posts: {
    perPage: 8,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: false,
    },
    search: "pagefind",
  },
  socials: [
    { name: "github",   url: "https://github.com/AlePol01" },
    { name: "linkedin", url: "https://www.linkedin.com/in/massimolopolito/" },
    { name: "mail",     url: "mailto:LoPolitoMassimo@protonmail.com" },
  ],
  shareLinks: [
    { name: "x",        url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "whatsapp", url: "https://wa.me/?text=" },
    { name: "mail",     url: "mailto:?subject=Lupercus%20-%20writeup&body=" },
  ],
});