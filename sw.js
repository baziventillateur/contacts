// Contacts : la coquille de l'appli (fichiers, bibliothèque Supabase, police) vient du cache du téléphone,
// pour un lancement immédiat ; les données viennent toujours de Supabase (avec le cache local de l'appli).
// Gère aussi les notifications push (même principe que CovoitGo).
const C = 'contacts-v1.7.0';
const LIB = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
const SHELL = ['./', 'index.html', 'app.css?v=1.7.0', 'app.js?v=1.7.0', 'extras.js?v=1.7.0', 'manifest.webmanifest', 'icon-192.png'];
const EXT = ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(c => Promise.all([c.addAll(SHELL), c.add(new Request(LIB, { mode: 'cors' })).catch(() => {})])).catch(() => {}));
});
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
const garder = (r, res) => { if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(C).then(c => c.put(r, copy)); } return res; };
// réponse du cache tout de suite, mise à jour en arrière-plan pour la prochaine ouverture
const cacheDabord = (e, r) => caches.match(r).then(m => {
  const net = fetch(r).then(res => garder(r, res)).catch(() => m);
  if (m) { e.waitUntil(net); return m; }
  return net;
});
// page : réseau si rapide (pour voir tout de suite une nouvelle version), sinon le cache au bout de 1,5 s
const pageRapide = r => new Promise(resolve => {
  let fini = false;
  const t = setTimeout(() => caches.match(r).then(m => { if (m && !fini) { fini = true; resolve(m); } }), 1500);
  fetch(r).then(res => { garder(r, res); if (!fini) { fini = true; clearTimeout(t); resolve(res); } })
    .catch(() => caches.match(r).then(m => { if (!fini) { fini = true; clearTimeout(t); resolve(m || caches.match('./')); } }));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (EXT.includes(u.hostname)) return e.respondWith(cacheDabord(e, r));
  if (u.origin !== location.origin) return; // Supabase : toujours le réseau
  if (r.mode === 'navigate' || u.pathname.endsWith('/') || u.pathname.endsWith('.html')) return e.respondWith(pageRapide(r));
  if (u.search.includes('v=') || /\.(png|svg|webmanifest)$/.test(u.pathname)) return e.respondWith(cacheDabord(e, r));
  e.respondWith(fetch(r).then(res => garder(r, res)).catch(() => caches.match(r)));
});
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Contacts', {
    body: d.body || '', icon: 'icon-192.png', badge: 'icon-192.png', tag: d.tag || 'contacts', renotify: true, data: { url: d.url || './' }
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    const c = cs.find(x => x.url.startsWith(self.registration.scope));
    return c ? c.focus() : self.clients.openWindow(url);
  }));
});
