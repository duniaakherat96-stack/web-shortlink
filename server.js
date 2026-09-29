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
let memLinks = [];
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


// HTML Template Renderer for Dashboard
function renderCreateHtml(config, host) {
  const domainOptions = (config.domains || []).map(d => `<option value="${d}">${d}</option>`).join('');

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Create Link - ${config.siteName || 'SHORTTEN.NET'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body { background-color: #0b1329; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; }
    .card-box { background-color: #111a33; border: 1px solid #1e2942; }
    .input-field { background-color: #0b1329; border: 1px solid #243252; color: #f8fafc; }
    .input-field:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); }
    .tab-active { background-color: #1b2747; border-bottom: 2px solid #3b82f6; color: #ffffff; }
    .tab-inactive { color: #94a3b8; }
  </style>
</head>
<body class="min-h-screen flex text-slate-100">

  <!-- LEFT SIDEBAR -->
  <aside class="w-64 bg-[#0b1329] border-r border-slate-800/80 flex flex-col justify-between shrink-0 hidden md:flex min-h-screen">
    <div>
      <div class="p-5 border-b border-slate-800/60 flex items-center justify-between">
        <a href="/create" class="flex items-center gap-2 font-black text-lg tracking-wider text-white">
          <div class="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-xs text-white">
            <i class="fa-solid fa-link"></i>
          </div>
          <span>${config.siteName || 'SHORTTEN.NET'}</span>
        </a>
      </div>

      <div class="p-4 space-y-6 text-xs font-medium">
        <div>
          <p class="px-3 text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-2">Management</p>
          <div class="space-y-1">
            <a href="/create" class="flex items-center justify-between px-3 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20">
              <span class="flex items-center gap-3">
                <i class="fa-solid fa-plus-circle w-4 text-center"></i> Create Link
              </span>
              <i class="fa-solid fa-chevron-right text-[10px]"></i>
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="p-4 border-t border-slate-800/60 bg-[#080d1c]">
      <div class="flex items-center gap-3 p-2 bg-slate-900/80 rounded-xl border border-slate-800">
        <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-white uppercase">
          D
        </div>
        <div class="truncate flex-1">
          <p class="text-xs font-bold text-white truncate">Anakingusan</p>
          <p class="text-[10px] text-slate-400 truncate">dakarai@gmail.com</p>
        </div>
      </div>
    </div>
  </aside>

  <!-- MAIN CONTENT -->
  <div class="flex-1 flex flex-col min-w-0 bg-[#090e1d]">
    <header class="h-16 bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30">
      <div class="flex items-center gap-3">
        <span class="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] px-2.5 py-1 rounded-full font-mono font-bold flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> ENGINE ONLINE v2.0
        </span>
        <div class="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-lg shadow-blue-600/30">D</div>
      </div>
    </header>

    <main class="p-6 md:p-10 flex-1 max-w-5xl mx-auto w-full">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-extrabold text-white tracking-tight">Create Link</h1>
        <span class="text-xs bg-slate-800/80 text-slate-400 px-3 py-1.5 rounded-full border border-slate-700/80 font-mono">
          <i class="fa-solid fa-gear text-blue-400 mr-1"></i> URL Formatting <span class="bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded font-sans uppercase">NEW</span>
        </span>
      </div>

      <div class="card-box rounded-2xl p-6 shadow-2xl">
        <div class="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 mb-6">
          <button type="button" id="tabSingle" onclick="switchTab('single')" class="flex-1 py-2.5 text-center font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 bg-blue-600 text-white shadow-md">
            <i class="fa-solid fa-link"></i> Single URL
          </button>
          <button type="button" id="tabBulk" onclick="switchTab('bulk')" class="flex-1 py-2.5 text-center font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 text-slate-400 hover:text-white">
            <i class="fa-solid fa-layer-group"></i> Bulk URL
          </button>
        </div>



        <form id="createLinkForm" onsubmit="handleCreateLink(event)">
          <div class="mb-5">
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <i class="fa-solid fa-globe text-blue-400"></i> Select Domain
            </label>
            <div class="relative">
              <select id="selectedDomain" class="w-full input-field px-4 py-3 rounded-xl text-sm appearance-none cursor-pointer pr-10">
                ${domainOptions}
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                <i class="fa-solid fa-chevron-down text-xs"></i>
              </div>
            </div>
          </div>

          <div class="mb-5">
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <i class="fa-solid fa-file-lines text-blue-400"></i> Enter URL(s)
            </label>
            <textarea id="urlInput" rows="5" placeholder="Paste link video/file di sini..." class="w-full input-field px-4 py-3 rounded-xl text-sm font-mono placeholder:text-slate-500" required></textarea>
            <p class="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
              <i class="fa-solid fa-circle-info text-slate-500"></i> Each link must be on a new line.
            </p>
          </div>

          <div id="customAliasBox" class="mb-5">
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <i class="fa-solid fa-pen text-blue-400"></i> Custom Alias (Optional)
            </label>
            <input type="text" id="customAliasInput" placeholder="misal: video-viral-1" class="w-full input-field px-4 py-2.5 rounded-xl text-sm">
          </div>

          <div class="mb-6 p-3.5 bg-[#080e1c] rounded-xl border border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                <i class="fa-solid fa-check"></i>
              </div>
              <div>
                <p class="text-xs font-semibold text-slate-200">Anti-Bot Verification</p>
                <p class="text-[10px] text-slate-400">Cloudflare Turnstile Verified</p>
              </div>
            </div>
            <span class="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded font-mono">Status: Ready</span>
          </div>

          <button type="submit" id="btnSubmit" class="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 text-base cursor-pointer">
            <i class="fa-solid fa-wand-magic-sparkles"></i> Create Links
          </button>
        </form>
      </div>

      <div id="resultCard" class="hidden mt-8 card-box rounded-2xl p-6 shadow-2xl border-emerald-500/30 border">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-emerald-400 flex items-center gap-2">
            <i class="fa-solid fa-circle-check"></i> Hasil Shortlink Berhasil Dibuat
          </h3>
          <button onclick="copyAllResults()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg border border-slate-700 transition flex items-center gap-1.5">
            <i class="fa-solid fa-copy text-blue-400"></i> Salin Semua Link
          </button>
        </div>
        <div id="resultList" class="space-y-3 font-mono text-sm max-h-60 overflow-y-auto pr-1"></div>
      </div>
    </main>
  </div>

  <script>
    let activeTab = 'single';
    function switchTab(tab) {
      activeTab = tab;
      const tabSingle = document.getElementById('tabSingle');
      const tabBulk = document.getElementById('tabBulk');
      const customAliasBox = document.getElementById('customAliasBox');
      const urlInput = document.getElementById('urlInput');

      if (tab === 'single') {
        tabSingle.className = "flex-1 py-2.5 text-center font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 bg-blue-600 text-white shadow-md";
        tabBulk.className = "flex-1 py-2.5 text-center font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 text-slate-400 hover:text-white";
        customAliasBox.style.display = 'block';
        urlInput.placeholder = "Paste link video/file tunggal di sini...";
        urlInput.rows = 4;
      } else {
        tabBulk.className = "flex-1 py-2.5 text-center font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 bg-blue-600 text-white shadow-md";
        tabSingle.className = "flex-1 py-2.5 text-center font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 text-slate-400 hover:text-white";
        customAliasBox.style.display = 'none';
        urlInput.placeholder = "Paste banyak link di sini (1 link per baris)...";
        urlInput.rows = 8;
      }
    }

    function generateRandomId(len = 7) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let res = '';
      for (let i = 0; i < len; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
      return res;
    }

    async function handleCreateLink(e) {
      e.preventDefault();
      const btn = document.getElementById('btnSubmit');
      const urlText = document.getElementById('urlInput').value.trim();
      const selectedDomain = document.getElementById('selectedDomain').value;
      const customAlias = document.getElementById('customAliasInput').value.trim();

      const urlList = urlText.split('\n').map(u => u.trim()).filter(u => u.length > 0);
      if (urlList.length === 0) {
        alert('Masukkan minimal 1 URL!');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating Links...';

      const generatedLinks = [];
      const currentHost = window.location.host;
      const protocol = window.location.protocol;
      let domainHost = selectedDomain && selectedDomain !== '' ? selectedDomain : currentHost;
      if (!domainHost.startsWith('http://') && !domainHost.startsWith('https://')) {
        domainHost = protocol + '//' + domainHost;
      }

      urlList.forEach((origUrl, idx) => {
        let code = generateRandomId(7);
        if (urlList.length === 1 && customAlias) {
          code = customAlias.replace(/[^a-zA-Z0-9_-]/g, '');
        }
        const b64 = btoa(encodeURIComponent(origUrl));
        const shortUrl = domainHost + '/v/' + code + '?u=' + b64;
        generatedLinks.push({ id: code, shortUrl: shortUrl, originalUrl: origUrl });
      });

      // Background sync to server memory
      try {
        fetch('/api/create-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ urls: urlText, selectedDomain, customAlias })
        }).catch(() => {});
      } catch(e) {}

      try {
        localStorage.setItem('my_generated_links', JSON.stringify(generatedLinks));
      } catch(e) {}

      showResults(generatedLinks);
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Create Links';
    }

    function showResults(links) {
      if (!links || links.length === 0) return;
      const card = document.getElementById('resultCard');
      const list = document.getElementById('resultList');
      list.innerHTML = '';

      links.forEach(link => {
        const itemHtml = \`
          <div class="p-3 bg-[#080d1a] rounded-xl border border-slate-800 flex items-center justify-between gap-3">
            <input type="text" readonly value="\${link.shortUrl}" class="bg-transparent text-emerald-400 font-mono text-sm w-full outline-none">
            <button onclick="copyToClipboard('\${link.shortUrl}')" class="px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-xs font-semibold rounded-lg shrink-0 transition">
              <i class="fa-solid fa-copy mr-1"></i> Copy
            </button>
          </div>
        \`;
        list.insertAdjacentHTML('beforeend', itemHtml);
      });

      card.classList.remove('hidden');
      card.scrollIntoView({ behavior: 'smooth' });
    }

    function copyToClipboard(text) {
      navigator.clipboard.writeText(text);
      alert('Link disalin ke clipboard:\\n' + text);
    }

    function copyAllResults() {
      const inputs = document.querySelectorAll('#resultList input');
      const urls = Array.from(inputs).map(i => i.value).join('\\n');
      navigator.clipboard.writeText(urls);
      alert(inputs.length + ' link disalin ke clipboard!');
    }

    // Auto restore latest generated links on load
    try {
      const saved = localStorage.getItem('my_generated_links');
      if (saved) {
        showResults(JSON.parse(saved));
      }
    } catch(e) {}
  </script>
</body>
</html>`;
}

// HTML Template Renderer for Safelink Visitor Landing Page
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
      <i class="fa-solid fa-play-circle text-blue-500"></i> ${config.siteName || 'Media Player Portal'}
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
          <a href="/go/${link.id}" target="_blank" class="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base rounded-xl shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5">
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
    &copy; ${new Date().getFullYear()} ${config.siteName || 'SHORTTEN.NET'}. All rights reserved.
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
app.get('/', (req, res) => {
  const config = getConfig();
  const host = req.get('host');
  res.send(renderCreateHtml(config, host));
});

app.get('/create', (req, res) => {
  const config = getConfig();
  const host = req.get('host');
  res.send(renderCreateHtml(config, host));
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

// Direct Destination Redirect
app.get(['/go/:id', '/api/go/:id'], (req, res) => {
  const links = getLinks();
  const link = links.find(l => l.id === req.params.id);
  if (!link) return res.status(404).send('404 - Link Not Found');
  res.redirect(link.originalUrl);
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
