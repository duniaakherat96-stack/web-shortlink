const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let memLinks = {};

// Load existing links if available
try {
  const filePath = path.join(__dirname, 'data/links.json');
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (Array.isArray(data)) {
      data.forEach(item => {
        if (item.id && item.originalUrl) {
          memLinks[item.id] = item.originalUrl;
        }
      });
    }
  }
} catch (e) {}

const domainsList = [
  "video.cdnvideyyyyx.cloud",
  "cdn.cdnvideyyyyx.cloud",
  "cdn2.cdnvideyyyyx.cloud",
  "v.cdnvideyyyyx.cloud",
  "play.cdnvideyyyyx.cloud",
  "short.cdnvideyyyyx.cloud",
  "sv.cdnvideyyyyx.cloud"
];

function renderDashboardHtml() {
  const domainOptions = domainsList.map(d => `<option value="${d}">${d}</option>`).join('');

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VIDOY SHORTLINK PRO - Direct Redirect</title>
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

  <!-- AUTO CLIENT-SIDE DIRECT REDIRECT -->
  <script>
    (function() {
      const currentPath = window.location.pathname;
      if (currentPath.includes('/v/') || window.location.href.includes('/v/')) {
        let code = '';
        const parts = currentPath.split('/');
        const vIndex = parts.indexOf('v');
        if (vIndex !== -1 && parts[vIndex + 1]) {
          code = parts[vIndex + 1].split('?')[0];
        }

        if (code) {
          // 1. Instant lookup from localStorage
          try {
            const store = JSON.parse(localStorage.getItem('links_store') || '{}');
            if (store[code]) {
              window.location.replace(store[code]);
              return;
            }
          } catch(e) {}

          // 2. Lookup from API
          fetch('/api/get-link?id=' + encodeURIComponent(code))
            .then(function(res) { return res.json(); })
            .then(function(data) {
              if (data && data.url) {
                window.location.replace(data.url);
              } else {
                document.body.innerHTML = '<div style="color:#f8fafc; text-align:center; padding:60px 20px; font-family:sans-serif;"><h2 style="font-size:22px; font-weight:bold; margin-bottom:12px;">Link Tidak Ditemukan</h2><p style="color:#94a3b8; font-size:14px; margin-bottom:20px;">Shortlink ini mungkin belum tersimpan atau telah kedaluwarsa.</p><a href="/" style="display:inline-block; padding:10px 24px; background:#2563eb; color:#fff; border-radius:8px; text-decoration:none; font-weight:bold;">Buka Dashboard</a></div>';
              }
            })
            .catch(function() {
              document.body.innerHTML = '<div style="color:#f8fafc; text-align:center; padding:60px 20px; font-family:sans-serif;"><h2>Sedang Mengalihkan...</h2></div>';
            });
        }
      }
    })();
  </script>

  <!-- DASHBOARD GENERATOR VIEW -->
  <div id="dashboardView" class="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-between">
    <header class="flex items-center justify-between pb-6 border-b border-slate-700/60 mb-8">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-lg font-black shadow-lg shadow-blue-600/40">
          <i class="fa-solid fa-link"></i>
        </div>
        <div>
          <h1 class="text-xl font-extrabold text-white tracking-tight">SHORTLINK GENERATOR</h1>
          <p class="text-xs text-emerald-400 font-medium"><i class="fa-solid fa-bolt"></i> 100% Direct Redirect (Tanpa Iklan / Tanpa Perantara)</p>
        </div>
      </div>
      <span class="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full text-xs font-mono font-bold">
        DIRECT 5-CHAR
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
            <i class="fa-solid fa-circle-check"></i> HASIL SHORTLINK DIRECT (4-5 KARAKTER)
          </h2>
          <button type="button" onclick="copyAllGeneratedLinks()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg">
            Salin Semua Link
          </button>
        </div>
        <div id="resultList" class="space-y-3 font-mono text-sm max-h-80 overflow-y-auto pr-1"></div>
      </div>
    </main>

    <footer class="text-center py-4 border-t border-slate-800 text-xs text-slate-500">
      &copy; ${new Date().getFullYear()} VIDOY SHORTLINK PRO. Direct Redirect Engine.
    </footer>
  </div>

  <script>
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

// 1. Direct Server-Side Redirect
app.get('/v/:id', (req, res) => {
  const id = req.params.id;
  if (memLinks[id]) {
    return res.redirect(302, memLinks[id]);
  }
  return res.send(renderDashboardHtml());
});

// 2. API Save Links
app.post(['/api/save-links', '/save-links'], (req, res) => {
  const items = (req.body && req.body.items) ? req.body.items : [];
  items.forEach(it => {
    if (it.id && it.originalUrl) {
      memLinks[it.id] = it.originalUrl;
    }
  });
  return res.json({ success: true, saved: items.length });
});

// 3. API Get Link
app.get('/api/get-link', (req, res) => {
  const id = req.query.id;
  if (id && memLinks[id]) {
    return res.json({ success: true, url: memLinks[id] });
  }
  return res.json({ success: false, url: null });
});

// 4. Fallback
app.all('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  return res.send(renderDashboardHtml());
});

module.exports = app;
