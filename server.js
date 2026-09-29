const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

const DATA_DIR = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'data');
const LINKS_FILE = path.join(DATA_DIR, 'links.json');
const CLICKS_FILE = path.join(DATA_DIR, 'clicks.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// In-memory cache fallback for serverless
let memLinks = [
  { id: "zfKtZvM", originalUrl: "https://motorsnag.com/p0p4u0h7?key=52308...", shortUrl: "https://video.cdnvideyyyyx.cloud/v/zfKtZvM", domain: "video.cdnvideyyyyx.cloud", clicks: 6, createdAt: "29 SEP 2026 • 12:07 PM UTC" },
  { id: "56oZXJ3", originalUrl: "https://www.cdnvideyyyyx.cloud/2026/09/29...", shortUrl: "https://video.cdnvideyyyyx.cloud/v/56oZXJ3", domain: "video.cdnvideyyyyx.cloud", clicks: 6, createdAt: "29 SEP 2026 • 12:07 PM UTC" },
  { id: "3tmOmdk", originalUrl: "https://www.cdnvideyyyyx.cloud/2026/08/28...", shortUrl: "https://cdn.cdnvideyyyyx.cloud/v/3tmOmdk", domain: "cdn.cdnvideyyyyx.cloud", clicks: 3, createdAt: "29 SEP 2026 • 11:39 AM UTC" },
  { id: "3YmBxpv", originalUrl: "https://motorsnag.com/p0p4u0h7?key=52308...", shortUrl: "https://cdn.cdnvideyyyyx.cloud/v/3YmBxpv", domain: "cdn.cdnvideyyyyx.cloud", clicks: 3, createdAt: "29 SEP 2026 • 11:39 AM UTC" }
];
let memClicks = [];
let memConfig = {
  siteName: "SHORTTEN.NET",
  timerSeconds: 5,
  domains: [
    "video.cdnvideyyyyx.cloud",
    "cdn.cdnvideyyyyx.cloud",
    "cdn2.cdnvideyyyyx.cloud",
    "v.cdnvideyyyyx.cloud",
    "play.cdnvideyyyyx.cloud",
    "short.cdnvideyyyyx.cloud",
    "sv.cdnvideyyyyx.cloud"
  ],
  ads: {
    topBanner: "<div style='padding:12px; background:#1e293b; color:#94a3b8; border-radius:8px; font-size:12px; text-align:center;'>[ Iklan Sponsor ]</div>",
    bottomBanner: "<div style='padding:12px; background:#1e293b; color:#94a3b8; border-radius:8px; font-size:12px; text-align:center;'>[ Iklan Sponsor ]</div>",
    popunderScript: `<script src="https://motorsnag.com/24/40/b3/2440b391464167452027662bb4458e0e.js"></script>\n<script src="https://motorsnag.com/d7/e8/65/d7e8659a6d16cf40f7a5577c843724ed.js"></script>`
  }
};

try {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(LINKS_FILE)) memLinks = JSON.parse(fs.readFileSync(LINKS_FILE, 'utf8'));
  if (fs.existsSync(CLICKS_FILE)) memClicks = JSON.parse(fs.readFileSync(CLICKS_FILE, 'utf8'));
  if (fs.existsSync(CONFIG_FILE)) memConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
} catch (e) {}

function getLinks() { return memLinks; }
function saveLinks(links) {
  memLinks = links;
  try { fs.writeFileSync(LINKS_FILE, JSON.stringify(links, null, 2)); } catch (e) {}
}

function getClicks() { return memClicks; }
function saveClicks(clicks) {
  memClicks = clicks;
  try { fs.writeFileSync(CLICKS_FILE, JSON.stringify(clicks, null, 2)); } catch (e) {}
}

function getConfig() { return memConfig; }
function saveConfig(config) {
  memConfig = config;
  try { fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2)); } catch (e) {}
}

function generateId(length = 7) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// App Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'public')));

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// URL Normalizer for Vercel Rewrites
app.use((req, res, next) => {
  if (req.url.startsWith('/api/index.js')) {
    req.url = req.url.slice('/api/index.js'.length) || '/';
  }
  next();
});

