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

// Ensure data folder and files exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(LINKS_FILE)) fs.writeFileSync(LINKS_FILE, JSON.stringify([]));
if (!fs.existsSync(CLICKS_FILE)) fs.writeFileSync(CLICKS_FILE, JSON.stringify([]));
if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify({
    siteName: "SHORTTEN.NET",
    timerSeconds: 5,
    domains: [
      "cdn2.slicedrve.in",
      "shorturl.lt",
      "videy.at",
      "videy.my",
      "vdey.in",
      "aceimg.in",
      "slicedrve.in",
      "shortn.icu",
      "funhun.site",
      "cdn.videy.at",
      "cdn.videy.my",
      "cdn.vdey.in",
      "cdn.aceimg.in",
      "cdn.slicedrve.in",
      "cdn2.videy.at"
    ],
    ads: {
      topBanner: "<div style='padding:15px; background:#1e293b; color:#94a3b8; border-radius:8px; font-size:13px; text-align:center;'>[ SLOT IKLAN BANNER ATAS (728x90) - Tempel Kode Adsterra/Monetag Anda Di sini ]</div>",
      bottomBanner: "<div style='padding:15px; background:#1e293b; color:#94a3b8; border-radius:8px; font-size:13px; text-align:center;'>[ SLOT IKLAN BANNER BAWAH (300x250) - Tempel Kode Adsterra/Monetag Anda Di sini ]</div>",
      popunderScript: ""
    }
  }, null, 2));
}

// Helpers
function getLinks() {
  try { return JSON.parse(fs.readFileSync(LINKS_FILE, 'utf8')); } catch (e) { return []; }
}
function saveLinks(links) {
  try { fs.writeFileSync(LINKS_FILE, JSON.stringify(links, null, 2)); } catch (e) {}
}

function getClicks() {
  try { return JSON.parse(fs.readFileSync(CLICKS_FILE, 'utf8')); } catch (e) { return []; }
}
function saveClicks(clicks) {
  try { fs.writeFileSync(CLICKS_FILE, JSON.stringify(clicks, null, 2)); } catch (e) {}
}

function getConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')); } catch (e) {
    return {
      siteName: "SHORTTEN.NET",
      timerSeconds: 5,
      domains: ["cdn2.slicedrve.in", "videy.at", "aceimg.in"],
      ads: { topBanner: "", bottomBanner: "", popunderScript: "" }
    };
  }
}
function saveConfig(config) {
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
app.set('view engine', 'ejs');
app.set('views', [
  path.join(process.cwd(), 'views'),
  path.join(__dirname, 'views'),
  path.join(__dirname, '../views')
]);



// URL Normalizer for Vercel Rewrites
app.use((req, res, next) => {
  if (req.url.startsWith('/api/index.js')) {
    req.url = req.url.slice('/api/index.js'.length) || '/';
  }
  next();
});

// Global template locals
app.use((req, res, next) => {
  res.locals.config = getConfig();
  res.locals.host = req.get('host');
  res.locals.protocol = req.protocol;
  res.locals.activePage = req.path;
  next();
});


// Redirect root to /create (Create Link dashboard)
app.get('/', (req, res) => res.redirect('/create'));

// Create Link Dashboard (Matching screenshot Create Link UI)
app.get('/create', (req, res) => {
  const links = getLinks();
  res.render('create', { links });
});

// Overview Analytics Page
app.get('/overview', (req, res) => {
  const links = getLinks();
  const clicks = getClicks();

  const totalLinks = links.length;
  const totalClicks = clicks.length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayClicks = clicks.filter(c => c.timestamp && c.timestamp.startsWith(todayStr)).length;

  // Calculate top link
  const sortedLinks = [...links].sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
  const topLink = sortedLinks[0] || null;

  // Last 7 days click stats for chart
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const count = clicks.filter(c => c.timestamp && c.timestamp.startsWith(dateStr)).length;
    last7Days.push({ date: dateStr, day: dayName, count });
  }

  res.render('overview', {
    totalLinks,
    totalClicks,
    todayClicks,
    topLink,
    last7Days,
    links: links.slice(0, 5)
  });
});

