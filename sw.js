// Contacts : l'appli s'ouvre même hors ligne (coquille en cache) ; les données viennent toujours de Supabase.
const C = 'contacts-v1.0.0';
const SHELL = ['./', 'index.html', 'app.css?v=1.0.0', 'app.js?v=1.0.0', 'manifest.webmanifest', 'icon-192.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.addAll(SHELL)).catch(() => {})); });
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(fetch(r).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(C).then(c => c.put(r, copy)); }
    return res;
  }).catch(() => caches.match(r).then(m => m || caches.match('./'))));
});
