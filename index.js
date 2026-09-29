const express = require('express');
const cors = require('cors');

const app = express();

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

function generateId(length = 7) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Dashboard HTML
function renderDashboard(config, host) {
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
    <span class="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full text-xs font-mono font-bold">
      SYSTEM READY
    </span>
  </header>

  <main class="max-w-4xl mx-auto w-full flex-1">
    <div class="card-box rounded-2xl p-6 md:p-8 shadow-2xl mb-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div>
          <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Pilih Domain</label>
          <div class="relative">
            <select id="domainSelect" class="w-full input-box px-4 py-3 rounded-xl text-sm appearance-none cursor-pointer pr-10">
              ${domainOptions}
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
              <i class="fa-solid fa-chevron-down text-xs"></i>
            </div>
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Custom Alias (Opsional)</label>
          <input type="text" id="customAlias" placeholder="contoh: video-viral-1" class="w-full input-box px-4 py-3 rounded-xl text-sm">
        </div>
      </div>

      <div class="mb-6">
        <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Masukkan Link Video / URL Asli (1 atau Banyak Sekaligus)</label>
        <textarea id="urlInput" rows="5" placeholder="Paste link di sini (pisahkan dengan Enter)...&#10;https://www.cdnvideyyyyx.cloud/2026/09/2911.html&#10;https://motorsnag.com/pop4u0h7?key=...&#10;https://www.cdnvideyyyyx.cloud/2026/09/2922.html" class="w-full input-box px-4 py-3 rounded-xl text-sm font-mono"></textarea>
      </div>

      <button type="button" onclick="processGenerateLinks()" class="w-full py-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-extrabold text-base rounded-xl transition shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer">
        <i class="fa-solid fa-wand-magic-sparkles"></i> BUAT SHORTLINK SEKARANG
      </button>
    </div>

    <div id="resultContainer" class="hidden card-box rounded-2xl p-6 shadow-2xl border-2 border-emerald-500/50 mb-8">
      <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-700">
        <h2 class="text-base font-black text-emerald-400 flex items-center gap-2">
          <i class="fa-solid fa-circle-check"></i> HASIL SHORTLINK BERHASIL DIBUAT
        </h2>
        <button type="button" onclick="copyAllGeneratedLinks()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg">
          Salin Semua Link
        </button>
      </div>
      <div id="resultList" class="space-y-3 font-mono text-sm max-h-80 overflow-y-auto pr-1"></div>
    </div>
  </main>

  <footer class="max-w-4xl mx-auto w-full text-center py-4 border-t border-slate-800 text-xs text-slate-500">
    &copy; ${new Date().getFullYear()} ${config.siteName}. All rights reserved.
  </footer>

  <script>
    function generateIdCode(len = 7) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let str = '';
      for (let i = 0; i < len; i++) str += chars.charAt(Math.floor(Math.random() * chars.length));
      return str;
    }

    function processGenerateLinks() {
      const rawText = document.getElementById('urlInput').value.trim();
      const domainSelect = document.getElementById('domainSelect').value;
      const customAlias = document.getElementById('customAlias').value.trim();

      if (!rawText) {
        alert('Harap paste minimal 1 link video/URL!');
        return;
      }

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
              <button type="button" onclick="copySingleLink('\${item.shortUrl}')" class="px-3 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold">
                Salin
              </button>
              <a href="\${item.shortUrl}" target="_blank" class="px-3 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold">
                Tes Buka
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
      alert('Shortlink disalin:\\n' + text);
    }

    function copyAllGeneratedLinks() {
      const inputs = document.querySelectorAll('#resultList input');
      const allUrls = Array.from(inputs).map(function(inp) { return inp.value; }).join('\\n');
      navigator.clipboard.writeText(allUrls);
      alert(inputs.length + ' shortlink berhasil disalin!');
    }
  </script>
</body>
</html>`;
}

// Visitor Safelink HTML
function renderSafelink(link, config, isVideo) {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Watch Video / Unlock Link</title>
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

// Universal Serverless Request Handler
module.exports = (req, res) => {
  const pathQuery = (req.query && req.query._path) ? ('/' + req.query._path) : '';
  const reqUrl = pathQuery || req.headers['x-matched-path'] || req.headers['x-forwarded-uri'] || req.url || '';

  // 1. SAFELINK VISITOR ROUTE (/v/...)
  if (reqUrl.includes('/v/') || (req.query && req.query._path && req.query._path.startsWith('v/'))) {
    let code = '';
    if (req.query && req.query._path && req.query._path.startsWith('v/')) {
      code = req.query._path.replace('v/', '').split('?')[0];
    } else {
      const fullPath = reqUrl.includes('/v/') ? reqUrl : req.url;
      const pathPart = fullPath.split('?')[0];
      code = pathPart.substring(pathPart.indexOf('/v/') + 3);
    }

    let targetUrl = '';
    if (req.query && req.query.u) {
      try {
        targetUrl = decodeURIComponent(Buffer.from(req.query.u, 'base64').toString('utf8'));
      } catch(e) {}
    }

    const linkObj = { id: code, originalUrl: targetUrl || 'https://www.google.com' };
    const isVideo = (linkObj.originalUrl || '').match(/\.(mp4|webm|m3u8|ogg)$/i) || (linkObj.originalUrl || '').includes('cdn.');

    return res.send(renderSafelink(linkObj, memConfig, isVideo));
  }

  // 2. DEFAULT DASHBOARD
  const host = req.headers.host || 'video.cdnvideyyyyx.cloud';
  return res.send(renderDashboard(memConfig, host));
};