// SIDEBAR COMPONENT
function renderSidebar(activePage = 'create') {
  return `
  <aside class="w-64 bg-[#0d1527] border-r border-[#1e2942] flex flex-col justify-between shrink-0 hidden md:flex min-h-screen">
    <div>
      <!-- LOGO -->
      <div class="p-5 flex items-center justify-between border-b border-[#17223b]">
        <a href="/create" class="flex items-center gap-2 font-black text-lg tracking-wider text-white">
          <div class="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-xs text-white shadow-md shadow-blue-600/30">
            <i class="fa-solid fa-link"></i>
          </div>
          <span class="tracking-tight text-white font-extrabold">SHORTTEN<span class="text-blue-500">.NET</span></span>
        </a>
        <span class="text-slate-500 hover:text-slate-300 cursor-pointer text-xs">
          <i class="fa-solid fa-chevron-left"></i>
        </span>
      </div>

      <!-- NAV SECTIONS -->
      <div class="p-4 space-y-5 text-xs font-semibold">
        <!-- ANALYTICS -->
        <div>
          <p class="px-3 text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-1.5">ANALYTICS</p>
          <div class="space-y-0.5">
            <a href="/overview" class="flex items-center gap-3 px-3 py-2 rounded-lg ${activePage === 'overview' ? 'bg-[#1b2747] text-white border-l-2 border-blue-500 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-[#131d36]'} transition">
              <i class="fa-solid fa-chart-pie w-4 text-center text-slate-400"></i> Overview
            </a>
            <a href="/overview" class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#131d36] transition">
              <i class="fa-solid fa-trophy w-4 text-center text-slate-400"></i> Leaderboard
            </a>
            <a href="/overview" class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#131d36] transition">
              <i class="fa-solid fa-clock-rotate-left w-4 text-center text-slate-400"></i> Recent Clicks
            </a>
            <a href="/overview" class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#131d36] transition">
              <i class="fa-solid fa-chart-simple w-4 text-center text-slate-400"></i> Statistics
            </a>
          </div>
        </div>

        <!-- MANAGEMENT -->
        <div>
          <p class="px-3 text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-1.5">MANAGEMENT</p>
          <div class="space-y-0.5">
            <a href="/overview" class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#131d36] transition">
              <i class="fa-solid fa-list-check w-4 text-center text-slate-400"></i> My Links
            </a>
            <a href="/create" class="flex items-center justify-between px-3 py-2 rounded-lg ${activePage === 'create' ? 'bg-[#162344] text-white border border-blue-500/80 font-bold shadow-md shadow-blue-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-[#131d36]'} transition">
              <span class="flex items-center gap-3">
                <i class="fa-solid fa-plus w-4 text-center text-blue-400"></i> Create Link
              </span>
              <i class="fa-solid fa-chevron-right text-[10px] text-slate-500"></i>
            </a>
            <a href="/create" class="flex items-center justify-between px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#131d36] transition">
              <span class="flex items-center gap-3">
                <i class="fa-solid fa-circle-play w-4 text-center text-slate-400"></i> Smart Video
              </span>
              <span class="bg-blue-600/30 text-blue-400 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase">NEW</span>
            </a>
          </div>
        </div>

        <!-- SETTINGS -->
        <div>
          <p class="px-3 text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-1.5">SETTINGS</p>
          <div class="space-y-0.5">
            <a href="/create" class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#131d36] transition">
              <i class="fa-solid fa-globe w-4 text-center text-slate-400"></i> Domains
            </a>
            <a href="/create" class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#131d36] transition">
              <i class="fa-solid fa-credit-card w-4 text-center text-slate-400"></i> Subscription
            </a>
            <a href="/create" class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#131d36] transition">
              <i class="fa-solid fa-receipt w-4 text-center text-slate-400"></i> Payment History
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- SIDEBAR FOOTER -->
    <div class="p-4 border-t border-[#17223b] bg-[#0a101f]">
      <div class="mb-3 px-1 text-[10px] text-slate-500">
        <p class="font-bold tracking-wider uppercase text-[9px] flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> SERVER TIME (UTC)
        </p>
        <p id="liveServerTime" class="font-mono text-slate-300 font-semibold mt-0.5">29 SEP 2026 • 04:53:21 PM UTC</p>
        <p class="text-[9px] text-slate-500 mt-0.5">Reset 12:00 AM UTC (07:00 WIB)</p>
      </div>

      <div class="flex items-center gap-3 p-2 bg-[#121c33] rounded-xl border border-[#1e2a47]">
        <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-white uppercase border border-slate-600">
          D
        </div>
        <div class="truncate flex-1">
          <div class="flex items-center justify-between">
            <p class="text-xs font-bold text-white truncate">Anakingusan</p>
            <span class="text-[9px] bg-blue-500/20 text-blue-400 px-1 rounded font-bold">FREE</span>
          </div>
          <p class="text-[10px] text-slate-400 truncate">dikaadsterra@gmail.com</p>
        </div>
      </div>
    </div>
  </aside>
  `;
}

// TOPBAR COMPONENT
function renderTopbar(title = 'Create Link') {
  return `
  <header class="h-14 bg-[#0d1527] border-b border-[#1e2942] px-6 flex items-center justify-between sticky top-0 z-30">
    <div class="flex items-center gap-2 text-xs font-semibold text-slate-400">
      <span>Dashboard</span>
      <i class="fa-solid fa-chevron-right text-[10px] text-slate-600"></i>
      <span class="text-white">${title}</span>
    </div>

    <div class="flex items-center gap-4">
      <!-- THEME TOGGLE SWITCH -->
      <div class="w-12 h-6 bg-blue-600 rounded-full p-1 flex items-center justify-end cursor-pointer shadow-inner">
        <div class="w-4 h-4 rounded-full bg-white shadow-md flex items-center justify-center text-[9px] text-blue-900">
          <i class="fa-solid fa-moon"></i>
        </div>
      </div>

      <div class="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-white border border-slate-600">
        D
      </div>
    </div>
  </header>
  `;
}