// My Links Page
app.get('/links', (req, res) => {
  const links = getLinks();
  res.render('my_links', { links });
});

// Recent Clicks Page
app.get('/recent-clicks', (req, res) => {
  const clicks = getClicks();
  res.render('recent_clicks', { clicks: clicks.slice(0, 50) });
});

// Domains Settings Page
app.get('/domains', (req, res) => {
  const config = getConfig();
  res.render('domains', { config });
});

// Settings & Ad Config Page
app.get('/settings', (req, res) => {
  const config = getConfig();
  res.render('settings', { config });
});

// API Create Link
app.post('/api/create-link', (req, res) => {
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
  const protocol = req.protocol;

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

// API Add Domain
app.post('/api/domains', (req, res) => {
  const { domain } = req.body;
  if (!domain || domain.trim() === '') return res.status(400).json({ error: 'Domain required' });
  const config = getConfig();
  const cleanDom = domain.trim().replace(/^https?:\/\//, '');
  if (!config.domains.includes(cleanDom)) {
    config.domains.push(cleanDom);
    saveConfig(config);
  }
  return res.json({ success: true, domains: config.domains });
});

// API Delete Domain
app.delete('/api/domains/:domain', (req, res) => {
  const config = getConfig();
  config.domains = config.domains.filter(d => d !== req.params.domain);
  saveConfig(config);
  return res.json({ success: true });
});

// API Settings Update
app.post('/api/settings', (req, res) => {
  const { timerSeconds, topBanner, bottomBanner, popunderScript, siteName } = req.body;
  const config = getConfig();

  if (siteName) config.siteName = siteName;
  if (timerSeconds !== undefined) config.timerSeconds = parseInt(timerSeconds, 10) || 5;
  if (topBanner !== undefined) config.ads.topBanner = topBanner;
  if (bottomBanner !== undefined) config.ads.bottomBanner = bottomBanner;
  if (popunderScript !== undefined) config.ads.popunderScript = popunderScript;

  saveConfig(config);
  return res.json({ success: true, config });
});

// API Delete Link
app.delete('/api/links/:id', (req, res) => {
  let links = getLinks();
  links = links.filter(l => l.id !== req.params.id);
  saveLinks(links);
  return res.json({ success: true });
});

// Visitor Route (Shortlink player / Safelink landing page with ads & stats tracking)
app.get('/v/:id', (req, res) => {
  const links = getLinks();
  const link = links.find(l => l.id === req.params.id);

  if (!link) {
    return res.status(404).send('<h2>404 - Shortlink Not Found or Expired</h2>');
  }

  // Record Click Stat
  link.clicks = (link.clicks || 0) + 1;
  saveLinks(links);

  const clicks = getClicks();
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  clicks.unshift({
    linkId: link.id,
    shortUrl: link.shortUrl,
    originalUrl: link.originalUrl,
    ip: clientIp,
    userAgent: req.headers['user-agent'] || 'Unknown',
    timestamp: new Date().toISOString()
  });
  saveClicks(clicks.slice(0, 500)); // Keep last 500 clicks

  const config = getConfig();
  const isVideo = link.originalUrl.match(/\.(mp4|webm|m3u8|ogg)$/i) || link.originalUrl.includes('cdn.');

  res.render('safelink', {
    link,
    config,
    isVideo,
    timerSeconds: config.timerSeconds || 5
  });
});

// Direct Redirect after unlock
app.get('/go/:id', (req, res) => {
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
      console.log(`⚠️ Port ${portToUse} terpakai, mencoba port ${portToUse + 1}...`);
      startServer(portToUse + 1);
    } else {
      console.error('Server Error:', err);
    }
  });
}

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  startServer(PORT);
}

module.exports = app;


