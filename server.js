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

// In-memory data store
let memLinks = [];
let memClicks = [];
let memConfig = {
  siteName: "VIDOY SHORTLINK PRO",
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
    topBanner: "<div style='padding:12px; background:#1e293b; color:#94a3b8; border-radius:8px; font-size:12px; text-align:center;'>[ Iklan Sponsor Banner Atas ]</div>",
    bottomBanner: "<div style='padding:12px; background:#1e293b; color:#94a3b8; border-radius:8px; font-size:12px; text-align:center;'>[ Iklan Sponsor Banner Bawah ]</div>",
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

// CLEAN, FAST & RELIABLE DASHBOARD
function renderDashboardHtml(config, host) {
  const domainOptions = (config.domains || []).map(d => `<option value="${d}">${d}</option>`).join('');

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shortlink Generator - ${config.siteName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body { background-color: #0b132b; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; }
    .card-box { background-color: #1c2541; border: 1px solid #3a506b; }
    .input-box { background-color: #0b132b; border: 1px solid #3a506b; color: #ffffff; }
    .input-box:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3); }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between p-4 md:p-8">

  <!-- TOP HEADER -->
  <header class="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-700/60 mb-8">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-lg font-black shadow-lg shadow-blue-600/40">
        <i class="fa-solid fa-link"></i>
      </div>
      <div>
        <h1 class="text-xl font-extrabold text-white tracking-tight">SHORTLINK GENERATOR</h1>
        <p class="text-xs text-slate-400">100% Penghasilan Iklan Adsterra Milik Anda</p>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <span class="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full text-xs font-mono font-bold flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> SYSTEM READY
      </span>
    </div>
  </header>

  <!-- MAIN GENERATOR CONTAINER -->
  <main class="max-w-4xl mx-auto w-full flex-1">

    <div class="card-box rounded-2xl p-6 md:p-8 shadow-2xl mb-8">
      
      <!-- DOMAIN SELECTION & ALIAS -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div>
          <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <i class="fa-solid fa-globe text-blue-400"></i> Pilih Domain
          </label>
          <div class="relative">
            <select id="domainSelect" class="w-full input-box px-4 py-3 rounded-xl text-sm appearance-none cursor-pointer pr-10 font-medium">
              ${domainOptions}
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
              <i class="fa-solid fa-chevron-down text-xs"></i>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <i class="fa-solid fa-pen text-blue-400"></i> Custom Alias (Opsional untuk 1 Link)
          </label>
          <input type="text" id="customAlias" placeholder="contoh: video-viral-1" class="w-full input-box px-4 py-3 rounded-xl text-sm placeholder:text-slate-500">
        </div>
      </div>

      <!-- URL INPUT AREA -->
      <div class="mb-6">
        <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <i class="fa-solid fa-paste text-blue-400"></i> Masukkan Link Video / URL Asli Anda (Bisa 1 atau Banyak Sekaligus)
        </label>
        <textarea id="urlInput" rows="5" placeholder="Paste link di sini (bisa satu link atau banyak link, 1 baris per link)...&#10;https://www.cdnvideyyyyx.cloud/2026/09/2911.html&#10;https://motorsnag.com/pop4u0h7?key=...&#10;https://www.cdnvideyyyyx.cloud/2026/09/2922.html" class="w-full input-box px-4 py-3 rounded-xl text-sm font-mono placeholder:text-slate-500"></textarea>
        <p class="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
          <i class="fa-solid fa-circle-info text-blue-400"></i> Untuk mode banyak link (Bulk), cukup tekan Enter untuk membuat baris baru.
        </p>
      </div>

      <!-- BIG GENERATE BUTTON -->
      <button type="button" id="btnGenerate" onclick="processGenerateLinks()" class="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white font-extrabold text-base rounded-xl transition duration-150 shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer">
        <i class="fa-solid fa-wand-magic-sparkles text-lg"></i> BUAT SHORTLINK SEKARANG
      </button>

    </div>

    <!-- RESULT CONTAINER -->
    <div id="resultContainer" class="hidden card-box rounded-2xl p-6 shadow-2xl border-2 border-emerald-500/50 mb-8">
      <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-700">
        <h2 class="text-base md:text-lg font-black text-emerald-400 flex items-center gap-2">
          <i class="fa-solid fa-circle-check text-xl"></i> HASIL SHORTLINK BERHASIL DIBUAT
        </h2>
        <button type="button" onclick="copyAllGeneratedLinks()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 shadow-md shadow-blue-600/20">
          <i class="fa-solid fa-copy"></i> Salin Semua Link
        </button>
      </div>

      <div id="resultList" class="space-y-3 font-mono text-sm max-h-80 overflow-y-auto pr-1"></div>
    </div>

  </main>

  <!-- FOOTER -->
  <footer class="max-w-4xl mx-auto w-full text-center py-4 border-t border-slate-800 text-xs text-slate-500">
    &copy; ${new Date().getFullYear()} ${config.siteName}. All rights reserved.
  </footer>

  <script>
    function generateIdCode(len = 7) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let str = '';
      for (let i = 0; i < len; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return str;
    }

    function processGenerateLinks() {
      const rawText = document.getElementById('urlInput').value.trim();
      const domainSelect = document.getElementById('domainSelect').value;
      const customAlias = document.getElementById('customAlias').value.trim();

      if (!rawText) {
        alert('Harap paste minimal 1 link video/URL pada kotak input!');
        return;
      }

      // Split lines cleanly across all OS
      const lines = rawText.split(/\\r?\\n/).map(function(l) { return l.trim(); }).filter(function(l) { return l.length > 0; });

      if (lines.length === 0) {
        alert('Tidak ada link valid yang ditemukan!');
        return;
      }

      const results = [];
      const proto = window.location.protocol;
      let hostDomain = domainSelect || window.location.host;
      if (!hostDomain.startsWith('http://') && !hostDomain.startsWith('https://')) {
        hostDomain = proto + '//' + hostDomain;
      }

      lines.forEach(function(origUrl) {
        let code = generateIdCode(7);
        if (lines.length === 1 && customAlias) {
          code = customAlias.replace(/[^a-zA-Z0-9_-]/g, '');
        }

        const b64 = btoa(encodeURIComponent(origUrl));
        const shortUrl = hostDomain + '/v/' + code + '?u=' + b64;
        results.push({ id: code, shortUrl: shortUrl, originalUrl: origUrl });
      });

      // Background sync to server memory
      try {
        fetch('/api/create-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ urls: lines.join('\\n'), selectedDomain: domainSelect, customAlias: customAlias })
        }).catch(function() {});
      } catch(e) {}

      // Save to localStorage
      try {
        localStorage.setItem('saved_shortlinks', JSON.stringify(results));
      } catch(e) {}

      renderResultItems(results);
    }

    function renderResultItems(items) {
      const container = document.getElementById('resultContainer');
      const list = document.getElementById('resultList');
      list.innerHTML = '';

      items.forEach(function(item) {
        const itemHtml = \`
          <div class="p-3.5 bg-[#0b132b] rounded-xl border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div class="truncate flex-1">
              <input type="text" readonly value="\${item.shortUrl}" class="w-full bg-transparent text-emerald-400 font-mono text-xs md:text-sm font-bold outline-none cursor-pointer" onclick="this.select()">
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button type="button" onclick="copySingleLink('\${item.shortUrl}')" class="px-3 py-2 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1.5">
                <i class="fa-solid fa-copy"></i> Salin
              </button>
              <a href="\${item.shortUrl}" target="_blank" class="px-3 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> Tes
              </a>
            </div>
          </div>
        \`;
        list.insertAdjacentHTML('beforeend', itemHtml);
      });

      container.classList.remove('hidden');
      container.scrollIntoView({ behavior: 'smooth' });
    }

    function copySingleLink(text) {
      navigator.clipboard.writeText(text);
      alert('Shortlink berhasil disalin:\\n' + text);
    }

    function copyAllGeneratedLinks() {
      const inputs = document.querySelectorAll('#resultList input');
      const allUrls = Array.from(inputs).map(function(inp) { return inp.value; }).join('\\n');
      navigator.clipboard.writeText(allUrls);
      alert(inputs.length + ' shortlink berhasil disalin ke clipboard!');
    }

    // Restore on load if available
    try {
      const saved = JSON.parse(localStorage.getItem('saved_shortlinks') || '[]');
      if (saved.length > 0) {
        renderResultItems(saved);
      }
    } catch(e) {}
  </script>
</body>
</html>`;
}

// VISITOR SAFELINK LANDING PAGE (WITH ADSTERRA ADS & VIDEO PLAYER)
function renderSafelinkHtml(link, config, isVideo) {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Watch Video / Unlock File</title>
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
      <i class="fa-solid fa-play-circle text-blue-500"></i> ${config.siteName || 'MEDIA PLAYER PORTAL'}
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
    &copy; ${new Date().getFullYear()} ${config.siteName}. All rights reserved.
  </footer>

  <script>
    let timeLeft = parseInt("${config.timerSeconds || 5}", 10) || 5;
    const timerCountEl = document.getElementById('timerCount');
    const timerContainer = document.getElementById('timerContainer');
    const unlockedContainer = document.getElementById('unlockedContainer');

    const countdownInterval = setInterval(function() {
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
app.get(['/', '/create', '/overview'], (req, res) => {
  const config = getConfig();
  const host = req.get('host');
  res.send(renderDashboardHtml(config, host));
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
  let link = links.find(l => l.id === req.params.id);
  if (!link && req.query.u) {
    try {
      const decodedUrl = decodeURIComponent(Buffer.from(req.query.u, 'base64').toString('utf8'));
      link = { originalUrl: decodedUrl };
    } catch (e) {}
  }
  if (!link) return res.status(404).send('404 - Link Not Found');
  res.redirect(link.originalUrl);
});

// API Create Short Links
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
    console.log(`🚀 VIDOY SHORTLINK ENGINE RUNNING ON PORT ${portToUse}`);
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