// 1. CREATE LINK DASHBOARD PAGE (EXACT PIXEL REPLICA OF SCREENSHOT 1)
function renderCreatePage(config, host) {
  const domainOptions = (config.domains || []).map(d => `<option value="${d}">${d}</option>`).join('');

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Create Link | Shortten.net</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body { background-color: #080e1d; color: #f1f5f9; font-family: system-ui, -apple-system, sans-serif; }
    .card-box { background-color: #0d162a; border: 1px solid #1a253e; }
    .input-box { background-color: #091021; border: 1px solid #1e2c4a; color: #ffffff; }
    .input-box:focus { outline: none; border-color: #3b82f6; }
  </style>
</head>
<body class="min-h-screen flex text-slate-100">

  ${renderSidebar('create')}

  <div class="flex-1 flex flex-col min-w-0 bg-[#080e1d]">
    ${renderTopbar('Create Link')}

    <main class="p-6 md:p-10 flex-1 max-w-4xl mx-auto w-full">
      <!-- HEADER TITLE -->
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-extrabold text-white tracking-tight">Create Link</h1>
        <div class="flex items-center gap-1.5 px-3 py-1 bg-[#101b33] border border-[#1d2b4a] rounded-full text-xs text-slate-400">
          <i class="fa-solid fa-gear text-slate-400 text-xs"></i>
          <span>URL Formatting</span>
          <span class="bg-blue-600 text-white text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ml-1">NEW</span>
        </div>
      </div>

      <!-- MAIN GENERATOR CARD -->
      <div class="card-box rounded-2xl p-6 md:p-8 shadow-2xl">
        <!-- TABS -->
        <div class="flex bg-[#091021] p-1 rounded-xl border border-[#1b2847] mb-6">
          <button type="button" id="tabSingleBtn" onclick="setMode('single')" class="flex-1 py-2.5 text-center font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 bg-[#1b2a4d] text-white border border-blue-500/40 shadow-md">
            <i class="fa-solid fa-link text-blue-400"></i> Single URL
          </button>
          <button type="button" id="tabBulkBtn" onclick="setMode('bulk')" class="flex-1 py-2.5 text-center font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 text-slate-400 hover:text-white">
            <i class="fa-solid fa-layer-group"></i> Bulk URL
          </button>
        </div>

        <form id="createForm" onsubmit="generateShortlinks(event)">
          <!-- SELECT DOMAIN & CUSTOM ALIAS GRID -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <i class="fa-solid fa-globe text-slate-400"></i> Select Domain
              </label>
              <div class="relative">
                <select id="domainSelect" class="w-full input-box px-4 py-2.5 rounded-xl text-sm appearance-none cursor-pointer pr-10">
                  ${domainOptions}
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                  <i class="fa-solid fa-chevron-down text-xs"></i>
                </div>
              </div>
            </div>

            <div id="aliasContainer">
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Custom Alias (Optional)
              </label>
              <input type="text" id="aliasInput" placeholder="my-brand" class="w-full input-box px-4 py-2.5 rounded-xl text-sm placeholder:text-slate-600">
            </div>
          </div>

          <!-- PASTE YOUR LONG URL -->
          <div class="mb-5">
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Paste Your Long URL
            </label>
            <div id="urlInputContainer">
              <div class="relative flex items-center">
                <span class="absolute left-4 text-slate-500 text-sm">
                  <i class="fa-solid fa-link"></i>
                </span>
                <input type="text" id="singleUrlInput" placeholder="https://..." class="w-full input-box pl-10 pr-4 py-2.5 rounded-xl text-sm placeholder:text-slate-600">
              </div>
            </div>
          </div>

          <!-- ADVANCED OPTIONS -->
          <div class="mb-5">
            <button type="button" onclick="toggleAdvanced()" class="text-xs font-semibold text-slate-400 hover:text-slate-300 flex items-center gap-2">
              <i class="fa-solid fa-sliders"></i> Advanced Options <i id="advancedChevron" class="fa-solid fa-chevron-down text-[10px]"></i>
            </button>
            <div id="advancedPanel" class="hidden mt-3 p-4 bg-[#091021] rounded-xl border border-[#1b2847] space-y-3 text-xs">
              <div class="flex items-center justify-between">
                <span class="text-slate-300">Countdown Timer (Detik):</span>
                <input type="number" id="timerInput" value="5" min="1" max="60" class="w-20 input-box px-2 py-1 rounded text-center">
              </div>
            </div>
          </div>

          <!-- CLOUDFLARE TURNSTILE BOX (EXACT REPLICA) -->
          <div class="mb-6 flex justify-center">
            <div class="inline-flex items-center gap-3 px-5 py-2.5 bg-[#091021] border border-[#1b2847] rounded-xl shadow-inner">
              <div class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                <i class="fa-solid fa-check"></i>
              </div>
              <span class="text-xs font-bold text-white">Berhasil!</span>
              <div class="border-l border-slate-700 pl-3 flex flex-col text-[8px] text-slate-400 font-mono leading-tight">
                <span class="font-bold text-amber-500 tracking-wider">CLOUDFLARE</span>
                <span>Privacy - Terms</span>
              </div>
            </div>
          </div>

          <!-- SUBMIT BUTTON -->
          <button type="button" onclick="generateShortlinks(event)" id="submitBtn" class="w-full py-3.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 text-sm cursor-pointer">
            <i class="fa-solid fa-wand-magic-sparkles"></i> Create Link
          </button>
        </form>
      </div>

      <!-- RESULTS PANEL -->
      <div id="resultBox" class="hidden mt-8 card-box rounded-2xl p-6 shadow-2xl border border-emerald-500/40">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-bold text-emerald-400 flex items-center gap-2">
            <i class="fa-solid fa-circle-check"></i> Hasil Shortlink Aktif
          </h3>
          <button type="button" onclick="copyAllShortlinks()" class="px-3 py-1.5 bg-[#14203d] hover:bg-[#1a2b52] text-xs font-semibold text-slate-200 rounded-lg border border-[#24355e] transition flex items-center gap-1.5">
            <i class="fa-solid fa-copy text-blue-400"></i> Salin Semua
          </button>
        </div>
        <div id="resultItems" class="space-y-3 font-mono text-sm max-h-64 overflow-y-auto"></div>
      </div>

      <footer class="mt-12 text-center text-xs text-slate-500">
        &copy; 2026 <strong class="text-slate-400 font-bold">SHORTTEN.NET</strong> All rights reserved.
      </footer>
    </main>
  </div>

  <script>
    let currentMode = 'single';

    function setMode(mode) {
      currentMode = mode;
      const tabSingle = document.getElementById('tabSingleBtn');
      const tabBulk = document.getElementById('tabBulkBtn');
      const aliasContainer = document.getElementById('aliasContainer');
      const urlContainer = document.getElementById('urlInputContainer');

      if (mode === 'single') {
        tabSingle.className = "flex-1 py-2.5 text-center font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 bg-[#1b2a4d] text-white border border-blue-500/40 shadow-md";
        tabBulk.className = "flex-1 py-2.5 text-center font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 text-slate-400 hover:text-white";
        if (aliasContainer) aliasContainer.style.display = 'block';
        urlContainer.innerHTML = \`
          <div class="relative flex items-center">
            <span class="absolute left-4 text-slate-500 text-sm"><i class="fa-solid fa-link"></i></span>
            <input type="text" id="singleUrlInput" placeholder="https://..." class="w-full input-box pl-10 pr-4 py-2.5 rounded-xl text-sm placeholder:text-slate-600">
          </div>
        \`;
      } else {
        tabBulk.className = "flex-1 py-2.5 text-center font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 bg-[#1b2a4d] text-white border border-blue-500/40 shadow-md";
        tabSingle.className = "flex-1 py-2.5 text-center font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 text-slate-400 hover:text-white";
        if (aliasContainer) aliasContainer.style.display = 'none';
        urlContainer.innerHTML = \`
          <textarea id="bulkUrlInput" rows="6" placeholder="Paste banyak link di sini (1 link per baris)...&#10;https://site.com/video1.mp4&#10;https://site.com/video2.mp4" class="w-full input-box px-4 py-3 rounded-xl text-sm font-mono placeholder:text-slate-600"></textarea>
        \`;
      }
    }

    function toggleAdvanced() {
      const panel = document.getElementById('advancedPanel');
      const chevron = document.getElementById('advancedChevron');
      panel.classList.toggle('hidden');
      chevron.classList.toggle('fa-chevron-up');
    }

    function generateRandomCode(len = 7) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let out = '';
      for (let i = 0; i < len; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
      return out;
    }

    function generateShortlinks(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const domainEl = document.getElementById('domainSelect');
      const domain = domainEl ? domainEl.value : window.location.host;
      const aliasEl = document.getElementById('aliasInput');
      const alias = aliasEl ? aliasEl.value.trim() : '';
      let urlList = [];

      if (currentMode === 'single') {
        const inputEl = document.getElementById('singleUrlInput');
        const val = inputEl ? inputEl.value.trim() : '';
        if (val) urlList.push(val);
      } else {
        const inputEl = document.getElementById('bulkUrlInput');
        const val = inputEl ? inputEl.value.trim() : '';
        if (val) {
          urlList = val.split(/\\r?\\n/).map(function(u){ return u.trim(); }).filter(function(u){ return u.length > 0; });
        }
      }

      if (urlList.length === 0) {
        alert('Harap masukkan minimal 1 URL untuk diperpendek!');
        return false;
      }

      const generated = [];
      const proto = window.location.protocol;
      let dom = domain || window.location.host;
      if (!dom.startsWith('http://') && !dom.startsWith('https://')) {
        dom = proto + '//' + dom;
      }

      urlList.forEach((rawUrl) => {
        let code = generateRandomCode(7);
        if (urlList.length === 1 && alias) {
          code = alias.replace(/[^a-zA-Z0-9_-]/g, '');
        }
        const b64 = btoa(encodeURIComponent(rawUrl));
        const shortUrl = dom + '/v/' + code + '?u=' + b64;
        generated.push({ id: code, shortUrl: shortUrl, originalUrl: rawUrl, domain: domain, createdAt: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'SHORT', year: 'numeric' }) });
      });

      // Background sync to server
      try {
        fetch('/api/create-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ urls: urlList.join('\\n'), selectedDomain: domain, customAlias: alias })
        }).catch(() => {});
      } catch(err) {}

      // Save to localStorage
      try {
        const existing = JSON.parse(localStorage.getItem('user_shortlinks') || '[]');
        const updated = [...generated, ...existing];
        localStorage.setItem('user_shortlinks', JSON.stringify(updated.slice(0, 100)));
      } catch(err) {}

      displayResults(generated);
      return false;
    }

    function displayResults(items) {
      if (!items || items.length === 0) return;
      const box = document.getElementById('resultBox');
      const list = document.getElementById('resultItems');
      list.innerHTML = '';

      items.forEach(item => {
        const row = \`
          <div class="p-3 bg-[#091021] rounded-xl border border-[#1b2847] flex items-center justify-between gap-3">
            <input type="text" readonly value="\${item.shortUrl}" class="bg-transparent text-emerald-400 font-mono text-xs md:text-sm w-full outline-none">
            <button onclick="copyLink('\${item.shortUrl}')" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shrink-0 transition flex items-center gap-1 shadow-md shadow-blue-600/20">
              <i class="fa-solid fa-copy"></i> Copy
            </button>
          </div>
        \`;
        list.insertAdjacentHTML('beforeend', row);
      });

      box.classList.remove('hidden');
      box.scrollIntoView({ behavior: 'smooth' });
    }

    function copyLink(text) {
      navigator.clipboard.writeText(text);
      alert('Link disalin ke clipboard:\\n' + text);
    }

    function copyAllShortlinks() {
      const inputs = document.querySelectorAll('#resultItems input');
      const urls = Array.from(inputs).map(i => i.value).join('\\n');
      navigator.clipboard.writeText(urls);
      alert(inputs.length + ' link disalin ke clipboard!');
    }

    function updateServerClock() {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { day: '2-digit', month: 'SHORT', year: 'numeric' }).toUpperCase();
      const timeStr = now.toLocaleTimeString('en-US', { hour12: true });
      const el = document.getElementById('liveServerTime');
      if (el) el.innerText = \`\${dateStr} • \${timeStr} UTC\`;
    }
    setInterval(updateServerClock, 1000);
    updateServerClock();

    // Auto load last saved links
    try {
      const saved = JSON.parse(localStorage.getItem('user_shortlinks') || '[]');
      if (saved.length > 0) displayResults(saved.slice(0, 5));
    } catch(e) {}
  </script>
</body>
</html>`;
}

// 2. OVERVIEW DASHBOARD PAGE (EXACT PIXEL REPLICA OF SCREENSHOT 2)
function renderOverviewPage(config, host) {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Overview | Shortten.net</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body { background-color: #080e1d; color: #f1f5f9; font-family: system-ui, -apple-system, sans-serif; }
    .card-box { background-color: #0d162a; border: 1px solid #1a253e; }
  </style>
</head>
<body class="min-h-screen flex text-slate-100">

  ${renderSidebar('overview')}

  <div class="flex-1 flex flex-col min-w-0 bg-[#080e1d]">
    ${renderTopbar('Overview')}

    <main class="p-6 md:p-8 flex-1 max-w-7xl mx-auto w-full space-y-6">
      
      <!-- TOP NOTIFICATION BANNER -->
      <div class="p-3.5 bg-[#0b1b2f] border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
        <div class="flex items-center gap-3">
          <div class="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
            <i class="fa-solid fa-globe"></i>
          </div>
          <div>
            <p class="font-bold text-white flex items-center gap-1.5">
              NEW DOMAINS AVAILABLE <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </p>
            <p class="text-[11px] text-slate-400">Now you can use video.cdnvideyyyyx.cloud, cdn.cdnvideyyyyx.cloud, and cdn2.cdnvideyyyyx.cloud.</p>
          </div>
        </div>
        <i class="fa-solid fa-arrow-up-right-from-square text-slate-500 text-xs cursor-pointer"></i>
      </div>

      <!-- MAIN METRICS & LIVE ACTIVITY GRID -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- LEFT 2 COLUMNS: STATS & RECENT LINKS -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- 3 STATS CARDS -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- CLICKS TODAY -->
            <div class="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between">
              <div>
                <p class="text-[10px] font-extrabold uppercase tracking-wider text-blue-200">CLICKS TODAY</p>
                <h2 class="text-3xl font-black text-white mt-1">334</h2>
              </div>
              <div class="mt-4 flex items-center justify-between text-[10px]">
                <span class="text-blue-100 uppercase tracking-tight font-semibold">YOUR PERSONAL DASHBOARD</span>
                <a href="/create" class="px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-white font-bold transition flex items-center gap-1">
                  <i class="fa-solid fa-plus text-[9px]"></i> CREATE LINK
                </a>
              </div>
            </div>

            <!-- TOTAL CLICKS -->
            <div class="card-box p-5 rounded-2xl flex flex-col justify-between">
              <div class="flex items-center justify-between">
                <p class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">TOTAL CLICKS</p>
                <span class="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-bold">+6.332 (7D)</span>
              </div>
              <h2 class="text-3xl font-black text-white mt-2">235.033</h2>
              <div class="mt-4 text-[10px] text-slate-500 flex items-center gap-1">
                <i class="fa-solid fa-arrow-trend-up text-emerald-400"></i> Lifetime Analytics
              </div>
            </div>

            <!-- TOTAL LINKS -->
            <div class="card-box p-5 rounded-2xl flex flex-col justify-between">
              <div class="flex items-center justify-between">
                <p class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">TOTAL LINKS</p>
                <span class="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.2 rounded font-bold">+108 (7D)</span>
              </div>
              <h2 class="text-3xl font-black text-white mt-2">1.113</h2>
              <div class="mt-4 text-[10px] text-slate-500 flex items-center gap-1">
                <i class="fa-solid fa-link text-blue-400"></i> Active Shortlinks
              </div>
            </div>
          </div>

          <!-- RECENT LINKS (LAST 7 DAYS) TABLE -->
          <div class="card-box rounded-2xl p-5 shadow-2xl">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-extrabold text-white tracking-wide">Recent Links (Last 7 Days)</h3>
              <a href="/create" class="text-xs text-blue-400 hover:text-blue-300 font-semibold">View All &gt;</a>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs text-slate-300 font-mono">
                <thead class="bg-[#091021] text-slate-500 text-[10px] uppercase border-b border-[#1b2847]">
                  <tr>
                    <th class="p-3">URL</th>
                    <th class="p-3">TARGET/ORIGINAL</th>
                    <th class="p-3 text-center">CLICKS</th>
                    <th class="p-3">CREATED ON</th>
                    <th class="p-3 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody id="recentTableBody" class="divide-y divide-[#17223b]">
                  <tr class="hover:bg-[#121c33] transition">
                    <td class="p-3 text-blue-400 font-bold">https://video.cdnvideyyyyx.cloud/v/zfKtZvM</td>
                    <td class="p-3 text-slate-400 truncate max-w-[150px]">https://motorsnag.com/p0p4u0h7...</td>
                    <td class="p-3 text-center font-bold text-white">6</td>
                    <td class="p-3 text-slate-500 text-[11px]">29 SEP 2026 • 12:07 PM UTC</td>
                    <td class="p-3 text-center space-x-2 text-slate-400">
                      <button onclick="alert('Info Link: video.cdnvideyyyyx.cloud')" class="hover:text-white"><i class="fa-solid fa-circle-info"></i></button>
                      <a href="https://video.cdnvideyyyyx.cloud/v/zfKtZvM" target="_blank" class="hover:text-white"><i class="fa-solid fa-eye"></i></a>
                      <button onclick="navigator.clipboard.writeText('https://video.cdnvideyyyyx.cloud/v/zfKtZvM'); alert('Disalin!');" class="hover:text-white"><i class="fa-solid fa-copy"></i></button>
                    </td>
                  </tr>
                  <tr class="hover:bg-[#121c33] transition">
                    <td class="p-3 text-blue-400 font-bold">https://video.cdnvideyyyyx.cloud/v/56oZXJ3</td>
                    <td class="p-3 text-slate-400 truncate max-w-[150px]">https://www.cdnvideyyyyx.cloud/2026/09/29...</td>
                    <td class="p-3 text-center font-bold text-white">6</td>
                    <td class="p-3 text-slate-500 text-[11px]">29 SEP 2026 • 12:07 PM UTC</td>
                    <td class="p-3 text-center space-x-2 text-slate-400">
                      <button class="hover:text-white"><i class="fa-solid fa-circle-info"></i></button>
                      <a href="https://video.cdnvideyyyyx.cloud/v/56oZXJ3" target="_blank" class="hover:text-white"><i class="fa-solid fa-eye"></i></a>
                      <button onclick="navigator.clipboard.writeText('https://video.cdnvideyyyyx.cloud/v/56oZXJ3'); alert('Disalin!');" class="hover:text-white"><i class="fa-solid fa-copy"></i></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <!-- RIGHT 1 COLUMN: LIVE TRAFFIC & STREAM -->
        <div class="space-y-6">
          
          <!-- LIVE TRAFFIC COUNTER -->
          <div class="card-box p-4 rounded-2xl flex items-center justify-between">
            <div class="flex items-center gap-2 text-xs font-bold text-slate-300">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> LIVE TRAFFIC
            </div>
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-chart-line text-blue-400 text-xs"></i>
              <span class="text-lg font-black text-white">1</span>
            </div>
          </div>

          <!-- LIVE ACTIVITY STREAM -->
          <div class="card-box rounded-2xl p-5 shadow-2xl">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2 text-xs font-bold text-slate-200">
                <i class="fa-solid fa-bolt text-emerald-400"></i>
                <span>Live Activity</span>
              </div>
              <span class="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">See All &gt;</span>
            </div>

            <div class="space-y-3 text-xs font-mono">
              <div class="p-2.5 bg-[#091021] rounded-xl border border-[#1b2847] flex items-center justify-between">
                <div class="truncate pr-2">
                  <p class="text-blue-400 font-bold truncate">https://video.cdnvideyyyyx.cloud/v/0F2PwWe</p>
                  <p class="text-[10px] text-slate-500 truncate">https://www.cdnvideyyyyx.cloud/2026/09/29...</p>
                </div>
                <div class="text-right shrink-0">
                  <span class="text-[10px] text-slate-400">1 min ago</span>
                  <p class="text-xs">🇮🇩</p>
                </div>
              </div>

              <div class="p-2.5 bg-[#091021] rounded-xl border border-[#1b2847] flex items-center justify-between">
                <div class="truncate pr-2">
                  <p class="text-blue-400 font-bold truncate">https://cdn.cdnvideyyyyx.cloud/v/RwCFN5s</p>
                  <p class="text-[10px] text-slate-500 truncate">https://www.cdnvideyyyyx.cloud/2026/09/28...</p>
                </div>
                <div class="text-right shrink-0">
                  <span class="text-[10px] text-slate-400">50 min ago</span>
                  <p class="text-xs">🇮🇩</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      <footer class="text-center text-xs text-slate-500 py-6">
        &copy; 2026 <strong class="text-slate-400 font-bold">SHORTTEN.NET</strong> All rights reserved.
      </footer>
    </main>
  </div>

  <script>
    function updateServerClock() {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { day: '2-digit', month: 'SHORT', year: 'numeric' }).toUpperCase();
      const timeStr = now.toLocaleTimeString('en-US', { hour12: true });
      const el = document.getElementById('liveServerTime');
      if (el) el.innerText = \`\${dateStr} • \${timeStr} UTC\`;
    }
    setInterval(updateServerClock, 1000);
    updateServerClock();
  </script>
</body>
</html>`;
}

// 3. SAFELINK VISITOR PAGE (WITH ADSTERRA ADS & COUNTDOWN)
function renderSafelinkHtml(link, config, isVideo) {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Watch Video / Unlock File Link</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body { background-color: #0b0f19; color: #f1f5f9; font-family: system-ui, -apple-system, sans-serif; }
    .video-card { background-color: #151d2a; border: 1px solid #232f45; }
  </style>
  ${config.ads.popunderScript || ''}
</head>
<body class="min-h-screen flex flex-col justify-between p-3 md:p-6">
  <header class="max-w-3xl mx-auto w-full text-center py-3 border-b border-slate-800 mb-4">
    <h1 class="text-lg font-extrabold text-blue-400 tracking-wide flex items-center justify-center gap-2">
      <i class="fa-solid fa-play-circle text-blue-500"></i> ${config.siteName || 'SHORTTEN.NET'}
    </h1>
  </header>

  <main class="max-w-3xl mx-auto w-full flex-1 flex flex-col items-center">
    <div class="w-full mb-5 overflow-hidden flex justify-center">
      ${config.ads.topBanner || ''}
    </div>

    <div class="video-card w-full rounded-2xl p-4 md:p-6 shadow-2xl mb-6">
      ${isVideo ? `
        <div class="relative w-full aspect-video bg-black rounded-xl overflow-hidden mb-5 border border-slate-800 shadow-inner flex items-center justify-center">
          <video id="mainVideo" controls preload="metadata" class="w-full h-full object-contain">
            <source src="${link.originalUrl}" type="video/mp4">
            Browser Anda tidak mendukung pemutar video HTML5.
          </video>
        </div>
      ` : ''}

      <div id="countdownBox" class="text-center py-6 px-4 bg-slate-900/90 rounded-xl border border-slate-800 my-2">
        <div id="timerContainer">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-400 text-2xl font-black mb-3">
            <span id="timerCount">${config.timerSeconds || 5}</span>
          </div>
          <p class="text-sm font-semibold text-slate-200">Harap Tunggu Pemutar Media Sedang Disiapkan...</p>
          <p class="text-xs text-slate-400 mt-1">Video akan dapat dibuka setelah timer selesai.</p>
        </div>

        <div id="unlockedContainer" class="hidden">
          <a href="${link.originalUrl}" target="_blank" class="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base rounded-xl shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5">
            <i class="fa-solid fa-circle-play text-xl"></i> PUTAR / BUKA LINK SEKARANG
          </a>
          <p class="text-xs text-slate-400 mt-2">Klik tombol di atas untuk menuju link utama.</p>
        </div>
      </div>
    </div>

    <div class="w-full mb-6 overflow-hidden flex justify-center">
      ${config.ads.bottomBanner || ''}
    </div>
  </main>

  <footer class="max-w-3xl mx-auto w-full text-center py-4 border-t border-slate-800/60 text-xs text-slate-500">
    &copy; ${new Date().getFullYear()} SHORTTEN.NET. All rights reserved.
  </footer>

  <script>
    let timeLeft = parseInt("${config.timerSeconds || 5}", 10) || 5;
    const timerCountEl = document.getElementById('timerCount');
    const timerContainer = document.getElementById('timerContainer');
    const unlockedContainer = document.getElementById('unlockedContainer');

    const countdownInterval = setInterval(() => {
      timeLeft--;
      if (timerCountEl) timerCountEl.innerText = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
        timerContainer.classList.add('hidden');
        unlockedContainer.classList.remove('hidden');
      }
    }, 1000);
  </script>
</body>
</html>`;
}

// Routes
app.get(['/', '/create'], (req, res) => {
  const config = getConfig();
  const host = req.get('host');
  res.send(renderCreatePage(config, host));
});

app.get('/overview', (req, res) => {
  const config = getConfig();
  const host = req.get('host');
  res.send(renderOverviewPage(config, host));
});

// Visitor Safelink Page
app.get(['/v/:id', '/api/v/:id'], (req, res) => {
  const code = req.params.id;
  const links = getLinks();
  let link = links.find(l => l.id === code);

  if (!link && req.query.u) {
    try {
      const decodedUrl = decodeURIComponent(Buffer.from(req.query.u, 'base64').toString('utf8'));
      link = { id: code, originalUrl: decodedUrl, shortUrl: req.originalUrl };
    } catch (e) {}
  }

  if (!link) {
    return res.status(404).send('<h2 style="color:white;background:#0b0f19;padding:40px;font-family:sans-serif;">404 - Shortlink Not Found or Expired</h2>');
  }

  link.clicks = (link.clicks || 0) + 1;
  saveLinks(links);

  const clicks = getClicks();
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  clicks.unshift({
    linkId: link.id,
    shortUrl: link.shortUrl || req.originalUrl,
    originalUrl: link.originalUrl,
    ip: clientIp,
    userAgent: req.headers['user-agent'] || 'Unknown',
    timestamp: new Date().toISOString()
  });
  saveClicks(clicks.slice(0, 500));

  const config = getConfig();
  const isVideo = link.originalUrl.match(/\.(mp4|webm|m3u8|ogg)$/i) || link.originalUrl.includes('cdn.');

  res.send(renderSafelinkHtml(link, config, isVideo));
});

// API Create Short Links (Multi-route support)
app.post(['/api/create-link', '/create-link'], (req, res) => {
  const { urls, selectedDomain, customAlias } = req.body;
  if (!urls || typeof urls !== 'string') {
    return res.status(400).json({ error: 'URLs input is required' });
  }

  const urlList = urls.split('\n').map(u => u.trim()).filter(u => u.length > 0);
  if (urlList.length === 0) {
    return res.status(400).json({ error: 'Please enter at least one valid URL' });
  }

  const links = getLinks();
  const createdItems = [];
  const currentHost = req.get('host');
  const protocol = req.protocol || 'https';

  urlList.forEach((originalUrl) => {
    let code = generateId(7);
    if (urlList.length === 1 && customAlias && customAlias.trim().length > 0) {
      code = customAlias.trim().replace(/[^a-zA-Z0-9_-]/g, '');
    }

    let domainHost = selectedDomain && selectedDomain.trim() !== '' ? selectedDomain.trim() : currentHost;
    if (!domainHost.startsWith('http://') && !domainHost.startsWith('https://')) {
      domainHost = `${protocol}://${domainHost}`;
    }

    const shortUrl = `${domainHost}/v/${code}`;
    const localDirectUrl = `${protocol}://${currentHost}/v/${code}`;

    const newLinkObj = {
      id: code,
      originalUrl,
      shortUrl,
      localDirectUrl,
      domain: selectedDomain || currentHost,
      clicks: 0,
      createdAt: new Date().toISOString()
    };

    links.unshift(newLinkObj);
    createdItems.push(newLinkObj);
  });

  saveLinks(links);
  return res.json({ success: true, count: createdItems.length, links: createdItems });
});

function startServer(portToUse) {
  const server = app.listen(portToUse, () => {
    console.log(`====================================================`);
    console.log(`🚀 SHORTTEN.NET SAAS ENGINE RUNNING ON PORT ${portToUse}`);
    console.log(`🔗 Dashboard: http://localhost:${portToUse}`);
    console.log(`====================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      startServer(portToUse + 1);
    }
  });
}

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  startServer(PORT);
}

module.exports = app;
