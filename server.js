const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

let memLinks = {};
let memConfig = {
  siteName: "VIDOY SHORTLINK PRO",
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
    popunderScript: `<script src="https://motorsnag.com/24/40/b3/2440b391464167452027662bb4458e0e.js"></script>`
  }
};

function renderFullHtml() {
  const domainOptions = memConfig.domains.map(d => `<option value="${d}">${d}</option>`).join('');

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${memConfig.siteName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body { background-color: #0b132b; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; }
    .card-box { background-color: #1c2541; border: 1px solid #3a506b; }
    .input-box { background-color: #0b132b; border: 1px solid #3a506b; color: #ffffff; }
    .input-box:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3); }
  </style>
  ${memConfig.ads.popunderScript}
</head>
<body class="min-h-screen flex flex-col justify-between p-4 md:p-8">

  <!-- ==================== 1. DASHBOARD VIEW (GENERATOR) ==================== -->
  <div id="dashboardView" class="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-between">
    <header class="flex items-center justify-between pb-6 border-b border-slate-700/60 mb-8">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-lg font-black shadow-lg shadow-blue-600/40">
          <i class="fa-solid fa-link"></i>
        </div>
        <div>
          <h1 class="text-xl font-extrabold text-white tracking-tight">SHORTLINK GENERATOR</h1>
          <p class="text-xs text-slate-400">Mode Cepat • 100% Popunder Aktif</p>
        </div>
      </div>
      <span class="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full text-xs font-mono font-bold">
        v3.5 • ULTRA-FAST
      </span>
    </header>

    <main class="w-full flex-1">
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
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Custom Alias (Opsional 4-5 Huruf)</label>
            <input type="text" id="customAlias" placeholder="contoh: viral" maxlength="8" class="w-full input-box px-4 py-3 rounded-xl text-sm">
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
            <i class="fa-solid fa-circle-check"></i> HASIL SHORTLINK BERHASIL DIBUAT (4-5 KARAKTER)
          </h2>
          <button type="button" onclick="copyAllGeneratedLinks()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg">
            Salin Semua Link
          </button>
        </div>
        <div id="resultList" class="space-y-3 font-mono text-sm max-h-80 overflow-y-auto pr-1"></div>
      </div>
    </main>

    <footer class="text-center py-4 border-t border-slate-800 text-xs text-slate-500">
      &copy; ${new Date().getFullYear()} ${memConfig.siteName}. All rights reserved.
    </footer>
  </div>

  <!-- ==================== 2. SAFELINK VISITOR VIEW (CLEAN DIRECT REDIRECT + POPUNDER) ==================== -->
  <div id="safelinkView" class="hidden max-w-md mx-auto w-full flex-1 flex flex-col justify-center items-center text-center p-4">
    <div class="card-box rounded-3xl p-8 shadow-2xl border border-blue-500/40 w-full flex flex-col items-center cursor-pointer transform transition hover:scale-[1.02]" onclick="triggerRedirect()">
      <div class="w-20 h-20 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-inner">
        <i class="fa-solid fa-play animate-pulse"></i>
      </div>
      
      <h2 class="text-2xl font-black text-white mb-2 tracking-tight">Menuju ke Video</h2>
      <p class="text-sm text-slate-400 mb-8">Klik tombol di bawah atau ketuk layar untuk langsung membuka link video.</p>

      <a id="unlockBtn" href="#" class="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] text-white font-black text-base rounded-2xl shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 transition">
        <span>BUKA SEKARANG</span>
        <i class="fa-solid fa-arrow-right"></i>
      </a>

      <p class="text-[11px] text-slate-500 mt-4">Direct safe redirect • ${memConfig.siteName}</p>
    </div>
  </div>

  <!-- JAVASCRIPT ENGINE -->
  <script>
    let globalTargetUrl = '';

    function triggerRedirect() {
      if (globalTargetUrl) {
        window.location.href = globalTargetUrl;
      }
    }

    // AUTO ROUTING CONTROLLER (CLIENT-SIDE)
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;

    if (currentPath.includes('/v/') || window.location.href.includes('/v/')) {
      // 1. SWITCH TO VISITOR VIEW
      document.getElementById('dashboardView').classList.add('hidden');
      document.getElementById('safelinkView').classList.remove('hidden');

      // Extract shortcode
      let shortCode = '';
      const parts = window.location.pathname.split('/');
      const vIndex = parts.indexOf('v');
      if (vIndex !== -1 && parts[vIndex + 1]) {
        shortCode = parts[vIndex + 1].split('?')[0];
      }

      // Check URL query param ?u= or lookup from localStorage/API
      const urlParams = new URLSearchParams(currentSearch);
      const uParam = urlParams.get('u');
      if (uParam) {
        try {
          globalTargetUrl = decodeURIComponent(atob(uParam));
        } catch(e) {}
      }

      if (!globalTargetUrl && shortCode) {
        try {
          const linksDb = JSON.parse(localStorage.getItem('links_store') || '{}');
          if (linksDb[shortCode]) globalTargetUrl = linksDb[shortCode];
        } catch(e) {}
      }

      function applyTargetUrl(url) {
        globalTargetUrl = url;
        const btn = document.getElementById('unlockBtn');
        if (btn) btn.href = url;
      }

      // Fetch from server API if not found yet
      if (!globalTargetUrl && shortCode) {
        fetch('/api/get-link?id=' + shortCode)
          .then(res => res.json())
          .then(data => {
            if (data && data.url) {
              applyTargetUrl(data.url);
            }
          }).catch(() => {});
      } else if (globalTargetUrl) {
        applyTargetUrl(globalTargetUrl);
      }

    } else {
      // 2. DASHBOARD GENERATOR MODE
      document.getElementById('dashboardView').classList.remove('hidden');
      document.getElementById('safelinkView').classList.add('hidden');
    }

    // 4-5 CHARACTER CODE GENERATOR
    function generateIdCode(len = 5) {
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
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

      const storeMap = JSON.parse(localStorage.getItem('links_store') || '{}');

      lines.forEach(function(origUrl) {
        let code = generateIdCode(5);
        if (lines.length === 1 && customAlias) {
          code = customAlias.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 8);
        }

        const shortUrl = hostDomain + '/v/' + code;
        results.push({ id: code, shortUrl: shortUrl, originalUrl: origUrl });
        storeMap[code] = origUrl;
      });

      // Save to localStorage
      try {
        localStorage.setItem('links_store', JSON.stringify(storeMap));
      } catch(e) {}

      // Sync mapping to server API
      try {
        fetch('/api/save-links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: results })
        }).catch(function() {});
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

app.all('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  return res.send(renderFullHtml());
});

module.exports = app;
