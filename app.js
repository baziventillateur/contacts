/* Contacts — appli de contacts centralisés (Supabase, espace crm du projet Malino) */
const APP_VERSION = '1.14.0';
const SHEET_URL = 'https://claude.ai/artifact/8CDf2v6LQcaRbUFmUVi4St'; // copie « Prospects PaceApp » (la base Contacts reste la référence)
const SB_URL = 'https://fcfkfuqzgsmckkxqfwuo.supabase.co';
const SB_KEY = 'sb_publishable_a3SNrQOSCH20T5sKsJxuAA_s7H4yCSR';
const sb = supabase.createClient(SB_URL, SB_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: 'contacts-auth' }
});

const PAGE = 50;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const app = $('#app');
const wide = () => window.matchMedia('(min-width: 900px)').matches;
const fmtN = n => (n ?? 0).toLocaleString('fr-FR');
const fmtD = x => x ? new Date(x).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

const STATUTS = ['Client', 'Utilisateur', 'Inscrit', 'À contacter', 'Contacté', 'A répondu', 'Intéressé', 'Pas intéressé', 'E-mail à vérifier', 'Ancien contact Beecook', 'Désinscrit'];
const ORIG_LABEL = { 'Beecook (2021-2022)': 'Beecook', 'Prospection PaceApp (Clay)': 'Clay', 'Prospection PaceApp (CV)': 'CV' };

/* ---------- icônes (traits) ---------- */
const I = {
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 19c.9-3 3.2-4.5 6-4.5s5.1 1.5 6 4.5"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.5c2.4 0 4.2 1.3 5 3.5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M4 7l8 6 8-6"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  sms: '<path d="M4 5h16v11H8l-4 4z"/>',
  wa: '<path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z"/>',
  build: '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M10 21v-4h4v4"/>',
  pin: '<path d="M12 21s-7-6.3-7-11.5A7 7 0 0 1 19 9.5C19 14.7 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  source: '<path d="M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  down: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  right: '<path d="M9 6l6 6-6 6"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  sheet: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M4 15h16M10 3v18"/>',
  ban: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
  out: '<path d="M15 4h4v16h-4M10 17l5-5-5-5M15 12H4"/>',
  send: '<path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6"/>',
  alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>'
};
const ico = (k, cls = '') => `<svg viewBox="0 0 24 24" aria-hidden="true" class="${cls}">${I[k]}</svg>`;

/* ---------- état ---------- */
const VUES_BASE = [
  { id: 'tous', nom: 'Contacts avec e-mail', icon: 'mail', f: {} },
  { id: 'sans_email', nom: 'Sans e-mail · à compléter', icon: 'alert', f: { email: 'sans' } },
  { id: 'tout', nom: 'Tous les contacts', icon: 'users', f: { email: 'tous' } },
  { id: 'joignables', nom: 'Joignables par e-mail', icon: 'mail', f: { joignables: true } },
  { id: 'favoris', nom: 'Favoris', icon: 'star', f: { favoris: true, email: 'tous' } },
  { id: 'prospection', nom: 'Prospection PaceApp', icon: 'flag', f: { origines: ['Prospection PaceApp (Clay)', 'Prospection PaceApp (CV)'] } },
  { id: 'chefs', nom: 'Chefs Beecook joignables', icon: 'user', f: { origines: ['Beecook (2021-2022)'], profils: ['chef'], joignables: true } },
  { id: 'a_contacter', nom: 'À contacter', icon: 'cal', f: { statuts: ['À contacter'] } },
  { id: 'exclus', nom: 'Exclus des envois', icon: 'ban', f: { exclus: true, email: 'tous' } }
];
const emptyF = () => ({ q: '', origines: [], statuts: [], profils: [], secteurs: [], tags: [], zone: '', campagne_recue: '', campagne_non_recue: '', nb_campagnes: '', email: 'avec', joignables: false, avec_tel: false, accord: false, favoris: false, exclus: false, tri: 'recent' });
const S = {
  user: null, stats: null, vues: [], favs: [], rows: [], total: 0, offset: 0, req: 0, page: 'contacts', camps: null,
  f: emptyF(), vue: 'tous', sel: new Set(),
  mode: localStorage.getItem('contacts-mode') || 'auto'
};
const viewMode = () => (wide() ? (S.mode === 'liste' ? 'liste' : 'table') : 'liste');

/* ---------- utilitaires ---------- */
const AVC = ['#E2EAFB', '#FDEBD8', '#DDF3EE', '#EFE4FB', '#ECEEF1', '#FBE3E3'];
function initials(r) {
  const a = (r.prenom || '').trim(), b = (r.nom || '').trim();
  let s = (a ? a[0] : '') + (b ? b[0] : '');
  if (!s) s = (r.email || '?')[0];
  return s.toUpperCase();
}
const avColor = id => AVC[(Number(id) || 0) % AVC.length];
function fullName(r) {
  const n = [r.prenom, r.nom].filter(Boolean).join(' ').trim();
  return n || r.email || r.entreprise || 'Sans nom';
}
function subLine(r) {
  const job = [r.metier, r.entreprise].filter(Boolean).join(' · ');
  if (job) return job + (r.ville ? ' · ' + r.ville : '');
  const prof = (r.profils_beecook || []).map(p => p[0].toUpperCase() + p.slice(1)).join(', ');
  return [prof, r.ville].filter(Boolean).join(' · ') || r.email || r.telephone || '';
}
function statutTone(s) {
  if (!s) return 't-gray';
  if (/désinscrit|pas intéressé/i.test(s)) return 't-bad';
  if (/intéressé|répondu/i.test(s)) return 't-ok';
  if (/contacté/i.test(s)) return 't-ok';
  if (/à contacter/i.test(s)) return 't-acc';
  if (/vérifier/i.test(s)) return 't-warn';
  return 't-gray';
}
function rowBadge(r) {
  if (r.desinscrit) return ['Désinscrit', 't-bad'];
  if (r.a_exclure) return ['Exclu', 't-gray'];
  if (r.interet && /chaud/i.test(r.interet)) return ['Chaud', 't-warn'];
  if (r.statut && r.statut !== 'Ancien contact Beecook') return [r.statut, statutTone(r.statut)];
  return [ORIG_LABEL[r.origine] || r.origine || '', 't-gray'];
}
function statusCell(r) {
  if (r.desinscrit) return ['Désinscrit', 't-bad'];
  if (r.a_exclure) return ['Exclu', 't-gray'];
  if (!r.statut) return ['', ''];
  if (r.statut === 'Ancien contact Beecook') return ['Ancien contact', 't-gray'];
  return [r.statut, statutTone(r.statut)];
}
function toast(t) {
  let el = $('#toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; document.body.appendChild(el); }
  el.textContent = t; el.classList.remove('hidden');
  clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.add('hidden'), 2400);
}
function errMsg(e) {
  const m = (e && (e.message || e.error_description)) || String(e || '');
  if (/interdit/.test(m)) return 'Ce compte n’a pas accès aux contacts.';
  if (/email_existe/.test(m)) return 'Un contact existe déjà avec cet e-mail.';
  if (/JWT|session/i.test(m)) return 'Session expirée, reconnecte-toi.';
  return 'Erreur : ' + m;
}
async function rpc(name, args) {
  const { data, error } = await sb.rpc(name, args);
  if (error) throw error;
  if (/^crm_(lot|supprimer|enregistrer|ajouter|vue_|campagne_enregistrer)/.test(name)) cachePut(c => { c.pages = {}; });
  return data;
}
/* ---------- cache local : l'écran s'affiche tout de suite avec la dernière liste connue, puis se met à jour ---------- */
const CK = 'contacts-cache-v1';
function cacheGet() {
  try { const c = JSON.parse(localStorage.getItem(CK) || 'null'); return c && S.user && c.u === S.user.email ? c : null; } catch (e) { return null; }
}
function cachePut(fn) {
  if (!S.user) return;
  try {
    const c = cacheGet() || { u: S.user.email, pages: {} };
    fn(c);
    const ks = Object.keys(c.pages || {}).sort((a, b) => (c.pages[b].t || 0) - (c.pages[a].t || 0));
    ks.slice(8).forEach(k => delete c.pages[k]); // on garde les 8 dernières listes ouvertes
    localStorage.setItem(CK, JSON.stringify(c));
  } catch (e) { try { localStorage.removeItem(CK); } catch (e2) { } }
}
const cacheKey = f => JSON.stringify(f);
const skeleton = () => `<div class="cards skel" aria-label="Chargement">${'<div class="row"><span class="av"></span><div class="txt"><i></i><i></i></div></div>'.repeat(8)}</div>`;
const activeCount = f => ['origines', 'statuts', 'profils', 'secteurs', 'tags'].reduce((n, k) => n + f[k].length, 0)
  + (f.zone ? 1 : 0) + ['campagne_recue', 'campagne_non_recue', 'nb_campagnes'].filter(k => f[k]).length
  + ['joignables', 'avec_tel', 'accord', 'favoris', 'exclus'].filter(k => f[k]).length;
/* étiquettes coloriées : une couleur stable par étiquette */
const TAGC = [['#E2EAFB', '#1F4FBF'], ['#DDF3EE', '#0F6B5C'], ['#FDEBD8', '#9A4A00'], ['#EFE4FB', '#5B2E91'], ['#FBE3E3', '#A12D2D'], ['#E6F4FA', '#0B6A8C'], ['#FFF4CC', '#7A5A00'], ['#E9F5E1', '#3C6E1E'], ['#FCE7F3', '#9D2463'], ['#ECEEF1', '#4A505C']];
function tagColors(t) { let h = 0; for (const ch of String(t || '').toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return TAGC[h % TAGC.length]; }
function tagStyle(t) { const c = tagColors(t); return `background:${c[0]};color:${c[1]}`; }
const campName = s => ((S.camps?.campagnes || []).find(c => c.slug === s) || {}).nom || s;
const campShort = n => String(n || '').replace(/^(PaceApp|Malino) · /, '').replace(/[«»]/g, '').trim();
const campDot = (c, big) => `<i class="cdot${big ? ' big' : ''}" style="background:${esc(c || '#94A0B8')}"></i>`;

/* ---------- connexion (même code e-mail que l'admin Malino) ---------- */
let loginEmail = '';
function loginView(step, msg) {
  app.innerHTML = `<form class="login" id="lf" autocomplete="on">
    <div class="logo">C</div><h1>Contacts</h1>
    ${step === 'code'
      ? `<p class="small mut">Code envoyé à <b>${esc(loginEmail)}</b></p>
         <label class="sr" for="code">Code reçu</label>
         <input id="code" inputmode="numeric" autocomplete="one-time-code" placeholder="Code reçu par e-mail" maxlength="10">
         <button class="btn primary" type="submit">Valider</button>
         <button class="btn link" type="button" id="back">Changer d’e-mail</button>`
      : `<p class="small mut">Connexion réservée aux admins</p>
         <label class="sr" for="mail">E-mail</label>
         <input id="mail" type="email" placeholder="ton e-mail admin" value="${esc(loginEmail)}" autocomplete="email">
         <button class="btn primary" type="submit">Recevoir un code</button>`}
    <p class="msg" id="msg">${esc(msg || '')}</p>
    <p class="small mut">v${APP_VERSION}</p>
  </form>`;
  const back = $('#back'); if (back) back.onclick = () => loginView('mail');
  $('#lf').onsubmit = async e => {
    e.preventDefault();
    if (step !== 'code') {
      loginEmail = $('#mail').value.trim().toLowerCase();
      if (!loginEmail) return;
      $('#msg').textContent = 'Envoi…';
      const r = await fetch(SB_URL + '/functions/v1/code-connexion', {
        method: 'POST', headers: { 'Content-Type': 'application/json', apikey: SB_KEY }, body: JSON.stringify({ email: loginEmail })
      }).then(x => x.json()).catch(() => ({}));
      if (r.ok || r.error === 'trop_vite') return loginView('code', r.ok ? '' : 'Un code vient déjà d’être envoyé');
      $('#msg').textContent = 'Envoi impossible. Réessaie dans un instant.';
      return;
    }
    const code = $('#code').value.replace(/\D/g, '');
    let r = { error: 1 };
    for (const t of ['email', 'magiclink', 'signup']) {
      r = await sb.auth.verifyOtp({ email: loginEmail, token: code, type: t });
      if (!r.error) break;
    }
    if (r.error) { $('#msg').textContent = 'Code incorrect ou expiré'; return; }
    boot();
  };
}

/* ---------- démarrage ---------- */
async function boot() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return loginView('mail');
  S.user = session.user;
  // affichage immédiat : compteurs et liste repris du cache, la liste et les compteurs se chargent en même temps
  const c = cacheGet();
  if (c && c.meta) { S.stats = c.meta.stats || null; S.vues = c.meta.vues || []; S.favs = c.meta.favs || []; S.camps = c.meta.camps || null; }
  shell();
  applyVue('tous');
  try {
    await refreshMeta();
  } catch (e) {
    if (/JWT|session/i.test(e.message || '')) return logout();
    app.innerHTML = `<div class="login"><div class="logo">C</div><p>${esc(errMsg(e))}</p>
      <button class="btn" id="lo">Se déconnecter</button></div>`;
    $('#lo').onclick = logout;
  }
}
async function logout() { try { localStorage.removeItem(CK); } catch (e) { } await sb.auth.signOut(); S.user = null; loginView('mail'); }
async function refreshMeta() {
  const [stats, vues, favs] = await Promise.all([
    rpc('crm_stats'), rpc('crm_vues'), rpc('crm_liste', { p: { favoris: true, limit: 6, tri: 'nom' } })
  ]);
  S.stats = stats; S.vues = vues || []; S.favs = favs.rows || [];
  if ($('#side')) renderSide();
  cachePut(c => { c.meta = Object.assign(c.meta || {}, { stats, vues: S.vues, favs: S.favs }); });
  refreshCamps(); // les chiffres des campagnes arrivent ensuite, sans bloquer la liste
  persoCamps();
}
function refreshCamps() {
  return rpc('crm_campagnes_vue').then(k => {
    S.camps = k;
    if ($('#side')) renderSide();
    if (S.page === 'campagnes' && $('#pCamp')) renderCampagnes(false);
    cachePut(c => { c.meta = Object.assign(c.meta || {}, { camps: k }); });
    return k;
  }).catch(() => S.camps);
}

/* ---------- squelette ---------- */
function shell() {
  app.innerHTML = `<div class="shell">
    <aside class="side" id="side" aria-label="Vues et favoris"></aside>
    <main class="main">
      <header class="top">
        <button class="icon only-m" id="menuBtn" aria-label="Ouvrir le menu">${ico('menu')}</button>
        <div class="ttl"><h1 id="vTitle">Contacts</h1><span id="vCount" class="mut small"></span></div>
        <div class="top-actions" id="topC">
          <div class="seg only-d" role="group" aria-label="Affichage">
            <button data-mode="table">${ico('table')}Tableau</button><button data-mode="liste">${ico('list')}Liste</button>
          </div>
          <a class="btn" id="sheetBtn" href="${SHEET_URL}" target="_blank" rel="noopener" title="Ouvrir le Sheet « Prospects PaceApp »" aria-label="Ouvrir le Sheet Prospects PaceApp">${ico('sheet')}<span class="only-d">Sheet</span></a>
          <button class="btn primary only-d" id="newBtn">${ico('plus')}Nouveau</button>
        </div>
        <div class="top-actions hidden" id="topK">
          <button class="btn" id="kRefresh">${ico('refresh')}<span class="only-d">Actualiser</span></button>
        </div>
        <div class="top-actions hidden" id="topL">
          <button class="btn" id="lRefresh" aria-label="Actualiser">${ico('refresh')}<span class="only-d">Actualiser</span></button>
          <button class="btn primary" id="lNew">${ico('plus')}<span class="only-d">Nouveau lien</span><span class="only-m">Lien</span></button>
        </div>
      </header>
      <div id="pContacts">
      <div class="toolbar">
        <label class="search">${ico('search')}<span class="sr">Rechercher</span>
          <input id="q" type="search" placeholder="Nom, e-mail, entreprise, ville, note…" autocomplete="off"></label>
        <button class="btn" id="filtBtn">${ico('filter')}Filtres <span class="badge" id="filtN"></span></button>
        <label class="sr" for="tri">Tri</label>
        <select class="sel" id="tri"><option value="recent">Récents</option><option value="nom">Nom A→Z</option><option value="ajout">Derniers ajoutés</option></select>
        <button class="xexp" id="expBtn" title="Exporter les contacts affichés (filtres compris) en CSV">${ico('down')}Exporter</button>
      </div>
      <div class="emseg" id="emSeg"></div>
      <div class="achips" id="achips"></div>
      <div class="bulk hidden" id="bulk"></div>
      <section id="list" aria-live="polite"></section>
      <div class="more" id="more"></div>
      </div>
      <div id="pCamp" class="hidden"></div>
      <div id="pLiens" class="hidden"></div>
    </main>
  </div>
  <button class="fab only-m" id="fab" aria-label="Ajouter un contact">${ico('plus')}</button>
  <nav class="bnav only-m" aria-label="Navigation">
    <button class="on" id="nContacts">${ico('users')}Contacts</button>
    <button id="nCamp">${ico('send')}Campagnes</button>
    <button id="nLiens">${ico('link')}Liens</button>
    <button id="nVues">${ico('list')}Vues</button>
  </nav>`;
  renderSide();
  $('#menuBtn').onclick = () => toggleSide(true);
  $('#nVues').onclick = () => toggleSide(true);
  $('#nContacts').onclick = () => { showPage('contacts'); applyVue('tous'); window.scrollTo(0, 0); };
  $('#nCamp').onclick = () => showPage('campagnes');
  $('#nLiens').onclick = () => showPage('liens');
  $('#kRefresh').onclick = () => renderCampagnes(true);
  $('#lRefresh').onclick = () => renderLiens(true);
  $('#lNew').onclick = () => openLienForm(null);
  $('#expBtn').onclick = exportCsv;
  $('#newBtn').onclick = () => openForm(null);
  $('#fab').onclick = () => openForm(null);
  $('#filtBtn').onclick = openFilters;
  $('#tri').onchange = e => { S.f.tri = e.target.value; load(true, true); };
  let t;
  $('#q').oninput = e => { clearTimeout(t); t = setTimeout(() => { S.f.q = e.target.value; load(true); }, 250); };
  $$('.seg button').forEach(b => b.onclick = () => { S.mode = b.dataset.mode; localStorage.setItem('contacts-mode', S.mode); renderList(); });
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); const q = $('#q'); if (q) q.focus(); }
    if (e.key === 'Escape') { if ($('#mveil')) return closeApercu(); closeDrawer(); toggleSide(false); }
  });
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(renderList, 150); });
  window.addEventListener('scroll', fabWatch, { passive: true });
}
/* « afficher plus » : au clic, ou tout seul quand on fait défiler jusqu'en bas (jamais en boucle) */
function moreGo() {
  const mb = $('#moreBtn');
  if (!mb || mb.classList.contains('busy') || S.refresh || S.page !== 'contacts' || S.rows.length >= S.total) return;
  mb.classList.add('busy');
  load(false);
}
/* bulles flottantes (+, photo) : elles s'effacent en bas de la liste ou quand on descend, reviennent quand on remonte */
let fabY = 0;
function fabWatch(e) {
  const y = window.scrollY, h = document.documentElement.scrollHeight, v = window.innerHeight;
  if (e && e.type === 'scroll' && y > fabY && y + v >= h * 0.8) moreGo(); // 80 % de la liste parcourue : on charge la suite
  const bas = y + v >= h - 140 && h > v + 40;
  const descend = y > fabY + 6 && y > 120;
  const monte = y < fabY - 6;
  if (bas || descend) document.body.classList.add('fab-off');
  else if (monte || y < 120) document.body.classList.remove('fab-off');
  fabY = y;
}
function toggleSide(open) {
  const s = $('#side'); if (!s) return;
  s.classList.toggle('open', !!open);
  let v = $('#sideVeil');
  if (open && !wide()) {
    if (!v) { v = document.createElement('div'); v.id = 'sideVeil'; v.className = 'veil'; v.style.zIndex = 30; v.onclick = () => toggleSide(false); document.body.appendChild(v); }
  } else if (v) v.remove();
}

/* ---------- barre latérale façon Twenty : vues + favoris ---------- */
function vueCount(v) {
  const st = S.stats; if (!st) return '';
  if (v.id === 'tous') return fmtN(st.avec_email ?? st.total);
  if (v.id === 'sans_email') return st.sans_email != null ? fmtN(st.sans_email) : '';
  if (v.id === 'tout') return fmtN(st.total);
  if (v.id === 'joignables') return fmtN(st.joignables);
  if (v.id === 'favoris') return fmtN(st.favoris);
  if (v.id === 'exclus') return fmtN(st.exclus);
  if (v.id === 'prospection') return fmtN((st.origines || []).filter(o => /Prospection/.test(o.v)).reduce((a, o) => a + o.n, 0));
  if (v.id === 'a_contacter') { const s = (st.statuts || []).find(o => o.v === 'À contacter'); return s ? fmtN(s.n) : '0'; }
  return '';
}
function renderSide() {
  const s = $('#side'); if (!s) return;
  const favs = S.favs.slice(0, 5);
  s.innerHTML = `
    <div class="brand"><div class="logo">C</div><b>Contacts</b></div>
    <button class="sbtn" id="sSearch">${ico('search')}Rechercher<span class="kbd only-d">⌘K</span></button>
    <button class="sbtn" id="sNew">${ico('plus')}Ajouter un contact</button>
    <div class="shead">Espaces</div>
    <button class="sbtn ${S.page === 'contacts' ? 'on' : ''}" id="sPContacts">${ico('users')}Contacts<span class="n">${S.stats ? fmtN(S.stats.total) : ''}</span></button>
    <button class="sbtn ${S.page === 'campagnes' ? 'on' : ''}" id="sPCamp">${ico('send')}Campagnes<span class="n">${S.camps ? fmtN(S.camps.total_envois) : ''}</span></button>
    <button class="sbtn" id="sEnv">${ico('mail')}Envoyés</button>
    <button class="sbtn ${S.page === 'liens' ? 'on' : ''}" id="sPLiens">${ico('link')}Liens d’inscription<span class="n">${S.liens ? fmtN(S.liens.reduce((a, l) => a + (+l.inscrits || 0), 0)) : ''}</span></button>
    <a class="sbtn" href="${SHEET_URL}" target="_blank" rel="noopener">${ico('sheet')}Sheet prospects<span class="n">↗</span></a>
    <div class="shead">Favoris</div>
    ${favs.length ? favs.map(r => `<button class="sbtn" data-fav="${r.id}"><span class="av" style="width:18px;height:18px;font-size:9px;background:${avColor(r.id)}">${esc(initials(r))}</span>${esc(fullName(r))}</button>`).join('')
      : '<p class="small mut" style="padding:0 8px;margin:2px 0">Touche l’étoile d’un contact pour l’ajouter ici.</p>'}
    ${S.favs.length > 5 ? `<button class="sbtn" data-vue="favoris" style="color:var(--acc)">Tout voir</button>` : ''}
    <div class="shead">Vues</div>
    ${VUES_BASE.map(v => `<button class="sbtn ${S.page === 'contacts' && S.vue === v.id ? 'on' : ''}" data-vue="${v.id}">${ico(v.icon)}${esc(v.nom)}<span class="n">${vueCount(v)}</span></button>`).join('')}
    ${S.vues.length ? `<div class="shead">Mes vues</div>` + S.vues.map(v => `<button class="sbtn ${S.vue === 'v' + v.id ? 'on' : ''}" data-vue="v${v.id}">${ico('eye')}${esc(v.nom)}<span class="x" data-delvue="${v.id}" role="button" aria-label="Supprimer la vue ${esc(v.nom)}">✕</span></button>`).join('') : ''}
    <div class="sfoot">
      <span class="small mut" style="overflow:hidden;text-overflow:ellipsis">${esc(S.user?.email || '')}</span>
      <button class="sbtn" id="sOut">${ico('out')}Se déconnecter</button>
      <span class="small mut">Contacts v${APP_VERSION}</span>
    </div>`;
  $('#sSearch').onclick = () => { toggleSide(false); $('#q').focus(); };
  $('#sNew').onclick = () => { toggleSide(false); openForm(null); };
  $('#sOut').onclick = logout;
  $('#sPContacts').onclick = () => { toggleSide(false); showPage('contacts'); };
  $('#sPCamp').onclick = () => { toggleSide(false); showPage('campagnes'); };
  $('#sEnv').onclick = () => { toggleSide(false); openEnvoyes(); };
  $('#sPLiens').onclick = () => { toggleSide(false); showPage('liens'); };
  $$('[data-fav]', s).forEach(b => b.onclick = () => { toggleSide(false); openFiche(+b.dataset.fav); });
  $$('[data-vue]', s).forEach(b => b.onclick = e => {
    if (e.target.closest('[data-delvue]')) return;
    toggleSide(false); showPage('contacts'); applyVue(b.dataset.vue);
  });
  $$('[data-delvue]', s).forEach(x => x.onclick = async e => {
    e.stopPropagation();
    if (!confirm('Supprimer cette vue ? Les contacts ne sont pas touchés.')) return;
    try { await rpc('crm_vue_supprimer', { p_id: +x.dataset.delvue }); if (S.vue === 'v' + x.dataset.delvue) S.vue = 'tous'; await refreshMeta(); } catch (er) { toast(errMsg(er)); }
  });
}
function applyVue(id) {
  let nom = 'Contacts', f = {};
  if (id.startsWith('v')) {
    const v = S.vues.find(x => 'v' + x.id === id); if (!v) return applyVue('tous');
    nom = v.nom; f = v.filtres || {};
  } else {
    const v = VUES_BASE.find(x => x.id === id) || VUES_BASE[0];
    nom = v.nom; f = v.f; id = v.id;
  }
  S.vue = id;
  if (S.page !== 'contacts') showPage('contacts', true);
  S.f = Object.assign(emptyF(), JSON.parse(JSON.stringify(f)), { tri: S.f.tri });
  $('#q').value = S.f.q || '';
  $('#vTitle').textContent = nom;
  renderSide();
  load(true, true);
}
function filtersChanged() {
  S.vue = null;
  if (!activeCount(S.f)) S.vue = { avec: 'tous', sans: 'sans_email', tous: 'tout' }[S.f.email] || 'tous';
  $('#vTitle').textContent = S.vue ? (VUES_BASE.find(v => v.id === S.vue) || {}).nom : 'Sélection filtrée';
  renderSide();
  load(true, true);
}

/* ---------- chargement ---------- */
async function load(reset, useCache) {
  const my = ++S.req;
  const key = cacheKey(S.f);
  let vu = null;
  if (reset) {
    S.offset = 0; S.rows = []; S.sel.clear();
    const hit = useCache ? ((cacheGet() || {}).pages || {})[key] : null;
    if (hit && hit.rows && hit.rows.length) {
      // la dernière liste connue s'affiche tout de suite
      vu = JSON.stringify([hit.total, hit.rows]);
      S.total = hit.total; S.autres = hit.autres ?? null; S.rows = hit.rows.slice(); S.offset = S.rows.length;
      renderChips(); renderList();
    } else $('#list').innerHTML = skeleton();
    S.refresh = my;
  }
  const p = Object.assign({}, S.f, { limit: PAGE, offset: reset ? 0 : S.offset });
  try {
    const d = await rpc('crm_liste', { p });
    if (my !== S.req) return;
    const neuf = d.rows || [];
    S.total = d.total; S.autres = d.autres ?? null;
    if (reset) {
      S.refresh = 0;
      S.rows = neuf; S.offset = neuf.length;
      if (!S.f.q) cachePut(c => { c.pages = c.pages || {}; c.pages[key] = { total: d.total, autres: d.autres, rows: neuf, t: Date.now() }; }); // pas de cache pour les recherches tapées
      renderChips();
      if (vu !== JSON.stringify([d.total, neuf])) renderList(); // rien ne bouge si la liste n'a pas changé
      else renderMore();
    } else {
      S.rows = S.rows.concat(neuf); S.offset = S.rows.length;
      renderChips();
      appendRows(neuf);
    }
  } catch (e) {
    if (my !== S.req) return;
    S.refresh = 0;
    if (reset && S.rows.length) { toast(errMsg(e)); renderMore(); }
    else if (reset) $('#list').innerHTML = `<p class="empty">${esc(errMsg(e))}</p>`;
    else { toast(errMsg(e)); renderMore(); }
    if (/JWT|session/i.test(e.message || '')) logout();
  }
}

function renderEmSeg() {
  const el = $('#emSeg'); if (!el) return;
  const m = S.f.email || 'avec', a = S.autres;
  const n = { avec: m === 'avec' ? S.total : m === 'sans' ? a : null, sans: m === 'sans' ? S.total : m === 'avec' ? a : null, tous: m === 'tous' ? S.total : null };
  const b = (k, lab) => `<button type="button" data-em="${k}" class="${m === k ? 'on' : ''}" aria-pressed="${m === k}">${lab}${n[k] != null ? ` <b>${fmtN(n[k])}</b>` : ''}</button>`;
  el.innerHTML = `<div class="eg" role="group" aria-label="Contacts selon l’e-mail">${b('avec', 'Avec e-mail')}${b('sans', 'Sans e-mail')}${b('tous', 'Tous')}</div>`
    + (m === 'sans' && S.total ? '<span class="hint">Ouvre un contact pour ajouter son e-mail</span>' : '');
  $$('[data-em]', el).forEach(x => x.onclick = () => { if (S.f.email === x.dataset.em) return; S.f.email = x.dataset.em; filtersChanged(); });
}
function renderChips() {
  $('#vCount').textContent = fmtN(S.total) + (S.total > 1 ? ' contacts' : ' contact');
  renderEmSeg();
  $('#filtN').textContent = activeCount(S.f) || '';
  $('#tri').value = S.f.tri;
  const c = [];
  const add = (lab, rm) => c.push({ lab, rm });
  S.f.origines.forEach(v => add(ORIG_LABEL[v] || v, () => S.f.origines = S.f.origines.filter(x => x !== v)));
  S.f.statuts.forEach(v => add(v, () => S.f.statuts = S.f.statuts.filter(x => x !== v)));
  S.f.profils.forEach(v => add('Profil : ' + v, () => S.f.profils = S.f.profils.filter(x => x !== v)));
  S.f.secteurs.forEach(v => add(v, () => S.f.secteurs = S.f.secteurs.filter(x => x !== v)));
  S.f.tags.forEach(v => add('#' + v, () => S.f.tags = S.f.tags.filter(x => x !== v)));
  if (S.f.zone) add('Zone : ' + S.f.zone, () => S.f.zone = '');
  if (S.f.campagne_recue) add('A reçu : ' + campShort(campName(S.f.campagne_recue)), () => S.f.campagne_recue = '');
  if (S.f.campagne_non_recue) add('N’a pas reçu : ' + campShort(campName(S.f.campagne_non_recue)), () => S.f.campagne_non_recue = '');
  if (S.f.nb_campagnes) add({ '0': 'Jamais contacté', '1': '1 campagne reçue', '2+': '2 campagnes ou plus' }[S.f.nb_campagnes], () => S.f.nb_campagnes = '');
  if (S.f.joignables) add('Joignables', () => S.f.joignables = false);
  if (S.f.avec_tel) add('Avec téléphone', () => S.f.avec_tel = false);
  if (S.f.accord) add('Accord e-mail', () => S.f.accord = false);
  if (S.f.favoris) add('Favoris', () => S.f.favoris = false);
  if (S.f.exclus) add('Exclus', () => S.f.exclus = false);
  const el = $('#achips');
  el.innerHTML = c.map((x, i) => `<button class="chip t-acc" data-i="${i}" aria-label="Retirer le filtre ${esc(x.lab)}">${esc(x.lab)} ✕</button>`).join('')
    + (c.length > 1 ? '<button class="btn link small" id="clrF">Tout effacer</button>' : '')
    + (sendable() && S.total ? `<div class="sendhint">${ico('send')}<span>Coche les contacts à qui envoyer « ${esc(campShort(campName(S.f.campagne_non_recue)))} »</span><button class="btn small" id="selAll">Tout sélectionner (${fmtN(S.rows.length)})</button></div>` : '');
  const sa = $('#selAll', el); if (sa) sa.onclick = () => { S.rows.forEach(r => { S.sel.add(r.id); paintPick(r.id); }); syncAllBox(); renderBulk(); };
  $$('[data-i]', el).forEach(b => b.onclick = () => { c[+b.dataset.i].rm(); filtersChanged(); });
  const clr = $('#clrF'); if (clr) clr.onclick = () => { const tri = S.f.tri; S.f = emptyF(); S.f.tri = tri; S.f.q = $('#q').value; filtersChanged(); };
}

function renderList() {
  const mode = viewMode();
  $$('.seg button').forEach(b => b.classList.toggle('on', b.dataset.mode === mode));
  const L = $('#list');
  if (!S.rows.length) {
    L.innerHTML = `<p class="empty">Aucun contact${S.f.q ? ' pour « ' + esc(S.f.q) + ' »' : ''}.</p>`;
    $('#more').innerHTML = '';
    renderBulk();
    return;
  }
  const tw0 = $('.tablewrap', L), keepTop = tw0 ? tw0.scrollTop : 0, keepLeft = tw0 ? tw0.scrollLeft : 0;
  L.innerHTML = mode === 'table' ? tableHtml() : listHtml();
  L.dataset.mode = mode;
  const tw = $('.tablewrap', L);
  // tableau : la suite se charge quand on a parcouru 80 % de ce qui est affiché
  if (tw) { tw.scrollTop = keepTop; tw.scrollLeft = keepLeft; tw.addEventListener('scroll', () => { if (tw.scrollTop + tw.clientHeight >= tw.scrollHeight * 0.8) moreGo(); }, { passive: true }); }
  // un seul écouteur pour toutes les lignes, y compris celles ajoutées ensuite
  L.onclick = e => {
    const pk = e.target.closest('[data-pick]');
    if (pk) { e.stopPropagation(); togglePick(+pk.dataset.pick); return; }
    if (e.target.closest('a,input')) return;
    const el = e.target.closest('[data-id]');
    if (el) openFiche(+el.dataset.id);
  };
  L.onchange = e => {
    const cb = e.target.closest('input[data-cb]');
    if (cb) return togglePick(+cb.dataset.cb, cb.checked);
    if (e.target.id === 'cbAll') { const on = e.target.checked; S.rows.forEach(r => { on ? S.sel.add(r.id) : S.sel.delete(r.id); paintPick(r.id); }); syncAllBox(); renderBulk(); }
  };
  renderMore();
  renderBulk();
  fabWatch();
}
/* page suivante : on ajoute seulement les nouvelles lignes au bas de la liste */
function appendRows(neuf) {
  const L = $('#list'), mode = viewMode();
  const box = L.dataset.mode === mode ? (mode === 'table' ? $('tbody', L) : $('.cards', L)) : null;
  if (!box) return renderList();
  box.insertAdjacentHTML('beforeend', neuf.map(mode === 'table' ? rowTr : rowCard).join(''));
  syncAllBox();
  renderMore();
  renderBulk();
  fabWatch();
}
function renderMore() {
  const left = S.total - S.rows.length;
  $('#more').innerHTML = left > 0
    ? `<button class="morebtn" id="moreBtn"><span class="lbl">Afficher ${Math.min(PAGE, left)} de plus</span><span class="sub">${fmtN(S.rows.length)} affichés sur ${fmtN(S.total)}</span><span class="ldots" aria-hidden="true"><i></i><i></i><i></i></span></button>`
    : `<div class="endlist"><span>✓</span>${S.total > 1 ? 'Les ' + fmtN(S.total) + ' contacts sont affichés' : 'Fin de la liste'}</div>`;
  const mb = $('#moreBtn'); if (mb) mb.onclick = moreGo;
}
/* cocher un contact : on met à jour seulement la ligne touchée (avant, toute la liste était redessinée à chaque clic) */
function togglePick(id, on) {
  if (on === undefined) on = !S.sel.has(id);
  on ? S.sel.add(id) : S.sel.delete(id);
  paintPick(id);
  syncAllBox();
  renderBulk();
}
function paintPick(id) {
  const on = S.sel.has(id);
  $$(`#list [data-id="${id}"]`).forEach(el => {
    el.classList.toggle('sel', on);
    const cb = $('input[data-cb]', el); if (cb) cb.checked = on;
    const av = $('[data-pick]', el);
    if (av) { av.classList.toggle('sel', on); const r = S.rows.find(x => x.id === id); av.textContent = on ? '✓' : (r ? initials(r) : ''); }
  });
}
function syncAllBox() {
  const all = $('#cbAll'); if (!all) return;
  const n = S.rows.filter(r => S.sel.has(r.id)).length;
  all.checked = !!S.rows.length && n === S.rows.length;
  all.indeterminate = n > 0 && n < S.rows.length;
}
function listHtml() {
  return `<div class="cards">${S.rows.map(rowCard).join('')}</div>`;
}
function rowCard(r) {
    const [b, t] = rowBadge(r); const sel = S.sel.has(r.id);
    return `<div class="row ${sel ? 'sel' : ''}" data-id="${r.id}">
      <button class="av ${sel ? 'sel' : ''}" style="border:0;background:${avColor(r.id)}" data-pick="${r.id}" aria-label="Sélectionner ${esc(fullName(r))}">${sel ? '✓' : esc(initials(r))}</button>
      <div class="txt"><span class="nm">${r.favori ? '<span style="color:#C98A00">★</span> ' : ''}${esc(fullName(r))}</span><span class="sub">${(r.camps || []).length ? `<span class="dots" title="${esc((r.camps || []).map(c => c.n).join(' · '))}">${(r.camps || []).map(c => campDot(c.c)).join('')}</span>` : ''}${esc(subLine(r))}</span></div>
      ${b ? `<span class="chip ${t}">${esc(b)}</span>` : ''}
    </div>`;
}
function tableHtml() {
  const allSel = S.rows.length && S.rows.every(r => S.sel.has(r.id));
  const th = (icon, lab, cls = '') => `<th class="${cls}"><span>${ico(icon)}${lab}</span></th>`;
  return `<div class="tablewrap"><table class="grid"><thead><tr>
      <th><label class="sr" for="cbAll">Tout sélectionner</label><input type="checkbox" id="cbAll" ${allSel ? 'checked' : ''}></th>
      ${th('user', 'Nom', 'name')}${th('mail', 'E-mail')}${th('phone', 'Téléphone')}${th('build', 'Entreprise / métier')}
      ${th('pin', 'Ville')}${th('source', 'Origine')}${th('flag', 'Statut')}${th('send', 'Campagnes reçues')}${th('tag', 'Étiquettes')}${th('cal', 'Dernier envoi')}
    </tr></thead><tbody>${S.rows.map(rowTr).join('')}</tbody></table></div>`;
}
function rowTr(r) {
      const sel = S.sel.has(r.id);
      const tags = (r.tags || []).slice(0, 2).map(x => `<span class="chip" style="${tagStyle(x)}">${esc(x)}</span>`).join('') + ((r.tags || []).length > 2 ? `<span class="chip out">+${r.tags.length - 2}</span>` : '');
      const cps = r.camps || [];
      const camps = cps.slice(0, 2).map(c => `<span class="cchip${c.st ? ' cprog' : ''}" title="${esc(c.n)} · ${esc(fmtD(c.d))}${c.st ? ' (programmé)' : ''}">${campDot(c.c)}${esc(campShort(c.n))}</span>`).join('') + (cps.length > 2 ? `<span class="chip out">+${cps.length - 2}</span>` : '');
      const [b, t] = statusCell(r);
      return `<tr class="${sel ? 'sel' : ''}" data-id="${r.id}">
        <td><input type="checkbox" data-cb="${r.id}" ${sel ? 'checked' : ''} aria-label="Sélectionner ${esc(fullName(r))}"></td>
        <td class="name"><div><span class="av" style="background:${avColor(r.id)}">${esc(initials(r))}</span><span class="nm">${esc(fullName(r))}</span>${r.favori ? '<span class="star">★</span>' : ''}</div></td>
        <td>${r.email ? `<a class="chip out" href="mailto:${esc(r.email)}">${esc(r.email)}</a>` : '<span class="mut">—</span>'}</td>
        <td>${r.telephone ? `<a href="tel:${esc(r.telephone)}" style="color:inherit;text-decoration:none">${esc(r.telephone)}</a>` : '<span class="mut">—</span>'}</td>
        <td>${esc([r.entreprise, r.metier].filter(Boolean).join(' · ')) || '<span class="mut">—</span>'}</td>
        <td>${esc(r.ville || '') || '<span class="mut">—</span>'}</td>
        <td><span class="chip t-gray">${esc(ORIG_LABEL[r.origine] || r.origine)}</span></td>
        <td>${b ? `<span class="chip ${t}" title="${esc(r.motif_exclusion || '')}">${esc(b)}</span>` : ''}</td>
        <td><div class="tags">${camps || '<span class="mut">—</span>'}</div></td>
        <td><div class="tags">${tags || '<span class="mut">—</span>'}</div></td>
        <td class="dim">${esc(fmtD(cps.length ? cps[cps.length - 1].d : r.date_dernier_envoi)) || '—'}</td>
      </tr>`;
}

/* ---------- actions groupées ---------- */
function renderBulk() {
  const el = $('#bulk'); const n = S.sel.size;
  if (!n) { el.classList.add('hidden'); el.innerHTML = ''; return; }
  el.classList.remove('hidden');
  el.innerHTML = `<b>${n} sélectionné${n > 1 ? 's' : ''}</b>
    <label class="sr" for="bStat">Changer le statut</label>
    <select id="bStat"><option value="">Statut…</option>${STATUTS.map(s => `<option>${esc(s)}</option>`).join('')}</select>
    ${sendable() ? `<button class="btn send" id="bSend">${ico('send')}Envoyer la campagne</button>` : ''}
    <button class="btn" id="bTag">${ico('tag')}Étiquettes</button>
    <button class="btn" id="bFav">${ico('star')}Favori</button>
    <button class="btn" id="bExc">${ico('ban')}Exclure</button>
    <button class="btn" id="bExp">${ico('down')}Exporter</button>
    <button class="btn" id="bDel">Supprimer</button>
    <button class="icon bare" id="bClr" style="color:#fff" aria-label="Annuler la sélection">${ico('x')}</button>`;
  const ids = () => Array.from(S.sel);
  const run = async (action, valeur, msg) => {
    try { const k = await rpc('crm_lot', { p_ids: ids(), p_action: action, p_valeur: valeur }); toast(`${msg} : ${k} contact${k > 1 ? 's' : ''}`); await refreshMeta(); load(true); }
    catch (e) { toast(errMsg(e)); }
  };
  $('#bStat').onchange = e => { if (e.target.value) run('statut', e.target.value, 'Statut mis à jour'); };
  $('#bTag').onclick = () => openTagLot(ids());
  const bs = $('#bSend'); if (bs) bs.onclick = () => openEnvoi(S.f.campagne_non_recue, ids());
  $('#bFav').onclick = () => run('favori', 'true', 'Ajouté aux favoris');
  $('#bExc').onclick = () => run('exclure', 'exclu à la main', 'Exclus des envois');
  $('#bExp').onclick = () => confirmExport(n, 'la sélection', () => downloadCsv(S.rows.filter(r => S.sel.has(r.id)), 'selection'));
  $('#bDel').onclick = async () => {
    if (!confirm(`Supprimer définitivement ${n} contact${n > 1 ? 's' : ''} ?`)) return;
    try { const k = await rpc('crm_supprimer', { p_ids: ids() }); toast(`${k} supprimé${k > 1 ? 's' : ''}`); await refreshMeta(); load(true); } catch (e) { toast(errMsg(e)); }
  };
  $('#bClr').onclick = () => { const ids = Array.from(S.sel); S.sel.clear(); ids.forEach(paintPick); syncAllBox(); renderBulk(); };
}

/* ---------- export CSV ---------- */
async function exportCsv() {
  const vue = ($('#vTitle')?.textContent || 'vue actuelle').trim();
  confirmExport(Math.min(S.total || 0, 5000), 'vue « ' + vue + ' »' + (S.total > 5000 ? ', les 5 000 premiers' : ''), async () => {
    try {
      toast('Préparation de l’export…');
      const d = await rpc('crm_liste', { p: Object.assign({}, S.f, { limit: 5000, offset: 0 }) });
      downloadCsv(d.rows || [], 'contacts');
    } catch (e) { toast(errMsg(e)); }
  });
}
/* confirmation simple avant un export */
function confirmExport(n, quoi, go) {
  const w = dialog('Exporter des contacts ?', `<p style="margin:0 0 10px;font-size:13.5px;line-height:1.45">Tu vas télécharger <b>${fmtN(n)} contact${n > 1 ? 's' : ''}</b> (${esc(quoi)}) dans un fichier CSV : noms, e-mails et téléphones.</p>
    <div class="mact"><button class="btn" id="xNo">Annuler</button><button class="btn primary" id="xGo">Exporter</button></div>`);
  $('#xNo', w).onclick = closeApercu;
  $('#xGo', w).onclick = () => { closeApercu(); go(); };
}
function downloadCsv(rows, base) {
  const cols = [['prenom', 'Prénom'], ['nom', 'Nom'], ['email', 'E-mail'], ['telephone', 'Téléphone'], ['entreprise', 'Entreprise'], ['metier', 'Métier'],
    ['ville', 'Ville'], ['zone', 'Zone'], ['secteur', 'Secteur'], ['origine', 'Origine'], ['statut', 'Statut'], ['interet', 'Intérêt'],
    ['tags', 'Étiquettes'], ['accord', 'Accord e-mail'], ['a_exclure', 'À exclure'], ['motif_exclusion', 'Motif exclusion'], ['date_dernier_envoi', 'Dernier envoi']];
  const cell = v => { const s = Array.isArray(v) ? v.join(', ') : v === true ? 'oui' : v === false ? 'non' : (v ?? ''); return '"' + String(s).replace(/"/g, '""') + '"'; };
  const csv = '﻿' + cols.map(c => cell(c[1])).join(';') + '\n' + rows.map(r => cols.map(c => cell(r[c[0]])).join(';')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = `${base}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
  toast(`${rows.length} contact${rows.length > 1 ? 's' : ''} exporté${rows.length > 1 ? 's' : ''}`);
}

/* ---------- tiroir ---------- */
function drawer(html) {
  closeDrawer();
  const v = document.createElement('div'); v.className = 'veil'; v.id = 'veil'; v.onclick = closeDrawer;
  const d = document.createElement('aside'); d.className = 'drawer'; d.id = 'drawer'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
  d.innerHTML = html;
  document.body.append(v, d);
  return d;
}
function closeDrawer() { const d = $('#drawer'), v = $('#veil'); if (d) d.remove(); if (v) v.remove(); }

/* ---------- fiche contact ---------- */
async function openFiche(id) {
  const d = drawer(`<div class="dhead"><button class="icon bare" id="dX" aria-label="Fermer">${ico('back')}</button><h2>Chargement…</h2></div><div class="dbody"></div>`);
  $('#dX', d).onclick = closeDrawer;
  let c;
  try { c = await rpc('crm_fiche', { p_id: id }); } catch (e) { $('.dbody', d).innerHTML = `<p class="empty">${esc(errMsg(e))}</p>`; return; }
  if (!c) { $('.dbody', d).innerHTML = '<p class="empty">Contact introuvable.</p>'; return; }
  renderFiche(d, c);
}
/* ---------- étiquettes : Tagify (github.com/yairEO/tagify), chargé seulement quand on en a besoin ---------- */
let TAGIFY = null;
function loadTagify() {
  if (window.Tagify) return Promise.resolve(window.Tagify);
  if (TAGIFY) return TAGIFY;
  const base = 'https://cdn.jsdelivr.net/npm/@yaireo/tagify@4.39.0/dist/';
  TAGIFY = new Promise((res, rej) => {
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = base + 'tagify.css'; l.crossOrigin = 'anonymous'; document.head.appendChild(l);
    const sc = document.createElement('script'); sc.src = base + 'tagify.js'; sc.crossOrigin = 'anonymous';
    sc.onload = () => res(window.Tagify); sc.onerror = () => { TAGIFY = null; rej(new Error('Tagify indisponible')); };
    document.head.appendChild(sc);
  });
  return TAGIFY;
}
const SUGG = new Map(); // suggestions déjà calculées pendant la session
/* champ d'étiquettes : on tape, il propose les étiquettes existantes ; « Créer » pour une nouvelle ; plusieurs à la fois ;
   en dessous, les étiquettes que portent les contacts qui lui ressemblent (même domaine, même entreprise, même origine) */
function tagPicker(host, init, ctxFn) {
  const st = { tg: null, sug: [], key: '' };
  host.classList.add('tpick');
  host.innerHTML = `<div class="tsug hidden" aria-label="Étiquettes suggérées"></div><input class="tin" aria-label="Étiquettes" placeholder="Ajouter une étiquette…">`;
  const inp = $('.tin', host), sug = $('.tsug', host);
  inp.value = (init || []).join(', ');
  const cur = () => st.tg ? st.tg.value.map(x => x.value) : inp.value.split(/[,;]/).map(x => x.trim()).filter(Boolean);
  const drawSug = () => {
    const have = new Set(cur().map(x => x.toLowerCase()));
    const l = st.sug.filter(x => !have.has(String(x.tag).toLowerCase()));
    sug.classList.toggle('hidden', !l.length);
    sug.innerHTML = l.length ? `<span>Suggérées :</span>` + l.map(x => `<button type="button" data-sg="${esc(x.tag)}" title="${esc(x.raison)} : ${x.n} contact${x.n > 1 ? 's' : ''} sur ${x.total}">+ ${esc(x.tag)}</button>`).join('') : '';
  };
  sug.onclick = e => { const b = e.target.closest('[data-sg]'); if (b) add([b.dataset.sg]); };
  const add = tags => { if (st.tg) st.tg.addTags(tags); else inp.value = [...new Set(cur().concat(tags))].join(', '); drawSug(); };
  const suggest = async () => {
    const c = Object.assign({}, typeof ctxFn === 'function' ? ctxFn() : (ctxFn || {}));
    const key = JSON.stringify(c);
    if (!c.email && !c.entreprise && !c.origine && !(c.emails || []).length) { st.sug = []; return drawSug(); }
    if (key === st.key) return drawSug();
    st.key = key;
    try {
      if (!SUGG.has(key)) SUGG.set(key, await rpc('crm_tags_suggeres', { p: c }) || []);
      if (st.key === key) { st.sug = SUGG.get(key); drawSug(); }
    } catch (e) { st.sug = []; drawSug(); }
  };
  loadTagify().then(Tagify => {
    if (!host.isConnected) return;
    const tg = new Tagify(inp, {
      whitelist: (S.stats?.tags || []).map(t => t.v), enforceWhitelist: false, editTags: false, duplicates: false,
      delimiters: ',|;', placeholder: 'Ajouter une étiquette…',
      dropdown: { enabled: 0, maxItems: 50, closeOnSelect: false, highlightFirst: true, fuzzySearch: true, caseSensitive: false },
      transformTag: d => { const c = tagColors(d.value); d.style = `--tag-bg:${c[0]};--tag-hover:${c[0]};--tag-text-color:${c[1]};--tag-remove-btn-color:${c[1]}`; },
      templates: { dropdownItemNoMatch(data) { return `<div class="${this.settings.classNames.dropdownItem} tcreate" value="noMatch" tabindex="0" role="option">+ Créer « <b>${esc(data.value)}</b> »</div>`; } }
    });
    tg.on('dropdown:select', e => {
      if (e.detail.elm && e.detail.elm.getAttribute('value') === 'noMatch') { const v = (tg.state.inputText || '').trim(); if (v) tg.addTags([v], true); tg.dropdown.hide(); }
    });
    tg.on('add', drawSug); tg.on('remove', drawSug);
    // téléphone : le champ remonte au milieu de l'écran pour laisser la place à la liste au-dessus du clavier
    tg.on('focus', () => { if (!wide()) setTimeout(() => host.scrollIntoView({ block: 'center', behavior: 'smooth' }), 250); });
    st.tg = tg;
  }).catch(() => { /* hors ligne : le champ texte simple reste utilisable (étiquettes séparées par des virgules) */ });
  suggest();
  return { get: cur, add, suggest, lock: on => { if (st.tg) st.tg.setReadonly(!!on); else inp.disabled = !!on; } };
}
function tagEditor(tags) {
  return `<div id="tagbox" data-tags="${esc(JSON.stringify(tags || []))}"></div>`;
}
function bindTagEditor(root, extra) {
  const box = $('#tagbox', root);
  const val = n => { const el = $(`[name=${n}]`, root); return el ? el.value.trim() : ''; };
  const tp = tagPicker(box, JSON.parse(box.dataset.tags || '[]'), () => ({ id: extra && extra.id || null, email: val('email'), entreprise: val('entreprise'), origine: (extra && extra.origine) || val('origine') }));
  ['email', 'entreprise', 'origine'].forEach(n => { const el = $(`[name=${n}]`, root); if (el) el.addEventListener('change', tp.suggest); });
  return tp.get;
}
function formFields(c) {
  const v = k => esc(c[k] ?? '');
  const st = STATUTS.includes(c.statut) || !c.statut ? STATUTS : [c.statut, ...STATUTS];
  return `<div class="fgrid">
    <label class="f">Prénom<input name="prenom" value="${v('prenom')}" autocomplete="off"></label>
    <label class="f">Nom<input name="nom" value="${v('nom')}" autocomplete="off"></label>
    <label class="f full">E-mail<input name="email" type="email" value="${v('email')}" autocomplete="off"${v('email') ? '' : ' class="need" placeholder="À compléter"'}></label>
    <label class="f">Téléphone<input name="telephone" type="tel" value="${v('telephone')}" autocomplete="off"></label>
    <label class="f">Ville<input name="ville" value="${v('ville')}" autocomplete="off"></label>
    <label class="f">Entreprise<input name="entreprise" value="${v('entreprise')}" autocomplete="off"></label>
    <label class="f">Métier / poste<input name="metier" value="${v('metier')}" autocomplete="off"></label>
    <label class="f">Secteur<input name="secteur" value="${v('secteur')}" list="secList" autocomplete="off"></label>
    <label class="f">Statut<select name="statut">${st.map(s => `<option ${s === (c.statut || 'À contacter') ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select></label>
    <label class="f">Intérêt<input name="interet" value="${v('interet')}" list="intList" autocomplete="off"></label>
    <label class="f">Code postal<input name="code_postal" value="${v('code_postal')}" autocomplete="off"></label>
    <label class="f full">Adresse<input name="adresse" value="${v('adresse')}" autocomplete="off"></label>
    <div class="f full">Étiquettes${tagEditor(c.tags || [])}</div>
    <label class="f full">Notes<textarea name="notes" rows="3" placeholder="Contexte, prochaine action…">${v('notes')}</textarea></label>
  </div>
  <datalist id="secList">${(S.stats?.secteurs || []).map(s => `<option value="${esc(s.v)}">`).join('')}</datalist>
  <datalist id="intList"><option value="Prospect chaud"><option value="Prospect tiède"><option value="Standard"></datalist>`;
}
function collect(root, getTags) {
  const p = {};
  $$('[name]', root).forEach(el => { p[el.name] = el.value; });
  p.tags = getTags();
  return p;
}
function renderFiche(d, c) {
  const [b, t] = statusCell(c);
  const digits = (c.telephone || '').replace(/\D/g, '');
  const wa = digits ? (digits.startsWith('0') ? '33' + digits.slice(1) : digits) : '';
  const suivi = [
    ['Origine', c.origine], ['Campagne', c.campagne], ['Dernier envoi', fmtD(c.date_dernier_envoi)],
    ['Mail Malino', [fmtD(c.mail_malino_le), c.suivi_malino].filter(Boolean).join(' · ')],
    ['Profils Beecook', (c.profils_beecook || []).join(', ')], ['Zone', c.zone], ['Âge', c.age],
    ['Premier contact', fmtD(c.date_premier_contact)],
    ['Accord e-mail', c.consentement && c.consentement.optin_time ? 'Oui (Mailchimp, ' + fmtD(c.consentement.optin_time) + ')' : ''],
    ['Exclusion', c.a_exclure ? (c.motif_exclusion || 'oui') : '']
  ].filter(x => x[1] !== null && x[1] !== undefined && x[1] !== '');
  const vers = (c.donnees_origine && c.donnees_origine.versions) || [];
  const nSrc = (c.sources || []).length;
  d.innerHTML = `
    <div class="dhead">
      <button class="icon bare" id="dX" aria-label="Fermer">${ico('back')}</button>
      <h2>${esc(fullName(c))}</h2>
      <button class="icon" id="dFav" aria-label="${c.favori ? 'Retirer des favoris' : 'Ajouter aux favoris'}" style="color:${c.favori ? '#C98A00' : 'var(--mut)'}">${c.favori ? '★' : '☆'}</button>
    </div>
    <form class="dbody" id="fForm">
      <div class="hero">
        <span class="av lg" style="background:${avColor(c.id)}">${esc(initials(c))}</span>
        <div style="min-width:0"><h3>${esc(fullName(c))}</h3><div class="small mut">${esc(subLine(c))}</div>
          <div class="chips">${b ? `<span class="chip ${t}">${esc(b)}</span>` : ''}<span class="chip t-gray">${esc(ORIG_LABEL[c.origine] || c.origine)}</span>${c.secteur ? `<span class="chip t-pur">${esc(c.secteur)}</span>` : ''}</div></div>
      </div>
      <div class="qa">
        <a class="${c.telephone ? '' : 'off'}" href="${c.telephone ? 'tel:' + esc(c.telephone) : '#'}">${ico('phone')}Appeler</a>
        <a class="${c.email ? '' : 'off'}" href="${c.email ? 'mailto:' + esc(c.email) : '#'}">${ico('mail')}E-mail</a>
        <a class="${c.telephone ? '' : 'off'}" href="${c.telephone ? 'sms:' + esc(c.telephone) : '#'}">${ico('sms')}SMS</a>
        <a class="${wa ? '' : 'off'}" href="${wa ? 'https://wa.me/' + wa : '#'}" target="_blank" rel="noopener">${ico('wa')}WhatsApp</a>
      </div>
      <div class="card"><h4>Coordonnées et suivi</h4>${formFields(c)}</div>
      ${c.commentaire_inscrit ? `<div class="card"><h4>Commentaire de l’inscrit</h4><p class="small" style="margin:0 0 6px;line-height:1.45;white-space:pre-line">${esc(c.commentaire_inscrit)}</p></div>` : ''}
      ${c.accroche ? `<div class="card"><h4>Accroche utilisée</h4><p class="small" style="margin:0 0 6px;line-height:1.45">${esc(c.accroche)}</p></div>` : ''}
      <div class="card"><h4>Campagnes reçues <span class="mut" id="envN" style="text-transform:none;letter-spacing:0"></span></h4><div id="envBox"><p class="small mut" style="margin:4px 0 8px">Chargement…</p></div>
        <button type="button" class="btn small" id="dCamp" style="margin-top:6px">${ico('plus')}Ajouter à une campagne</button></div>
      ${suivi.length ? `<div class="card"><h4>Historique</h4>${suivi.map(x => `<div class="kv"><span>${esc(x[0])}</span><span>${esc(x[1])}</span></div>`).join('')}</div>` : ''}
      ${vers.length || nSrc ? `<div class="card"><h4>Données d’origine <span class="mut" style="text-transform:none;letter-spacing:0">${nSrc} source${nSrc > 1 ? 's' : ''}</span></h4>
        <button type="button" class="btn link small" id="dOrig" style="padding:0">Développer</button><div id="origBox" class="hidden"></div></div>` : ''}
      <div style="display:flex;gap:8px;justify-content:space-between;flex-wrap:wrap">
        ${c.desinscrit ? '<span class="small mut">Ne plus contacter (activé)</span>' : '<button type="button" class="btn link small" id="dStop" style="color:var(--bad);padding:0">Ne plus contacter</button>'}
        <button type="button" class="btn link small" id="dDel" style="color:var(--bad);padding:0">Supprimer le contact</button>
      </div>
    </form>
    <div class="dfoot"><span class="small mut" id="dMsg" style="margin-right:auto;align-self:center"></span>
      <button class="btn" type="button" id="dCancel">Fermer</button><button class="btn primary" type="button" id="dSave">Enregistrer</button></div>`;
  const getTags = bindTagEditor(d, { id: c.id, origine: c.origine });
  loadEnvois(d, c);
  $('#dCamp', d).onclick = async () => {
    let cc = c;
    const em = $('[name=email]', d), v = em ? em.value.trim() : '';
    if (v && v.toLowerCase() !== (c.email || '').toLowerCase()) { // e-mail tapé mais pas encore enregistré : on enregistre d'abord
      cc = await save(d, Object.assign({ id: c.id }, collect($('#fForm', d), getTags)), true); if (!cc) return;
    }
    openAjoutCamp(d, cc);
  };
  $('#dX', d).onclick = closeDrawer;
  $('#dCancel', d).onclick = closeDrawer;
  $('#fForm', d).onsubmit = e => e.preventDefault();
  $('#dSave', d).onclick = () => save(d, Object.assign({ id: c.id }, collect($('#fForm', d), getTags)));
  $('#dFav', d).onclick = () => save(d, { id: c.id, favori: !c.favori }, true);
  const stop = $('#dStop', d);
  if (stop) stop.onclick = () => { if (confirm('Ne plus contacter cette personne ? Elle sera exclue de tous les envois.')) save(d, { id: c.id, desinscrit: true }, true); };
  $('#dDel', d).onclick = async () => {
    if (!confirm('Supprimer définitivement ce contact ?')) return;
    try { await rpc('crm_supprimer', { p_ids: [c.id] }); closeDrawer(); toast('Contact supprimé'); await refreshMeta(); load(true); } catch (e) { toast(errMsg(e)); }
  };
  const ob = $('#dOrig', d);
  if (ob) ob.onclick = () => {
    const box = $('#origBox', d);
    if (!box.classList.contains('hidden')) { box.classList.add('hidden'); ob.textContent = 'Développer'; return; }
    box.innerHTML = vers.map(v => `<div class="orig"><div class="src">${esc(v.sources.slice(0, 2).join(' · '))}${v.sources.length > 2 ? ` · +${v.sources.length - 2} autres` : ''}</div>
      <table>${Object.entries(v.valeurs || {}).map(([k, val]) => `<tr><td>${esc(k)}</td><td>${esc(val)}</td></tr>`).join('')}</table></div>`).join('')
      + ((c.donnees_origine && c.donnees_origine.segments) ? `<div class="orig"><div class="src">Listes / segments</div>${c.donnees_origine.segments.map(s => `<div>${esc(s)}</div>`).join('')}</div>` : '')
      + (nSrc ? `<div class="orig"><div class="src">Fichiers sources</div>${c.sources.map(s => `<div>${esc(s)}</div>`).join('')}</div>` : '');
    box.classList.remove('hidden'); ob.textContent = 'Réduire';
  };
}
async function save(d, p, quick) {
  const m = $('#dMsg', d); if (m) m.textContent = 'Enregistrement…';
  try {
    const c = await rpc('crm_enregistrer', { p });
    const i = S.rows.findIndex(r => r.id === c.id);
    if (i >= 0) S.rows[i] = Object.assign(S.rows[i], c);
    toast(quick ? 'Mis à jour' : 'Enregistré');
    renderFiche(d, c);
    renderList();
    refreshMeta();
    return c;
  } catch (e) { if (m) m.textContent = errMsg(e); else toast(errMsg(e)); }
}

/* ---------- nouveau contact ---------- */
function openForm() {
  const d = drawer(`<div class="dhead"><button class="icon bare" id="dX" aria-label="Fermer">${ico('x')}</button><h2>Nouveau contact</h2></div>
    <form class="dbody" id="nForm"><div class="card"><h4>Informations</h4>${formFields({ statut: 'À contacter', tags: [] })}</div>
      <label class="f">Origine<select name="origine"><option>Ajout manuel</option><option>Réseau / bouche-à-oreille</option><option>Salon / événement</option><option>Clay</option><option>LinkedIn</option></select></label>
    </form>
    <div class="dfoot"><span class="small mut" id="dMsg" style="margin-right:auto;align-self:center"></span>
      <button class="btn" type="button" id="dCancel">Annuler</button><button class="btn primary" type="button" id="dSave">Créer</button></div>`);
  const getTags = bindTagEditor(d);
  $('#dX', d).onclick = closeDrawer; $('#dCancel', d).onclick = closeDrawer;
  $('#nForm', d).onsubmit = e => e.preventDefault();
  setTimeout(() => { const f = $('[name=prenom]', d); if (f && wide()) f.focus(); }, 50);
  $('#dSave', d).onclick = async () => {
    const p = collect($('#nForm', d), getTags);
    if (!p.prenom && !p.nom && !p.email && !p.entreprise && !p.telephone) { $('#dMsg', d).textContent = 'Renseigne au moins un nom, un e-mail ou un téléphone.'; return; }
    $('#dMsg', d).textContent = 'Création…';
    try {
      const c = await rpc('crm_enregistrer', { p });
      toast('Contact créé');
      await refreshMeta();
      load(true);
      renderFiche(d, c);
    } catch (e) { $('#dMsg', d).textContent = errMsg(e); }
  };
}

/* ---------- filtres ---------- */
function openFilters() {
  const st = S.stats || {};
  const F = JSON.parse(JSON.stringify(S.f));
  const pillGroup = (key, items, labelFn, limit) => {
    const all = items || [];
    const shown = limit && all.length > limit ? all.slice(0, limit) : all;
    return `<div class="pills" data-group="${key}">${shown.map(o => `<button type="button" class="pill ${F[key].includes(o.v) ? 'on' : ''}" data-v="${esc(o.v)}">${esc(labelFn ? labelFn(o.v) : o.v)} <span class="n">${fmtN(o.n)}</span></button>`).join('')}
      ${limit && all.length > limit ? `<button type="button" class="btn link small" data-all="${key}">Tout voir (${all.length})</button>` : ''}</div>`;
  };
  const tog = (key, lab) => `<label class="tog"><span>${esc(lab)}</span><input type="checkbox" data-tog="${key}" ${F[key] ? 'checked' : ''}></label>`;
  const d = drawer(`<div class="dhead"><button class="icon bare" id="dX" aria-label="Fermer">${ico('x')}</button><h2>Filtres</h2><button class="btn link" id="fReset">Réinitialiser</button></div>
    <div class="dbody">
      <div class="fgroup"><h4>Origine</h4>${pillGroup('origines', st.origines, v => ORIG_LABEL[v] || v)}</div>
      <div class="fgroup"><h4>Statut</h4>${pillGroup('statuts', st.statuts)}</div>
      <div class="fgroup"><h4>Profil Beecook</h4>${pillGroup('profils', st.profils, v => v[0].toUpperCase() + v.slice(1))}</div>
      <div class="fgroup"><h4>Secteur</h4>${pillGroup('secteurs', st.secteurs, null, 8)}</div>
      <div class="fgroup"><h4>Étiquettes</h4>${pillGroup('tags', st.tags, null, 8)}</div>
      <div class="fgroup"><h4>Campagnes</h4>
        <div class="pills" data-nb>${[['0', 'Jamais contacté'], ['1', '1 campagne'], ['2+', '2 ou plus']].map(([v, l]) => `<button type="button" class="pill ${F.nb_campagnes === v ? 'on' : ''}" data-nbv="${v}">${l}</button>`).join('')}</div>
        <div class="fgrid">
          <label class="f">A reçu<select id="fRecue"><option value="">Peu importe</option>${campOpts(F.campagne_recue)}</select></label>
          <label class="f">N’a pas reçu<select id="fNonRecue"><option value="">Peu importe</option>${campOpts(F.campagne_non_recue)}</select></label>
        </div></div>
      <div class="fgroup"><h4>Zone</h4><label class="sr" for="fZone">Zone</label><select class="sel" id="fZone"><option value="">Toutes les zones</option>${(st.zones || []).map(z => `<option value="${esc(z.v)}" ${F.zone === z.v ? 'selected' : ''}>${esc(z.v)} (${fmtN(z.n)})</option>`).join('')}</select></div>
      <div class="fgroup" style="gap:0">${tog('joignables', 'Joignables par e-mail seulement')}${tog('avec_tel', 'Avec téléphone')}${tog('accord', 'Accord e-mail enregistré')}${tog('favoris', 'Favoris')}${tog('exclus', 'Exclus des envois seulement')}</div>
    </div>
    <div class="dfoot"><button class="btn" id="fSave">${ico('eye')}Enregistrer comme vue</button><button class="btn primary" id="fApply">Voir les contacts</button></div>`);
  const bindPills = () => $$('[data-group]', d).forEach(g => {
    const key = g.dataset.group;
    $$('.pill', g).forEach(p => p.onclick = () => {
      const v = p.dataset.v; const i = F[key].indexOf(v);
      i >= 0 ? F[key].splice(i, 1) : F[key].push(v); p.classList.toggle('on', i < 0);
    });
    const allBtn = $('[data-all]', g);
    if (allBtn) allBtn.onclick = () => { g.outerHTML = pillGroup(key, st[key], null, 0); bindPills(); };
  });
  bindPills();
  $$('[data-tog]', d).forEach(t => t.onchange = () => { F[t.dataset.tog] = t.checked; });
  $('#fZone', d).onchange = e => { F.zone = e.target.value; };
  $$('[data-nbv]', d).forEach(b => b.onclick = () => { F.nb_campagnes = F.nb_campagnes === b.dataset.nbv ? '' : b.dataset.nbv; $$('[data-nbv]', d).forEach(x => x.classList.toggle('on', x.dataset.nbv === F.nb_campagnes)); });
  $('#fRecue', d).onchange = e => { F.campagne_recue = e.target.value; };
  $('#fNonRecue', d).onchange = e => { F.campagne_non_recue = e.target.value; };
  $('#dX', d).onclick = closeDrawer;
  $('#fReset', d).onclick = () => { const tri = S.f.tri, q = S.f.q; S.f = emptyF(); S.f.tri = tri; S.f.q = q; closeDrawer(); filtersChanged(); };
  $('#fApply', d).onclick = () => { S.f = Object.assign(F, { q: $('#q').value, tri: S.f.tri }); closeDrawer(); filtersChanged(); };
  $('#fSave', d).onclick = async () => {
    const nom = prompt('Nom de la vue (ex. « Chefs Marseille ») :'); if (!nom || !nom.trim()) return;
    const f = Object.assign({}, F, { q: $('#q').value }); delete f.tri;
    try {
      const v = await rpc('crm_vue_enregistrer', { p_nom: nom.trim(), p_filtres: f });
      closeDrawer(); await refreshMeta(); applyVue('v' + v.id); toast('Vue enregistrée');
    } catch (e) { toast(errMsg(e)); }
  };
}

/* ---------- espaces : contacts / campagnes ---------- */
function showPage(pg, silent) {
  S.page = pg;
  const c = pg === 'campagnes', l = pg === 'liens', k = !c && !l;
  $('#pContacts').classList.toggle('hidden', !k);
  $('#pCamp').classList.toggle('hidden', !c);
  $('#pLiens').classList.toggle('hidden', !l);
  $('#topC').classList.toggle('hidden', !k);
  $('#topK').classList.toggle('hidden', !c);
  $('#topL').classList.toggle('hidden', !l);
  const fab = $('#fab'); if (fab) fab.classList.toggle('hidden', !k);
  const cam = $('#camFab'); if (cam) cam.classList.toggle('hidden', !k);
  $('#nContacts').classList.toggle('on', k);
  $('#nCamp').classList.toggle('on', c);
  $('#nLiens').classList.toggle('on', l);
  if (c) { $('#vTitle').textContent = 'Campagnes'; $('#vCount').textContent = ''; if (!silent) renderCampagnes(); }
  else if (l) { $('#vTitle').textContent = 'Liens d’inscription'; $('#vCount').textContent = ''; if (!silent) renderLiens(); }
  else if (!silent) { $('#vTitle').textContent = (VUES_BASE.find(v => v.id === S.vue) || {}).nom || 'Contacts'; renderChips(); }
  renderSide();
}
const MARKETING = ['prospection', 'relance', 'fidelisation'];
const TYPE_LABEL = { prospection: 'Prospection', relance: 'Relance', fidelisation: 'Fidélisation', transactionnel: 'Automatique', interne: 'Interne' };
function campOpts(sel) {
  return (S.camps?.campagnes || []).filter(c => MARKETING.includes(c.type))
    .map(c => `<option value="${esc(c.slug)}" ${c.slug === sel ? 'selected' : ''}>${esc(campShort(c.nom))}${c.nb + c.programmes ? ' (' + fmtN(c.nb + c.programmes) + ')' : ''}</option>`).join('');
}
function weekStart(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
function isoWeek(d) { const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return Math.ceil(((t - y0) / 86400000 + 1) / 7); }
const dm = x => x ? new Date(x).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : '';
function goContacts(f) {
  showPage('contacts', true);
  S.vue = null;
  S.f = Object.assign(emptyF(), f, { tri: S.f.tri });
  $('#q').value = '';
  filtersChanged();
  window.scrollTo(0, 0);
}
function shortList(items, n, render, id) {
  if (!items.length) return '';
  const first = items.slice(0, n).map(render).join('');
  const rest = items.length > n ? `<div class="hidden" id="${id}">${items.slice(n).map(render).join('')}</div><button class="btn link small" data-more="${id}">Tout voir (${items.length})</button>` : '';
  return first + rest;
}
async function renderCampagnes(force) {
  const P = $('#pCamp');
  if (force || !S.camps) {
    P.innerHTML = '<p class="empty">Chargement…</p>';
    try { S.camps = await rpc('crm_campagnes_vue'); } catch (e) { P.innerHTML = `<p class="empty">${esc(errMsg(e))}</p>`; return; }
    renderSide();
  }
  const K = S.camps;
  const camps = (K.campagnes || []).filter(c => MARKETING.includes(c.type));
  const actives = camps.filter(c => c.nb + c.programmes > 0);
  const cov = K.couverture || { contacts: 0, jamais: 0, une: 0, plusieurs: 0 };
  const pct = v => cov.contacts ? Math.max(0, Math.round(v / cov.contacts * 1000) / 10) : 0;
  // frise : semaines du premier envoi (max 12 semaines) à la semaine prochaine
  const fr = K.frise || [];
  const now = weekStart(new Date());
  let first = fr.length ? weekStart(fr.reduce((m, x) => x.semaine < m ? x.semaine : m, fr[0].semaine)) : new Date(now);
  const minW = new Date(now); minW.setDate(minW.getDate() - 7 * 11);
  if (first < minW) first = minW;
  const lastFr = fr.length ? weekStart(fr.reduce((m, x) => x.semaine > m ? x.semaine : m, fr[0].semaine)) : now;
  const end = new Date(Math.max(now.getTime(), lastFr.getTime()));
  const weeks = []; for (let w = new Date(first); w <= end; w.setDate(w.getDate() + 7)) weeks.push(new Date(w));
  const key = d => { const x = new Date(d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
  const cell = {}; let mx = 1;
  fr.forEach(x => { const k = x.campagne + '|' + key(weekStart(x.semaine)); cell[k] = cell[k] || { nb: 0, prog: 0 }; cell[k].nb += x.nb; cell[k].prog += x.prog; mx = Math.max(mx, cell[k].nb); });
  const rowsF = actives.slice().sort((a, b) => String(a.premier).localeCompare(String(b.premier)));
  const friseHtml = rowsF.length ? `<div class="frise" style="--n:${weeks.length}">
      <div class="fh lab">Campagne</div>${weeks.map(w => `<div class="fh ${key(w) === key(now) ? 'now' : ''}">S${isoWeek(w)}<span>${dm(w)}</span></div>`).join('')}
      ${rowsF.map(c => `<button class="fl" data-camp="${esc(c.slug)}" title="${esc(c.nom)}">${campDot(c.couleur)}<span>${esc(campShort(c.nom))}</span></button>${weeks.map(w => {
        const v = cell[c.slug + '|' + key(w)];
        if (!v) return `<div class="fc ${key(w) === key(now) ? 'now' : ''}"></div>`;
        const sz = Math.round(18 + 16 * Math.sqrt(v.nb / mx));
        const prog = v.prog && v.prog === v.nb;
        return `<div class="fc ${key(w) === key(now) ? 'now' : ''}"><button class="bub ${prog ? 'bprog' : ''}" data-camp="${esc(c.slug)}" style="--c:${esc(c.couleur)};width:${sz}px;height:${sz}px" title="${esc(c.nom)} · semaine du ${dm(w)} : ${v.nb} envoi${v.nb > 1 ? 's' : ''}${v.prog ? ' (dont ' + v.prog + ' programmé' + (v.prog > 1 ? 's' : '') + ')' : ''}">${v.nb}</button></div>`;
      }).join('')}`).join('')}
    </div>` : '<p class="small mut">Aucun envoi enregistré pour l’instant.</p>';
  const rap = K.rapproches || [], dbl = K.doublons || [];
  const alertes = `
    ${dbl.length ? `<div class="alert bad"><b>${fmtN(dbl.length)} personne${dbl.length > 1 ? 's ont' : ' a'} reçu la même campagne plusieurs fois</b>
      ${shortList(dbl, 5, x => `<button class="aitem" data-pid="${x.prospect_id || ''}">${esc(x.email)}<span>${esc(campShort(x.nom_campagne))} · ${x.nb} fois (${esc((x.dates || []).join(', '))})</span></button>`, 'mDbl')}</div>` : `<div class="alert ok"><b>✓ Personne n’a reçu deux fois la même campagne.</b></div>`}
    ${rap.length ? `<div class="alert warn"><b>${fmtN(rap.length)} personne${rap.length > 1 ? 's ont' : ' a'} reçu 2 campagnes différentes à moins de 7 jours d’écart</b>
      <span class="small mut">Laisse au moins une semaine entre deux mails à la même personne.</span>
      ${shortList(rap, 5, x => `<button class="aitem" data-pid="${x.prospect_id || ''}">${esc(x.email)}<span>${esc(campShort(x.c1))} → ${esc(campShort(x.c2))} · ${String(x.jours).replace('.', ',')} j</span></button>`, 'mRap')}</div>` : ''}`;
  const card = c => {
    const vide = !(c.nb + c.programmes);
    return `<div class="ccard ${vide ? 'vide' : ''}" style="--c:${esc(c.couleur)}">
      <div class="chd"><label class="cpick" title="Changer la couleur de l’étiquette">${campDot(c.couleur, true)}<input type="color" value="${esc(c.couleur)}" data-color="${esc(c.slug)}"></label>
        <button class="cname" data-camp="${esc(c.slug)}">${esc(campShort(c.nom))}<span class="cmeta">${esc(c.marque || '')}${c.marque ? ' · ' : ''}${esc(TYPE_LABEL[c.type] || c.type)}</span></button></div>
      <div class="cnums">
        <div><b>${fmtN(c.nb)}</b><span>envoyé${c.nb > 1 ? 's' : ''}</span></div>
        <div><b>${fmtN(c.personnes)}</b><span>personne${c.personnes > 1 ? 's' : ''}</span></div>
        <div class="${c.programmes ? 'p' : ''}"><b>${fmtN(c.programmes)}</b><span>à venir</span></div>
        <div class="${c.rebonds ? 'r' : ''}"><b>${fmtN(c.rebonds)}</b><span>rebond${c.rebonds > 1 ? 's' : ''}</span></div>
      </div>
      <div class="cfoot"><span class="small mut">${vide ? 'Pas encore envoyée' : c.premier === c.dernier || dm(c.premier) === dm(c.dernier) ? 'Le ' + esc(fmtD(c.premier)) : 'Du ' + esc(dm(c.premier)) + ' au ' + esc(fmtD(c.dernier))}</span>
        <span class="cbtns">${vide ? '' : `<button class="btn small" data-recue="${esc(c.slug)}">Ont reçu</button>`}<button class="btn small" data-nonrecue="${esc(c.slug)}">Pas reçu</button></span></div>
    </div>`;
  };
  const sync = K.synchro ? `Historique Resend importé le ${fmtD(K.synchro)}` : '';
  P.innerHTML = `<div class="cwrap">
    <section class="jcard" id="cJours" aria-label="Envois par jour"></section>
    <div class="kpis">
      <button class="kpi" data-go="all"><b>${fmtN(cov.contacts)}</b><span>contacts joignables</span></button>
      <button class="kpi k0" data-go="0"><b>${fmtN(cov.jamais)}</b><span>jamais contactés</span></button>
      <button class="kpi k1" data-go="1"><b>${fmtN(cov.une)}</b><span>1 campagne reçue</span></button>
      <button class="kpi k2" data-go="2+"><b>${fmtN(cov.plusieurs)}</b><span>2 campagnes ou plus</span></button>
    </div>
    <div class="covbar" title="Part des contacts joignables déjà touchés">
      <i class="c0" style="width:${pct(cov.jamais)}%"></i><i class="c1" style="width:${pct(cov.une)}%"></i><i class="c2" style="width:${pct(cov.plusieurs)}%"></i>
    </div>
    <div class="leg small mut"><span><i class="c0"></i>Jamais contactés ${pct(cov.jamais)} %</span><span><i class="c1"></i>1 campagne ${pct(cov.une)} %</span><span><i class="c2"></i>2 ou plus ${pct(cov.plusieurs)} %</span></div>
    <section class="csec"><h3>Derniers envois <span class="small mut">tout ce qui est parti, campagne ou pas</span></h3>
      <div id="cEnv"><p class="small mut">Chargement…</p></div><button class="btn link small" id="cEnvAll">Tout voir</button></section>
    <section class="csec"><h3>Frise des envois <span class="small mut">par semaine · touche une bulle pour voir les destinataires</span></h3>
      <div class="fwrap">${friseHtml}</div>
      <div class="leg small mut"><span><i class="bubl"></i>envoyés</span><span><i class="bubl bprog"></i>programmés</span><span>${esc(sync)}</span></div></section>
    <section class="csec"><h3>À surveiller</h3>${alertes}</section>
    <section class="csec"><h3>Campagnes <span class="small mut">${actives.length} envoyée${actives.length > 1 ? 's' : ''} · touche la pastille pour changer la couleur</span></h3>
      <button class="btn small cnew" id="cNew">${ico('plus')}Nouvelle campagne</button>
      <div class="cgrid">${camps.slice().sort((a, b) => ((b.nb + b.programmes) > 0) - ((a.nb + a.programmes) > 0) || String(b.dernier || '').localeCompare(String(a.dernier || ''))).map(card).join('')}</div></section>
  </div>`;
  drawJours($('#cJours', P), K);
  envRecents($('#cEnv', P)); $('#cEnvAll', P).onclick = () => openEnvoyes();
  $('#cNew', P).onclick = openNouvelleCampagne;
  $$('[data-go]', P).forEach(b => b.onclick = () => { const g = b.dataset.go; goContacts(g === 'all' ? { joignables: true } : { nb_campagnes: g, joignables: true }); });
  $$('[data-camp]', P).forEach(b => b.onclick = () => openCampagne(b.dataset.camp));
  $$('[data-recue]', P).forEach(b => b.onclick = () => goContacts({ campagne_recue: b.dataset.recue }));
  $$('[data-nonrecue]', P).forEach(b => b.onclick = () => goContacts({ campagne_non_recue: b.dataset.nonrecue, joignables: true }));
  $$('[data-pid]', P).forEach(b => b.onclick = () => { if (b.dataset.pid) openFiche(+b.dataset.pid); });
  $$('[data-more]', P).forEach(b => b.onclick = () => { $('#' + b.dataset.more).classList.remove('hidden'); b.remove(); });
  $$('[data-color]', P).forEach(inp => inp.onchange = async () => {
    try { await rpc('crm_campagne_enregistrer', { p_slug: inp.dataset.color, p_nom: null, p_couleur: inp.value }); toast('Couleur enregistrée'); renderCampagnes(true); }
    catch (e) { toast(errMsg(e)); }
  });
}
/* ---------- envois par jour : histogramme empilé par campagne + calendrier façon GitHub ---------- */
const JPLAGES = [14, 30, 90];
function drawJours(box, K) {
  if (!box) return;
  const auj = K.aujourdhui || new Date().toISOString().slice(0, 10);
  const DAY = 864e5, t0 = Date.parse(auj + 'T00:00:00Z');
  const iso = t => new Date(t).toISOString().slice(0, 10);
  const camps = {}; (K.campagnes || []).forEach(c => camps[c.slug] = c);
  // jour → { n, p, r, par campagne }
  const J = {};
  (K.jours || []).forEach(x => {
    const j = J[x.d] = J[x.d] || { n: 0, p: 0, r: 0, c: {} };
    j.n += x.n; j.p += x.p; j.r += x.r;
    j.c[x.c] = (j.c[x.c] || 0) + x.n + x.p;
  });
  const get = d => J[d] || { n: 0, p: 0, r: 0, c: {} };
  const somme = k => { let t = 0; for (let i = 0; i < k; i++) t += get(iso(t0 - i * DAY)).n; return t; };
  let plage = 30; try { plage = +localStorage.getItem('cx-jours') || 30; } catch (e) { }
  if (!JPLAGES.includes(plage)) plage = 30;
  let sel = auj;
  // jours à venir avec des envois programmés (2 semaines max)
  let fin = t0; Object.keys(J).forEach(d => { const t = Date.parse(d + 'T00:00:00Z'); if (t > fin && J[d].p) fin = Math.min(t, t0 + 14 * DAY); });
  const nomJour = d => { const t = new Date(Date.parse(d + 'T12:00:00Z')).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }); return t.charAt(0).toUpperCase() + t.slice(1); };
  const court = d => d.slice(8, 10) + '/' + d.slice(5, 7);
  const couleur = slug => (camps[slug] && camps[slug].couleur) || '#94A0B8';
  const auj0 = get(auj).n, hier = get(iso(t0 - DAY)).n;
  const ecart = auj0 - hier;
  const draw = () => {
    const jours = []; for (let t = t0 - (plage - 1) * DAY; t <= fin; t += DAY) jours.push(iso(t));
    const mx = Math.max(1, ...jours.map(d => get(d).n + get(d).p));
    const graduation = (() => { const p = Math.pow(10, Math.floor(Math.log10(mx))); const m = [1, 2, 2.5, 5, 10].find(k => k * p >= mx); return m * p; })();
    const pas = plage <= 14 ? 2 : plage <= 30 ? 7 : 14;
    const col = d => {
      const j = get(d), tot = j.n + j.p;
      const seg = Object.entries(j.c).sort((a, b) => b[1] - a[1]).map(([c, v]) => `<i style="height:${v / tot * 100}%;background:${esc(couleur(c))}"></i>`).join('');
      const we = [0, 6].includes(new Date(Date.parse(d + 'T12:00:00Z')).getUTCDay());
      return `<div class="jc ${we ? 'we' : ''} ${d === auj ? 'auj' : ''} ${d > auj ? 'fut' : ''} ${d === sel ? 'sel' : ''}" data-d="${d}">
        <div class="jb ${j.p && !j.n ? 'prog' : ''}" style="height:${tot ? Math.max(3, tot / graduation * 100) : 0}%">${seg}</div>
        ${d === sel && tot ? `<span class="jv">${fmtN(tot)}</span>` : ''}</div>`;
    };
    const labels = jours.map((d, i) => (d === auj || (i % pas === 0 && Math.abs(Date.parse(d) - t0) > DAY * (pas / 2))) ? `<span style="left:${(i + .5) / jours.length * 100}%" class="${d === auj ? 'auj' : ''}">${d === auj ? 'Auj.' : court(d)}</span>` : '').join('');
    const j = get(sel);
    const det = Object.entries(j.c).sort((a, b) => b[1] - a[1]);
    // calendrier 26 semaines (lundi → dimanche), comme le graphique des contributions GitHub
    const lun = t0 - ((new Date(t0).getUTCDay() + 6) % 7) * DAY;
    const debut = lun - 25 * 7 * DAY;
    let maxH = 1; for (let t = debut; t <= t0; t += DAY) maxH = Math.max(maxH, get(iso(t)).n);
    const niv = n => n ? Math.min(4, Math.max(1, Math.ceil(4 * Math.sqrt(n / maxH)))) : 0;
    let cal = '', mois = '', total6 = 0, actifs = 0;
    for (let w = 0; w < 26; w++) {
      const tw = debut + w * 7 * DAY, dw = new Date(tw);
      if (dw.getUTCDate() <= 7) mois += `<span style="grid-column:${w + 1}">${dw.toLocaleDateString('fr-FR', { month: 'short', timeZone: 'UTC' }).replace('.', '')}</span>`;
      cal += '<div class="hw">' + [0, 1, 2, 3, 4, 5, 6].map(k => {
        const t = tw + k * DAY; if (t > t0) return '<i class="vide"></i>';
        const d = iso(t), n = get(d).n; total6 += n; if (n) actifs++;
        return `<i class="h${niv(n)} ${d === sel ? 'sel' : ''}" data-d="${d}" title="${esc(nomJour(d))} : ${n} mail${n > 1 ? 's' : ''}"></i>`;
      }).join('') + '</div>';
    }
    box.innerHTML = `
      <div class="jhd"><h3>Envois par jour</h3>
        <div class="seg" role="tablist">${JPLAGES.map(k => `<button class="${k === plage ? 'on' : ''}" data-pl="${k}" role="tab" aria-selected="${k === plage}">${k} j</button>`).join('')}</div></div>
      <div class="jkpi">
        <div class="big"><b>${fmtN(auj0)}</b><span>mail${auj0 > 1 ? 's' : ''} aujourd’hui</span>${hier || auj0 ? `<em class="${ecart > 0 ? 'up' : ecart < 0 ? 'down' : ''}">${ecart > 0 ? '▲ +' + fmtN(ecart) : ecart < 0 ? '▼ ' + fmtN(ecart) : '='} vs hier</em>` : ''}</div>
        <div><b>${fmtN(hier)}</b><span>hier</span></div>
        <div><b>${fmtN(somme(7))}</b><span>7 jours</span></div>
        <div><b>${fmtN(somme(30))}</b><span>30 jours</span></div>
      </div>
      <div class="jgraph" style="--n:${jours.length}">
        <div class="jaxe"><span style="top:0">${fmtN(graduation)}</span><span style="top:50%">${fmtN(graduation / 2)}</span><span style="top:100%">0</span></div>
        <div class="jbars">${jours.map(col).join('')}</div>
        <div class="jx">${labels}</div>
      </div>
      <div class="jdet"><div class="jsum"><b>${esc(nomJour(sel))}</b> · ${fmtN(j.n)} mail${j.n > 1 ? 's' : ''}${j.p ? ` · <span class="pur">${fmtN(j.p)} programmé${j.p > 1 ? 's' : ''}</span>` : ''}${j.r ? ` · <span class="bad">${fmtN(j.r)} rebond${j.r > 1 ? 's' : ''}</span>` : ''}</div>
        ${det.length ? `<div class="jchips">${det.map(([c, v]) => `<button data-camp="${esc(c)}">${campDot(couleur(c))}${esc(campShort((camps[c] || {}).nom || c))}<b>${fmtN(v)}</b></button>`).join('')}</div>` : '<div class="small mut">Aucun envoi ce jour-là.</div>'}</div>
      <div class="heat">
        <div class="hmois">${mois}</div>
        <div class="hgrid">${cal}</div>
        <div class="hleg small mut"><span>${fmtN(total6)} mails sur 6 mois · ${actifs} jour${actifs > 1 ? 's' : ''} d’envoi</span><span class="hl">Moins <i class="h0"></i><i class="h1"></i><i class="h2"></i><i class="h3"></i><i class="h4"></i> Plus</span></div>
      </div>`;
    $$('[data-pl]', box).forEach(b => b.onclick = () => { plage = +b.dataset.pl; try { localStorage.setItem('cx-jours', plage); } catch (e) { } draw(); });
    $$('.jchips [data-camp]', box).forEach(b => b.onclick = () => openCampagne(b.dataset.camp));
    $$('.hgrid [data-d]', box).forEach(c => c.onclick = () => { sel = c.dataset.d; if (Date.parse(sel) < t0 - (plage - 1) * DAY) plage = 90; draw(); });
    // barres : on suit le doigt / la souris pour lire chaque jour, même quand les barres sont fines
    const bars = $('.jbars', box);
    const pick = e => {
      const r = bars.getBoundingClientRect(); const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      const i = Math.max(0, Math.min(jours.length - 1, Math.floor(x / r.width * jours.length)));
      if (jours[i] !== sel) { sel = jours[i]; draw(); }
    };
    bars.onclick = pick;
    bars.onpointermove = e => { if (e.pointerType === 'mouse') pick(e); };
    bars.addEventListener('touchmove', e => { pick(e); }, { passive: true });
  };
  draw();
}
async function openCampagne(slug) {
  const d = drawer(`<div class="dhead"><button class="icon bare" id="dX" aria-label="Fermer">${ico('back')}</button><h2>Chargement…</h2></div><div class="dbody"></div>`);
  $('#dX', d).onclick = closeDrawer;
  let r;
  try { r = await rpc('crm_campagne_detail', { p_slug: slug }); } catch (e) { $('.dbody', d).innerHTML = `<p class="empty">${esc(errMsg(e))}</p>`; return; }
  const c = r.campagne || {}; const env = r.envois || [];
  const dep = env.filter(x => !x.seq_jour); // les relances de la séquence sont comptées à part
  const stLab = s => ({ delivered: ['Délivré', 't-ok'], opened: ['Ouvert', 't-ok'], clicked: ['Cliqué', 't-ok'], sent: ['Envoyé', 't-acc'], scheduled: ['Programmé', 't-pur'], bounced: ['Rebond', 't-bad'], complained: ['Signalé spam', 't-bad'] }[s] || [s || '—', 't-gray']);
  const item = x => { const [l, t] = stLab(x.statut); return `<button class="erow" data-pid="${x.prospect_id || ''}"><span class="av" style="background:${avColor(x.prospect_id)}">${esc(initials(x))}</span><span class="txt"><span class="nm">${esc([x.prenom, x.nom].filter(Boolean).join(' ') || x.email)}</span><span class="sub">${esc(x.entreprise || x.email)}</span></span><span class="small mut">${esc(dm(x.envoye_le))}</span><span class="chip ${t}">${esc(l)}</span></button>`; };
  d.innerHTML = `<div class="dhead"><button class="icon bare" id="dX" aria-label="Fermer">${ico('back')}</button><h2>${esc(campShort(c.nom))}</h2></div>
    <div class="dbody">
      <div class="hero">${campDot(c.couleur, true)}<div><h3 style="font-size:16px">${esc(c.nom)}</h3><div class="small mut">${esc(c.description || '')}</div></div></div>
      <div class="cbtns"><button class="btn" id="cMail">${ico('eye')}Voir le mail envoyé</button><button class="btn" id="cAdd" hidden>${ico('plus')}Ajouter des contacts</button></div>
      <div class="cnums box"><div><b>${fmtN(env.length)}</b><span>envois</span></div><div><b>${fmtN(env.filter(x => x.statut === 'scheduled').length)}</b><span>programmés</span></div><div><b>${fmtN(env.filter(x => /bounced|complained/.test(x.statut || '')).length)}</b><span>rebonds</span></div><div><b>${fmtN(r.non_recus)}</b><span>pas reçu</span></div></div>
      <div class="card seqc" id="cSeq"><h4>Séquence de relances</h4><p class="small mut">Chargement…</p></div>
      <div class="card"><h4>Destinataires</h4>${dep.length ? shortList(dep, 8, item, 'mEnv') : '<p class="small mut">Personne pour l’instant.</p>'}</div>
    </div>
    <div class="dfoot"><button class="btn" id="cNon">Voir ceux qui ne l’ont pas reçue</button>${env.length ? '<button class="btn primary" id="cOui">Voir dans Contacts</button>' : ''}</div>`;
  $('#dX', d).onclick = closeDrawer;
  $$('[data-pid]', d).forEach(b => b.onclick = () => { if (b.dataset.pid) openFiche(+b.dataset.pid); });
  $$('[data-more]', d).forEach(b => b.onclick = () => { $('#' + b.dataset.more).classList.remove('hidden'); b.remove(); });
  $('#cMail', d).onclick = () => openApercu({ campagne: slug });
  persoCamps().then(() => { const a = $('#cAdd', d); if (a && envoyable(slug)) { a.hidden = false; a.onclick = () => openChoixContacts(slug, env); } });
  seqCard(d, slug);
  $('#cNon', d).onclick = () => { closeDrawer(); goContacts({ campagne_non_recue: slug, joignables: true }); };
  const oui = $('#cOui', d); if (oui) oui.onclick = () => { closeDrawer(); goContacts({ campagne_recue: slug }); };
}
/* aperçu d'un mail envoyé : le vrai mail lu chez Resend, ou reconstitué à partir du modèle de la campagne */
async function openApercu(q) {
  closeApercu();
  const w = document.createElement('div'); w.className = 'mveil'; w.id = 'mveil';
  w.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="Aperçu du mail">
    <div class="mhead"><div class="mt"><b id="mSuj">Chargement du mail…</b><span class="small mut" id="mMeta"></span></div>
      <button class="icon bare" id="mX" aria-label="Fermer">${ico('x')}</button></div>
    <div class="mbody" id="mBody"><div class="mload"><span class="ldots"><i></i><i></i><i></i></span></div></div>
    <div class="mfoot small mut" id="mFoot"></div></div>`;
  document.body.appendChild(w);
  w.onclick = e => { if (e.target === w) closeApercu(); };
  $('#mX', w).onclick = closeApercu;
  let r;
  try {
    const { data: { session } } = await sb.auth.getSession();
    const res = await fetch(SB_URL + '/functions/v1/' + (q.resend_id ? 'crm-envoyes' : 'crm-campagnes'), { method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SB_KEY, Authorization: 'Bearer ' + (session ? session.access_token : SB_KEY) },
      body: JSON.stringify(q.resend_id ? { action: 'mail', id: q.resend_id } : Object.assign({ action: 'apercu' }, q)) });
    r = await res.json();
    if (!res.ok || r.erreur) throw new Error(r.erreur || res.status);
  } catch (e) { $('#mSuj', w).textContent = 'Aperçu indisponible'; $('#mBody', w).innerHTML = `<p class="empty">${esc(errMsg(e))}</p>`; return; }
  if (!$('#mveil')) return;
  const stl = { delivered: 'délivré', opened: 'ouvert', clicked: 'cliqué', sent: 'envoyé', scheduled: 'programmé', bounced: 'rebond', complained: 'signalé spam' };
  $('#mSuj', w).textContent = r.sujet || '(sans objet)';
  $('#mMeta', w).textContent = [r.email ? 'À ' + r.email : '', r.envoye_le ? fmtD(r.envoye_le) : '', stl[r.statut] || r.statut || '', r.campagne ? campShort(r.campagne) : ''].filter(Boolean).join(' · ');
  $('#mFoot', w).textContent = r.source === 'resend' ? 'Mail exact, lu chez Resend.' : (r.note || r.message || '');
  const B = $('#mBody', w);
  if (r.html) {
    const f = document.createElement('iframe');
    f.className = 'mframe'; f.title = 'Contenu du mail';
    f.setAttribute('sandbox', 'allow-popups allow-popups-to-escape-sandbox');
    f.srcdoc = String(r.html).replace(/<head([^>]*)>/i, '<head$1><base target="_blank">');
    B.innerHTML = ''; B.appendChild(f);
  } else if (r.texte) {
    B.innerHTML = `<pre class="mtext">${esc(r.texte)}</pre>`;
  } else {
    B.innerHTML = `<div class="mnone">${ico('mail')}<p>${esc(r.message || 'Contenu non disponible.')}</p></div>`;
  }
}
/* ---------- boîte d'envoi : tous les mails partis du compte, du plus récent au plus ancien ---------- */
async function envoyesFetch(after) {
  const { data: { session } } = await sb.auth.getSession();
  const res = await fetch(SB_URL + '/functions/v1/crm-envoyes', { method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SB_KEY, Authorization: 'Bearer ' + (session ? session.access_token : SB_KEY) },
    body: JSON.stringify({ action: 'liste', limit: 40, after: after || '' }) });
  const r = await res.json().catch(() => ({}));
  if (!res.ok || r.erreur) throw new Error(r.erreur || res.status);
  return r;
}
const ENV_ST = { delivered: ['Délivré', 't-ok'], opened: ['Ouvert', 't-ok'], clicked: ['Cliqué', 't-ok'], sent: ['Envoyé', 't-acc'], queued: ['En file', 't-acc'],
  scheduled: ['Programmé', 't-pur'], canceled: ['Annulé', 't-gray'], bounced: ['Rebond', 't-bad'], complained: ['Spam', 't-bad'], delivery_delayed: ['Retardé', 't-warn'], failed: ['Échec', 't-bad'] };
function envRow(m) {
  const [l, t] = ENV_ST[m.statut] || [m.statut || '—', 't-gray'];
  const nom = m.contact ? fullName(m.contact) : '';
  const quand = m.statut === 'scheduled' && m.prog ? m.prog : m.le;
  const d = new Date(quand), auj = new Date().toDateString() === d.toDateString();
  const h = auj ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  return `<button class="erow envr" data-rid="${esc(m.id)}">${m.campagne ? campDot(m.campagne.couleur) : '<i class="cdot" style="background:#C7CCD8"></i>'}
    <span class="txt"><span class="nm">${esc(nom || m.a)}${m.nb > 1 ? ` <span class="mut">+${m.nb - 1}</span>` : ''}</span>
    <span class="sub">${esc(m.sujet || '(sans objet)')}</span>
    <span class="sub">${m.campagne ? esc(campShort(m.campagne.nom)) : 'Hors campagne'}${nom ? ' · ' + esc(m.a) : ''}</span></span>
    <span class="envm"><span class="small mut">${esc(h)}</span><span class="chip ${t}">${esc(l)}</span></span></button>`;
}
function envBind(box) { $$('[data-rid]', box).forEach(b => b.onclick = () => openApercu({ resend_id: b.dataset.rid })); }
async function envRecents(box) {
  if (!box) return;
  try { const r = await envoyesFetch(); box.innerHTML = (r.items || []).slice(0, 5).map(envRow).join('') || '<p class="small mut">Aucun envoi.</p>'; envBind(box); }
  catch (e) { box.innerHTML = `<p class="small mut">${esc(errMsg(e))}</p>`; }
}
async function openEnvoyes() {
  const d = drawer(`<div class="dhead"><button class="icon bare" id="dX" aria-label="Fermer">${ico('back')}</button><h2>Envoyés</h2></div>
    <div class="dbody"><div class="seg envf" id="eF">
      <button class="on" data-f="tous">Tous</button><button data-f="hors">Hors campagne</button><button data-f="camp">Campagnes</button><button data-f="pb">Problèmes</button></div>
      <p class="small mut" style="margin:0">Tous les mails partis du compte, du plus récent au plus ancien. Touche un mail pour le lire.</p>
      <div id="eL"><p class="small mut">Chargement…</p></div><button class="btn" id="eMore" hidden>Charger plus</button></div>`);
  $('#dX', d).onclick = closeDrawer;
  let items = [], after = null, more = false, f = 'tous';
  const L = $('#eL', d), M = $('#eMore', d);
  const ok = m => f === 'tous' || (f === 'hors' && !m.campagne) || (f === 'camp' && !!m.campagne) || (f === 'pb' && /bounced|complained|failed|delivery_delayed/.test(m.statut || ''));
  const draw = () => {
    const v = items.filter(ok);
    L.innerHTML = v.length ? v.map(envRow).join('') : `<p class="small mut">${more ? 'Rien dans les derniers mails chargés : touche « Charger plus ».' : 'Aucun mail.'}</p>`;
    envBind(L); M.hidden = !more;
  };
  const load = async () => {
    M.disabled = true; M.textContent = 'Chargement…';
    try { const r = await envoyesFetch(after); items = items.concat(r.items || []); after = r.after; more = !!r.has_more; draw(); }
    catch (e) { L.insertAdjacentHTML('beforeend', `<p class="small mut">${esc(errMsg(e))}</p>`); }
    M.disabled = false; M.textContent = 'Charger plus';
  };
  $$('[data-f]', d).forEach(b => b.onclick = () => { f = b.dataset.f; $$('[data-f]', d).forEach(x => x.classList.toggle('on', x === b)); draw(); });
  M.onclick = load; load();
}
function closeApercu() { const w = $('#mveil'); if (w) w.remove(); }

/* petite fenêtre (étiquettes en lot, envoi de campagne) */
function dialog(titre, corps) {
  closeApercu();
  const w = document.createElement('div'); w.className = 'mveil'; w.id = 'mveil';
  w.innerHTML = `<div class="modal mini" role="dialog" aria-modal="true" aria-label="${esc(titre)}">
    <div class="mhead"><div class="mt"><b>${esc(titre)}</b></div><button class="icon bare" id="mX" aria-label="Fermer">${ico('x')}</button></div>
    <div class="mcorps">${corps}</div></div>`;
  document.body.appendChild(w);
  w.onclick = e => { if (e.target === w) closeApercu(); };
  $('#mX', w).onclick = closeApercu;
  return w;
}
function openTagLot(idsSel) {
  const n = idsSel.length;
  const w = dialog(`Étiquettes pour ${n} contact${n > 1 ? 's' : ''}`, `<p class="small mut" style="margin:0 0 8px">Choisis des étiquettes existantes ou tape-en une nouvelle. Elles s'ajoutent à celles que les contacts ont déjà.</p>
    <div id="lotTags"></div><div class="mact"><button class="btn" id="lCancel">Annuler</button><button class="btn primary" id="lGo">Ajouter</button></div>`);
  const emails = S.rows.filter(r => idsSel.includes(r.id) && r.email).slice(0, 200).map(r => r.email);
  const tp = tagPicker($('#lotTags', w), [], () => ({ emails }));
  $('#lCancel', w).onclick = closeApercu;
  $('#lGo', w).onclick = async () => {
    const tags = tp.get(); if (!tags.length) return toast('Choisis au moins une étiquette');
    const g = $('#lGo', w); g.disabled = true; g.textContent = 'Ajout…';
    try {
      for (const t of tags) await rpc('crm_lot', { p_ids: idsSel, p_action: 'tag+', p_valeur: t });
      closeApercu(); toast(`${tags.length > 1 ? tags.length + ' étiquettes ajoutées' : 'Étiquette ajoutée'} à ${n} contact${n > 1 ? 's' : ''}`);
      await refreshMeta(); load(true);
    } catch (e) { g.disabled = false; g.textContent = 'Ajouter'; toast(errMsg(e)); }
  };
}

/* envoyer une campagne aux contacts cochés (ceux qui ne l'ont pas reçue) : vérification, aperçu, puis confirmation */
const ENVOYABLES = ['malino-arabe-2311', 'malino-eiffage', 'malino-familles-btp', 'paceapp-guide-ctx'];
/* campagnes « mail perso » (mail rédigé à part, ex. cadeaux Malino avec un code par personne) : envoyées par crm-perso */
const isPerso = slug => !!(S.perso || []).find(x => x.slug === slug);
/* campagnes dont le mail de départ (J+0) est écrit dans l'appli : envoyées par crm-sequences */
const isSeqDep = slug => !!(S.seqs || []).find(x => x.slug === slug && x.depart);
const envoyable = slug => ENVOYABLES.includes(slug) || isPerso(slug) || isSeqDep(slug);
async function fnCall(fn, body) {
  const { data: { session } } = await sb.auth.getSession();
  const res = await fetch(SB_URL + '/functions/v1/' + fn, { method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SB_KEY, Authorization: 'Bearer ' + (session ? session.access_token : SB_KEY) },
    body: JSON.stringify(body) });
  const r = await res.json().catch(() => ({}));
  if (!res.ok || r.erreur) throw new Error(r.erreur || ('Erreur ' + res.status));
  return r;
}
let persoP = null;
function persoCamps(frais) {
  if (frais) persoP = null;
  if (!persoP) persoP = (async () => {
    const [p, q] = await Promise.all([fnCall('crm-perso', { action: 'campagnes' }), fnCall('crm-sequences', { action: 'campagnes' }).catch(() => ({ campagnes: S.seqs || [] }))]);
    S.perso = p.campagnes || []; S.seqs = q.campagnes || [];
    if (S.page === 'contacts' && S.f && envoyable(S.f.campagne_non_recue)) { renderChips(); renderBulk(); }
    return S.perso;
  })().catch(e => { persoP = null; S.perso = S.perso || []; S.seqs = S.seqs || []; return S.perso; });
  return persoP;
}
const sendable = () => S.page === 'contacts' && envoyable(S.f.campagne_non_recue);
const fnDe = slug => isPerso(slug) ? 'crm-perso' : isSeqDep(slug) ? 'crm-sequences' : 'crm-campagnes';
const fnCamp = body => fnCall(fnDe(body.campagne), body);
const MOTIFS = { deja: 'l’ont déjà reçue', recent: 'ont reçu un autre mail il y a moins de 7 jours', exclu: 'sont exclus des envois', stop: 'ont répondu STOP',
  sans_email: 'n’ont pas d’e-mail valable', entreprise: 'ne sont pas d’une entreprise prévue pour ce mail', doublon: 'sont en double' };
async function openEnvoi(slug, idsSel, onDone) {
  const nom = campShort(campName(slug));
  const w = dialog(`Envoyer « ${nom} »`, `<div id="eCorps"><div class="mload" style="position:static;padding:30px 0"><span class="ldots"><i></i><i></i><i></i></span></div></div>`);
  let ecart = true, r = null, prog = false;
  const pad = n => String(n).padStart(2, '0');
  const loc = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const demain9 = () => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return loc(d); };
  let dt = demain9();
  const draw = () => {
    const ok = r.ok.length, ex = Object.entries(r.ecartes).filter(([, v]) => v);
    $('#eCorps', w).innerHTML = `<div class="ebig ${ok ? '' : 'none'}"><b>${fmtN(ok)}</b><span>personne${ok > 1 ? 's' : ''} ${ok > 1 ? 'vont' : 'va'} recevoir ce mail</span></div>
      ${r.note ? `<p class="enote">${esc(r.note)}</p>` : ''}
      ${ex.length ? `<ul class="eex">${ex.map(([k, v]) => `<li><b>${fmtN(v)}</b> écartée${v > 1 ? 's' : ''} : ${esc(MOTIFS[k] || k)}</li>`).join('')}</ul>` : ''}
      ${r.demandes >= 300 ? '<p class="small mut">300 contacts au maximum par envoi : relance l’envoi pour les suivants.</p>' : ''}
      <label class="echk"><input type="checkbox" id="eEc" ${ecart ? 'checked' : ''}> Laisser au moins 7 jours après un autre mail (conseillé)</label>
      <div class="eqd"><div class="seg"><button type="button" data-q="0" class="${prog ? '' : 'on'}">Maintenant</button><button type="button" data-q="1" class="${prog ? 'on' : ''}">Programmer</button></div>
        <input type="datetime-local" id="eDt" value="${esc(dt)}" min="${esc(loc(new Date(Date.now() + 5 * 6e4)))}" max="${esc(loc(new Date(Date.now() + 29 * 864e5)))}" ${prog ? '' : 'hidden'}></div>
      ${r.apercu ? `<button class="btn link small" id="eVoir" style="padding:0">${ico('eye')}Voir le mail (exemple : ${esc(r.apercu.email)})</button><div id="eFr" class="efr hidden"></div>` : ''}
      <div class="mact"><button class="btn" id="eCancel">Annuler</button><button class="btn primary" id="eGo" ${ok ? '' : 'disabled'}>${ok ? `${prog ? 'Programmer pour' : 'Envoyer à'} ${fmtN(ok)} personne${ok > 1 ? 's' : ''}` : 'Personne à qui envoyer'}</button></div>`;
    $('#eCancel', w).onclick = closeApercu;
    $$('[data-q]', w).forEach(b => b.onclick = () => { prog = b.dataset.q === '1'; draw(); });
    $('#eDt', w).onchange = e => { dt = e.target.value || dt; };
    $('#eEc', w).onchange = e => { ecart = e.target.checked; prep(); };
    const v = $('#eVoir', w);
    if (v) v.onclick = () => {
      const box = $('#eFr', w); box.classList.toggle('hidden');
      if (!box.firstChild) { const f = document.createElement('iframe'); f.className = 'mframe'; f.title = 'Aperçu du mail'; f.setAttribute('sandbox', 'allow-popups allow-popups-to-escape-sandbox'); f.srcdoc = String(r.apercu.html).replace(/<head([^>]*)>/i, '<head$1><base target="_blank">'); box.appendChild(f); }
    };
    $('#eGo', w).onclick = async () => {
      const g = $('#eGo', w); g.disabled = true; g.textContent = 'Envoi en cours…'; $('#eCancel', w).disabled = true;
      try {
        let quand = null;
        if (prog) {
          const t = new Date(dt);
          if (isNaN(t) || t.getTime() < Date.now() + 2 * 6e4) throw new Error('Choisis une date et une heure à venir.');
          quand = t.toISOString();
        }
        const x = await fnCamp(Object.assign({ action: 'ajouter', campagne: slug, ids: idsSel, ecart7: ecart, confirme: true }, quand ? { scheduled_at: quand } : {}));
        if (x.erreurs && x.erreurs.length && !x.envoyes) throw new Error('L’envoi a échoué, rien n’est parti.');
        closeApercu();
        const qd = quand ? new Date(quand).toLocaleString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
        toast(x.envoyes ? `${x.envoyes} mail${x.envoyes > 1 ? 's' : ''} ${quand ? 'programmé' + (x.envoyes > 1 ? 's' : '') + ' · ' + qd : 'envoyé' + (x.envoyes > 1 ? 's' : '')}` : 'Aucun mail envoyé');
        if (onDone) onDone(x); else { S.sel.clear(); renderBulk(); }
        refreshMeta(); load(true);
      } catch (e) { g.disabled = false; g.textContent = 'Réessayer'; $('#eCancel', w).disabled = false; toast(errMsg(e)); }
    };
  };
  const prep = async () => {
    try { r = await fnCamp({ action: 'preparer', campagne: slug, ids: idsSel, ecart7: ecart }); if ($('#mveil')) draw(); }
    catch (e) { $('#eCorps', w).innerHTML = `<p class="empty">${esc(errMsg(e))}</p>`; }
  };
  prep();
}


/* ---------- séquences : plusieurs mails par campagne, envoyés à J+N après le mail de départ (9h, 7 j/7) ---------- */
const jb = j => `<span class="sqj">J+${j}</span>`;
const seqFn = body => fnCall('crm-sequences', body);
const pl = (n, m) => `${fmtN(n)} ${m}${n > 1 ? 's' : ''}`;
async function seqCard(d, slug, data) {
  const box = $('#cSeq', d); if (!box) return;
  let q = data;
  if (!q) { try { q = await seqFn({ action: 'lire', campagne: slug }); } catch (e) { box.innerHTML = `<h4>Séquence de relances</h4><p class="small mut">${esc(errMsg(e))}</p>`; return; } }
  if (!$('#cSeq', d)) return;
  const R = q.reglages || {}, et = q.etapes || [], rel = et.filter(e => e.jour > 0), e0 = et.find(e => e.jour === 0);
  const st = q.stats || {}, pj = st.par_jour || {};
  const depart = q.depart_externe
    ? `<button type="button" class="sqr" data-voir0>${jb(0)}<span class="txt"><b>Mail de départ</b><span class="small mut">Déjà en place · touche pour le voir</span></span>${ico('eye')}</button>`
    : e0 ? `<button type="button" class="sqr" data-st="${e0.id}">${jb(0)}<span class="txt"><b>${esc(e0.sujet)}</b><span class="small mut">Mail de départ · part quand tu ajoutes des contacts</span></span>${ico('right')}</button>`
    : `<button type="button" class="sqr add" data-new0>${jb(0)}<span class="txt"><b>Écrire le mail de départ</b><span class="small mut">Le premier mail, envoyé quand tu ajoutes des contacts</span></span>${ico('plus')}</button>`;
  const rows = rel.map(e => `<button type="button" class="sqr" data-st="${e.id}">${jb(e.jour)}<span class="txt"><b>${esc(e.sujet)}</b><span class="small mut">${pj[e.jour] ? pl(pj[e.jour], 'envoi') : 'Pas encore envoyée'}</span></span>${ico('right')}</button>`).join('');
  const chiffres = (st.en_cours || st.termines || st.arretes) ? `<div class="sqst"><span><b>${fmtN(st.en_cours || 0)}</b> en cours</span><span><b>${fmtN(st.termines || 0)}</b> terminé${st.termines > 1 ? 's' : ''}</span><span><b>${fmtN(st.arretes || 0)}</b> arrêté${st.arretes > 1 ? 's' : ''}</span></div>` : '';
  box.innerHTML = `<h4>Séquence de relances${rel.length ? `<label class="sw"><input type="checkbox" id="sqOn" ${R.actif ? 'checked' : ''}><i></i><span>${R.actif ? 'Active' : 'En pause'}</span></label>` : ''}</h4>
    <p class="small mut sqinfo">${rel.length ? `Chaque relance part à ${R.heure || 9}h (heure de Paris), 7 j/7, au jour indiqué après le mail de départ. Elle s’arrête toute seule en cas de STOP, de désinscription ou de rebond.` : 'Ajoute des mails qui partent tout seuls quelques jours après le mail de départ (J+3, J+7…).'}</p>
    ${chiffres}<div class="sql">${depart}${rows}</div>
    <div class="sqbas"><button type="button" class="btn small" id="sqAdd">${ico('plus')}Ajouter une relance</button>
    ${q.inscription_possible && rel.length ? `<label class="echk"><input type="checkbox" id="sqIns" ${R.arret_inscription ? 'checked' : ''}> Arrêter si la personne s’inscrit sur ${esc(q.marque_nom)}</label>` : ''}</div>`;
  const v0 = $('[data-voir0]', box); if (v0) v0.onclick = () => openApercu({ campagne: slug });
  const n0 = $('[data-new0]', box); if (n0) n0.onclick = () => openEtape(d, slug, q, { jour: 0 });
  $$('[data-st]', box).forEach(b => b.onclick = () => openEtape(d, slug, q, et.find(e => String(e.id) === b.dataset.st)));
  $('#sqAdd', box).onclick = () => openEtape(d, slug, q, { jour: rel.length ? Math.min(365, rel[rel.length - 1].jour + 4) : 3 });
  const ins = $('#sqIns', box);
  if (ins) ins.onchange = async () => {
    try { seqCard(d, slug, await seqFn({ action: 'reglages', campagne: slug, arret_inscription: ins.checked })); toast(ins.checked ? `Arrêt si inscription sur ${q.marque_nom}` : 'La séquence continue même après inscription'); }
    catch (e) { ins.checked = !ins.checked; toast(errMsg(e)); }
  };
  const on = $('#sqOn', box);
  if (on) on.onchange = () => {
    const regler = async (b, msg) => {
      try { seqCard(d, slug, await seqFn(Object.assign({ action: 'reglages', campagne: slug }, b))); toast(msg); }
      catch (e) { on.checked = !on.checked; toast(errMsg(e)); }
    };
    if (!on.checked) return regler({ actif: false }, 'Séquence en pause');
    if (R.depuis) return regler({ actif: true }, 'Séquence réactivée');
    const n = q.depart_externe ? q.deja_recu || 0 : 0;
    const w = dialog('Activer la séquence', `<p class="small" style="margin:0">Toutes les personnes qui recevront le mail de départ à partir de maintenant recevront ensuite ${rel.length > 1 ? `les ${rel.length} relances` : 'la relance'} automatiquement, à ${R.heure || 9}h.</p>
      ${n ? `<label class="echk"><input type="checkbox" id="acAnc"> Inclure aussi les ${pl(n, 'personne')} qui l’ont déjà reçu</label><p class="small mut" style="margin:0">Elles recevront la prochaine relance prévue au prochain envoi du matin (à partir de ${R.heure || 9}h), puis les suivantes avec le même écart.</p>` : ''}
      <div class="mact"><button class="btn" id="acNo">Annuler</button><button class="btn primary" id="acGo">Activer</button></div>`);
    const annuler = () => { on.checked = false; closeApercu(); };
    $('#acNo', w).onclick = annuler; $('#mX', w).onclick = annuler; w.onclick = e => { if (e.target === w) annuler(); };
    $('#acGo', w).onclick = () => { const anc = $('#acAnc', w); closeApercu(); regler({ actif: true, inclure_anciens: !!(anc && anc.checked) }, 'Séquence activée'); };
  };
}
function openEtape(d, slug, q, e) {
  e = e || { jour: 3 };
  const zero = e.jour === 0, neuf = !e.id;
  const titre = zero ? 'Mail de départ (J+0)' : neuf ? 'Nouvelle relance' : `Relance J+${e.jour}`;
  const corps0 = 'Bonjour {prénom},\n\n\n\nÀ bientôt,\nSamy';
  const w = dialog(titre, `<div class="seqed">
    ${zero ? '' : `<label class="f">Envoyer<span class="sejr">J + <input type="number" id="seJ" min="1" max="365" inputmode="numeric" value="${e.jour}"> jours après le mail de départ, à ${(q.reglages || {}).heure || 9}h</span></label>`}
    <label class="f">Objet<input id="seS" maxlength="200" value="${esc(e.sujet || '')}" placeholder="ex. Tu as pu essayer ?"></label>
    <label class="f">Texte<textarea id="seC" rows="9">${esc(e.corps || corps0)}</textarea></label>
    <p class="small mut seaide">{prénom} est remplacé par le prénom (ou retiré s’il est inconnu) · **gras** · une ligne qui commence par « - » fait une liste · les liens sont cliquables.</p>
    <details class="sebt" ${e.bouton_url ? 'open' : ''}><summary>Bouton (facultatif)</summary>
      <div class="sebtg"><label class="f">Texte du bouton<input id="seBt" maxlength="60" value="${esc(e.bouton_texte || '')}" placeholder="ex. Ouvrir ${esc(q.marque_nom || '')}"></label>
      <label class="f">Lien<input id="seBu" type="url" value="${esc(e.bouton_url || '')}" placeholder="https://"></label></div></details>
    <p class="small mut" style="margin:0">De : ${esc(q.expediteur || '')}</p>
    <div id="seFr" class="efr hidden"></div>
    <div class="mact seact">${neuf ? '' : '<button class="btn danger small" id="seDel">Supprimer</button>'}<span class="sp"></span>
      <button class="btn small" id="seVoir">${ico('eye')}Aperçu</button><button class="btn small" id="seTest">${ico('send')}M’envoyer un test</button><button class="btn primary small" id="seOk">Enregistrer</button></div></div>`);
  const brouillon = () => ({ id: e.id || null, jour: zero ? 0 : Number($('#seJ', w).value), sujet: $('#seS', w).value, corps: $('#seC', w).value,
    bouton_texte: $('#seBt', w).value, bouton_url: $('#seBu', w).value.trim() });
  const occupe = (b, t) => { const o = b.innerHTML; b.disabled = true; b.textContent = t; return () => { b.disabled = false; b.innerHTML = o; }; };
  $('#seVoir', w).onclick = async () => {
    const box = $('#seFr', w), fin = occupe($('#seVoir', w), 'Aperçu…');
    try {
      const r = await seqFn({ action: 'apercu', campagne: slug, etape: brouillon(), prenom: 'Nadia' });
      box.innerHTML = ''; const f = document.createElement('iframe'); f.className = 'mframe'; f.title = 'Aperçu du mail';
      f.setAttribute('sandbox', 'allow-popups allow-popups-to-escape-sandbox'); f.srcdoc = String(r.html).replace(/<head([^>]*)>/i, '<head$1><base target="_blank">');
      box.appendChild(f); box.classList.remove('hidden'); box.scrollIntoView({ block: 'nearest' });
    } catch (x) { toast(errMsg(x)); }
    fin();
  };
  $('#seTest', w).onclick = async () => {
    const fin = occupe($('#seTest', w), 'Envoi…');
    try { const r = await seqFn({ action: 'test', campagne: slug, etape: brouillon() }); toast(`Test envoyé à ${r.a}`); } catch (x) { toast(errMsg(x)); }
    fin();
  };
  $('#seOk', w).onclick = async () => {
    const fin = occupe($('#seOk', w), 'Enregistrement…');
    try {
      const r = await seqFn({ action: 'etape', campagne: slug, etape: brouillon() });
      closeApercu(); toast(zero ? 'Mail de départ enregistré' : 'Relance enregistrée'); seqCard(d, slug, r);
      if (zero) { await persoCamps(true); const a = $('#cAdd', d); if (a && envoyable(slug)) { a.hidden = false; a.onclick = () => openChoixContacts(slug, []); } }
    } catch (x) { fin(); toast(errMsg(x)); }
  };
  const del = $('#seDel', w);
  if (del) del.onclick = async () => {
    if (!del.dataset.ok) { del.dataset.ok = '1'; del.textContent = 'Confirmer la suppression'; return; }
    const fin = occupe(del, 'Suppression…');
    try { const r = await seqFn({ action: 'etape_suppr', campagne: slug, id: e.id }); closeApercu(); toast('Mail supprimé'); seqCard(d, slug, r); if (zero) persoCamps(true); }
    catch (x) { fin(); toast(errMsg(x)); }
  };
  setTimeout(() => { const s = $('#seS', w); if (s && !s.value) s.focus(); }, 60);
}
function openNouvelleCampagne() {
  const COUL = { Malino: '#7B5CFF', PaceApp: '#1E3B8A', samy: '#16181D' };
  let marque = 'Malino';
  const w = dialog('Nouvelle campagne', `<label class="f">Nom<input id="ncN" maxlength="80" placeholder="ex. Relance rentrée"></label>
    <div class="f">Marque<div class="seg" id="ncM"><button type="button" data-m="Malino" class="on">Malino</button><button type="button" data-m="PaceApp">PaceApp</button><button type="button" data-m="samy">Neutre (Samy)</button></div></div>
    <label class="f">Couleur<input type="color" id="ncC" value="${COUL.Malino}" class="nccol"></label>
    <p class="small mut" style="margin:0">Ensuite, tu écris le mail de départ et les relances (J+3, J+7…), puis tu ajoutes des contacts.</p>
    <div class="mact"><button class="btn" id="ncX">Annuler</button><button class="btn primary" id="ncGo">Créer</button></div>`);
  $$('[data-m]', w).forEach(b => b.onclick = () => { marque = b.dataset.m; $$('[data-m]', w).forEach(x => x.classList.toggle('on', x === b)); $('#ncC', w).value = COUL[marque]; });
  $('#ncX', w).onclick = closeApercu;
  $('#ncGo', w).onclick = async () => {
    const g = $('#ncGo', w); g.disabled = true; g.textContent = 'Création…';
    try {
      const r = await seqFn({ action: 'creer', nom: $('#ncN', w).value, marque, couleur: $('#ncC', w).value });
      closeApercu(); await refreshCamps(); persoCamps(true); openCampagne(r.slug);
      toast('Campagne créée : écris le mail de départ');
      if (S.page === 'campagnes' && $('#pCamp')) renderCampagnes(true);
    } catch (e) { g.disabled = false; g.textContent = 'Créer'; toast(errMsg(e)); }
  };
  setTimeout(() => $('#ncN', w).focus(), 60);
}

/* ajouter des contacts à une campagne depuis sa page : recherche, choix, puis le même aperçu et la même confirmation que l'envoi en lot */
function openChoixContacts(slug, env) {
  const nom = campShort(campName(slug));
  const recus = new Set((env || []).map(x => x.prospect_id).filter(Boolean).map(Number));
  const mails = new Set((env || []).map(x => String(x.email || '').toLowerCase()).filter(Boolean));
  const choix = new Map();
  const w = dialog(`Ajouter à « ${nom} »`, `<div class="pkq">${ico('search')}<input id="pkQ" type="search" placeholder="Nom, e-mail ou société" autocomplete="off" enterkeyhint="search"></div>
    <div id="pkSel" class="pksel hidden"></div>
    <div id="pkL" class="aclist"><p class="small mut" style="margin:2px 0">Tape quelques lettres pour chercher un contact.</p></div>
    <div class="mact"><button class="btn" id="pkCancel">Annuler</button><button class="btn primary" id="pkGo" disabled>Continuer</button></div>`);
  const L = $('#pkL', w), Q = $('#pkQ', w);
  let rows = [], req = 0, t = 0;
  const deja = r => recus.has(Number(r.id)) || (r.email && mails.has(String(r.email).toLowerCase()));
  const drawSel = () => {
    const box = $('#pkSel', w), n = choix.size;
    box.classList.toggle('hidden', !n);
    box.innerHTML = Array.from(choix.values()).map(r => `<button type="button" class="chip t-acc" data-un="${r.id}">${esc(fullName(r))} ${ico('x')}</button>`).join('');
    $$('[data-un]', box).forEach(b => b.onclick = () => { choix.delete(+b.dataset.un); drawSel(); drawList(); });
    const g = $('#pkGo', w); g.disabled = !n; g.textContent = n ? `Continuer (${n})` : 'Continuer';
  };
  const drawList = () => {
    if (!rows.length) { L.innerHTML = `<p class="small mut" style="margin:2px 0">${Q.value.trim() ? 'Aucun contact trouvé.' : 'Tape quelques lettres pour chercher un contact.'}</p>`; return; }
    L.innerHTML = rows.map(r => { const d = deja(r), on = choix.has(Number(r.id)), sansMail = !r.email;
      return `<button type="button" class="acrow pkrow ${on ? 'on' : ''}" data-pk="${r.id}" ${d || sansMail ? 'disabled' : ''}>
        <span class="av" style="background:${avColor(r.id)}">${esc(initials(r))}</span>
        <span class="txt"><b>${esc(fullName(r))}</b><span class="small mut">${esc(r.email || 'Pas d’e-mail')}${r.entreprise ? ' · ' + esc(r.entreprise) : ''}</span></span>
        ${d ? '<span class="chip t-ok">Déjà reçu</span>' : `<span class="pkc">${on ? ico('check') : ''}</span>`}</button>`; }).join('');
    $$('[data-pk]', L).forEach(b => b.onclick = () => {
      const id = +b.dataset.pk, r = rows.find(x => Number(x.id) === id);
      if (choix.has(id)) choix.delete(id); else if (r) choix.set(id, r);
      drawSel(); drawList();
    });
  };
  const chercher = async () => {
    const q = Q.value.trim(), my = ++req;
    if (q.length < 2) { rows = []; drawList(); return; }
    try { const d = await rpc('crm_liste', { p: { q, limit: 12, offset: 0 } }); if (my !== req) return; rows = d.rows || []; drawList(); }
    catch (e) { if (my === req) L.innerHTML = `<p class="small mut">${esc(errMsg(e))}</p>`; }
  };
  Q.oninput = () => { clearTimeout(t); t = setTimeout(chercher, 250); };
  $('#pkCancel', w).onclick = closeApercu;
  $('#pkGo', w).onclick = () => { const ids = Array.from(choix.keys()); if (ids.length) openEnvoi(slug, ids, () => openCampagne(slug)); };
  setTimeout(() => Q.focus(), 50);
}

/* ajouter un contact à une campagne depuis sa fiche : choix de la campagne, puis le même aperçu et la même confirmation que l'envoi en lot */
async function openAjoutCamp(d, c) {
  if (!c.email) return toast('Ajoute d’abord un e-mail à ce contact');
  const w = dialog('Ajouter à une campagne', '<div id="acCorps"><div class="mload" style="position:static;padding:24px 0"><span class="ldots"><i></i><i></i><i></i></span></div></div>');
  if (!S.camps) { try { S.camps = await rpc('crm_campagnes_vue'); } catch (e) { $('#acCorps', w).innerHTML = `<p class="empty">${esc(errMsg(e))}</p>`; return; } }
  if (!$('#mveil')) return;
  const recues = new Set((d._env || []).map(x => x.campagne));
  const all = S.camps.campagnes || [];
  await persoCamps();
  if (!$('#mveil')) return;
  const camps = Array.from(new Set(ENVOYABLES.concat((S.perso || []).map(x => x.slug), (S.seqs || []).filter(x => x.depart).map(x => x.slug)))).map(s => all.find(x => x.slug === s) || (S.perso || []).find(x => x.slug === s) || { slug: s, nom: s });
  const bloque = c.desinscrit ? 'Cette personne ne veut plus être contactée.' : c.a_exclure ? 'Ce contact est exclu des envois : désactive « Exclu des envois » dans sa fiche pour pouvoir lui écrire.' : '';
  $('#acCorps', w).innerHTML = (bloque ? `<p class="acwarn">${esc(bloque)}</p>` : `<p class="small mut" style="margin:0 0 6px">Tu verras le mail avant de confirmer. Il part tout de suite à <b>${esc(c.email)}</b>.</p>`)
    + `<div class="aclist">${camps.map(x => { const deja = recues.has(x.slug); return `<button type="button" class="acrow" data-camp="${esc(x.slug)}" ${deja || bloque ? 'disabled' : ''}>${campDot(x.couleur)}<span class="txt"><b>${esc(String(x.nom).replace(/[«»]/g, '').trim())}</b>${x.description ? `<span class="small mut">${esc(x.description)}</span>` : ''}</span>${deja ? '<span class="chip t-ok">Déjà reçue</span>' : ico('right')}</button>`; }).join('')}</div>`;
  $$('[data-camp]', w).forEach(b => b.onclick = () => openEnvoi(b.dataset.camp, [c.id], () => loadEnvois(d, c)));
}
async function loadEnvois(d, c) {
  const box = $('#envBox', d); if (!box) return;
  let env = [];
  try { env = await rpc('crm_envois_contact', { p_id: c.id }); } catch (e) { box.innerHTML = `<p class="small mut">${esc(errMsg(e))}</p>`; return; }
  d._env = env || [];
  const mk = (env || []).filter(x => MARKETING.includes(x.type));
  $('#envN', d).textContent = mk.length ? mk.length + ' envoi' + (mk.length > 1 ? 's' : '') : '';
  if (!env.length) { box.innerHTML = '<p class="small mut" style="margin:4px 0 8px">Aucune campagne reçue pour l’instant.</p>'; return; }
  box.innerHTML = `<div class="tline">${env.map(x => `<button type="button" class="ti ${MARKETING.includes(x.type) ? '' : 'auto'}" data-env="${x.id}" title="Voir le mail">${campDot(x.couleur)}<div><b>${esc(campShort(x.nom))}</b><span class="small mut">${esc(fmtD(x.envoye_le))}${x.statut === 'scheduled' ? ' · programmé' : x.statut === 'bounced' ? ' · rebond' : ''}</span></div><span class="voir">${ico('eye')}Voir le mail</span></button>`).join('')}</div>`;
  $$('[data-env]', box).forEach(b => b.onclick = () => openApercu({ envoi_id: +b.dataset.env }));
}

/* ---------- liens d'inscription : page publique inscription.html?l=<code> ---------- */
const MARQUES = {
  samy: { nom: 'Samy (neutre)', court: 'Samy', couleur: '#16181D', exp: 'contact@paceapp.fr' },
  paceapp: { nom: 'PaceApp', court: 'PaceApp', couleur: '#1E3B8A', exp: 'contact@paceapp.fr' },
  malino: { nom: 'Malino', court: 'Malino', couleur: '#7B5CFF', exp: 'malino@paceapp.fr' },
  'vacances-muslims': { nom: 'Vacances Muslims', court: 'Vacances Muslims', couleur: '#0E6A6A', exp: 'inscription@vacancesmuslims.fr' }
};
const lienUrl = l => (/(paceapp\.fr|github\.io)$/.test(location.hostname) ? 'https://contacts.paceapp.fr/inscription' : new URL('inscription.html', location.href).href.split('?')[0]) + '?l=' + l.code;
async function copier(txt) {
  try { await navigator.clipboard.writeText(txt); toast('Lien copié'); }
  catch (e) { prompt('Copiez le lien :', txt); }
}
async function renderLiens(force) {
  const P = $('#pLiens'); if (!P) return;
  if (force || !S.liens) {
    if (!S.liens) P.innerHTML = '<p class="empty">Chargement…</p>';
    try { S.liens = await rpc('crm_liens_inscription') || []; } catch (e) { P.innerHTML = `<p class="empty">${esc(errMsg(e))}</p>`; return; }
    renderSide();
  }
  const L = S.liens;
  const tot = L.reduce((a, l) => a + (+l.inscrits || 0), 0);
  $('#vCount').textContent = L.length ? `${L.length} lien${L.length > 1 ? 's' : ''} · ${fmtN(tot)} inscrit${tot > 1 ? 's' : ''}` : '';
  P.innerHTML = `<div class="liens">
    <p class="small mut" style="margin:2px 2px 12px;line-height:1.5">Créez un lien, choisissez ses étiquettes et ses réglages, puis envoyez-le : chaque personne laisse son prénom, son e-mail et un commentaire, confirme son adresse avec un code reçu par e-mail, et arrive dans vos contacts avec ces étiquettes.</p>
    ${L.length ? L.map(l => {
      const m = MARQUES[l.marque] || MARQUES.samy;
      return `<article class="lcard${l.actif ? '' : ' off'}" data-lien="${l.id}">
        <div class="lhead"><span class="ldot" style="background:${m.couleur}"></span><div style="min-width:0;flex:1"><h3>${esc(l.sujet)}</h3>
          <div class="small mut">${esc(m.court)} · créé le ${fmtD(l.created_at)}${l.actif ? '' : ' · <b>désactivé</b>'}</div></div>
          <div class="lnum"><b>${fmtN(+l.inscrits || 0)}</b><span>inscrit${(+l.inscrits || 0) > 1 ? 's' : ''}</span></div></div>
        <div class="chips">${(l.tags || []).map(t => `<span class="chip" style="${tagStyle(t)}">${esc(t)}</span>`).join('')}<span class="chip t-gray">${esc(l.statut)}</span><span class="chip t-gray">${esc(l.type_contact)}</span>${l.secteur ? `<span class="chip t-pur">${esc(l.secteur)}</span>` : ''}${+l.en_attente ? `<span class="chip t-gray">${fmtN(+l.en_attente)} en attente du code</span>` : ''}</div>
        ${l.note_interne ? `<p class="small lnote">${esc(l.note_interne)}</p>` : ''}
        <div class="lurl"><input readonly value="${esc(lienUrl(l))}" aria-label="Lien d’inscription" onfocus="this.select()"></div>
        <div class="lact">
          <button class="btn small primary" data-copy="${l.id}">${ico('link')}Copier le lien</button>
          <a class="btn small" href="${esc(lienUrl(l))}" target="_blank" rel="noopener">Ouvrir</a>
          <button class="btn small" data-insc="${l.id}">${ico('users')}Inscrits</button>
          <button class="btn small" data-edit="${l.id}">Modifier</button>
          <button class="btn small link" data-act="${l.id}" style="margin-left:auto">${l.actif ? 'Désactiver' : 'Réactiver'}</button>
        </div>
      </article>`;
    }).join('') : `<div class="lempty"><p>Aucun lien pour l’instant.</p><button class="btn primary" id="lFirst">${ico('plus')}Créer un lien d’inscription</button></div>`}
  </div>`;
  const byId = id => L.find(l => l.id === +id);
  $$('[data-copy]', P).forEach(b => b.onclick = () => copier(lienUrl(byId(b.dataset.copy))));
  $$('[data-edit]', P).forEach(b => b.onclick = () => openLienForm(byId(b.dataset.edit)));
  $$('[data-insc]', P).forEach(b => b.onclick = () => openLienInscrits(byId(b.dataset.insc)));
  $$('[data-act]', P).forEach(b => b.onclick = async () => {
    const l = byId(b.dataset.act);
    if (l.actif && !confirm('Désactiver ce lien ? La page affichera « lien plus actif » ; les inscrits restent dans vos contacts.')) return;
    try { await rpc('crm_lien_inscription_actif', { p_id: l.id, p_actif: !l.actif }); toast(l.actif ? 'Lien désactivé' : 'Lien réactivé'); renderLiens(true); } catch (e) { toast(errMsg(e)); }
  });
  const f = $('#lFirst', P); if (f) f.onclick = () => openLienForm(null);
}
function openLienForm(l) {
  const n = !l; l = l || { sujet: '', message: '', marque: 'samy', tags: [], origine: '', statut: 'Inscrit', secteur: '', type_contact: 'Particulier', note_interne: '' };
  const v = k => esc(l[k] ?? '');
  const d = drawer(`<div class="dhead"><button class="icon bare" id="dX" aria-label="Fermer">${ico('back')}</button><h2>${n ? 'Nouveau lien d’inscription' : 'Modifier le lien'}</h2></div>
    <form class="dbody" id="lForm">
      <div class="card"><h4>Ce que voit la personne</h4><div class="fgrid">
        <label class="f full">Sujet de l’inscription *<input name="sujet" value="${v('sujet')}" maxlength="140" placeholder="Ex. : Liste d’attente PaceApp Pro" required></label>
        <label class="f full">Message sous le titre <span class="mut">(facultatif)</span><textarea name="message" rows="3" maxlength="800" placeholder="Ex. : Laissez vos coordonnées, je vous préviens dès l’ouverture.">${v('message')}</textarea></label>
        <label class="f full">Marque (page et e-mail du code)<select name="marque">${Object.entries(MARQUES).map(([k, m]) => `<option value="${k}" ${k === l.marque ? 'selected' : ''}>${esc(m.nom)} · ${esc(m.exp)}</option>`).join('')}</select></label>
      </div></div>
      <div class="card"><h4>Ce que reçoit chaque inscrit dans Contacts</h4><div class="fgrid">
        <div class="f full">Étiquettes<div id="lTags"></div></div>
        <label class="f">Statut<select name="statut">${STATUTS.map(s => `<option ${s === l.statut ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select></label>
        <label class="f">Type<select name="type_contact">${['Particulier', 'Pro'].map(s => `<option ${s === l.type_contact ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
        <label class="f">Secteur<input name="secteur" value="${v('secteur')}" list="lSecList" autocomplete="off"></label>
        <label class="f">Origine<input name="origine" value="${v('origine')}" autocomplete="off" placeholder="Inscription · <sujet>"></label>
      </div>
      <datalist id="lSecList">${(S.stats?.secteurs || []).map(s => `<option value="${esc(s.v)}">`).join('')}</datalist></div>
      <div class="card"><h4>Note interne <span class="mut" style="text-transform:none;letter-spacing:0">(visible seulement ici)</span></h4>
        <label class="f full"><span class="sr">Note interne</span><textarea name="note_interne" rows="3" placeholder="Pour qui, pourquoi, où le lien a été partagé…">${v('note_interne')}</textarea></label></div>
      <p class="small mut" style="margin:0">Le commentaire laissé par la personne est rangé dans sa fiche, à part de vos notes.</p>
    </form>
    <div class="dfoot"><span class="small mut" id="lMsg" style="margin-right:auto;align-self:center"></span>
      <button class="btn" type="button" id="lCancel">Annuler</button><button class="btn primary" type="button" id="lSave">${n ? 'Créer le lien' : 'Enregistrer'}</button></div>`);
  const tp = tagPicker($('#lTags', d), l.tags || [], null);
  $('#dX', d).onclick = closeDrawer; $('#lCancel', d).onclick = closeDrawer;
  $('#lSave', d).onclick = async () => {
    const f = $('#lForm', d);
    const p = { id: n ? null : l.id };
    $$('[name]', f).forEach(el => { p[el.name] = el.value; });
    p.tags = tp.get();
    if (!p.sujet.trim()) { $('#lMsg', d).textContent = 'Le sujet est obligatoire.'; f.sujet.focus(); return; }
    const b = $('#lSave', d); b.disabled = true;
    try {
      const r = await rpc('crm_lien_inscription_enregistrer', { p });
      closeDrawer();
      await renderLiens(true);
      if (n && r && r.code) { copier(lienUrl(r)); toast('Lien créé et copié'); }
      else toast('Lien enregistré');
    } catch (e) { $('#lMsg', d).textContent = errMsg(e); b.disabled = false; }
  };
}
async function openLienInscrits(l) {
  const d = drawer(`<div class="dhead"><button class="icon bare" id="dX" aria-label="Fermer">${ico('back')}</button><h2>${esc(l.sujet)}</h2></div><div class="dbody"><p class="empty">Chargement…</p></div>`);
  $('#dX', d).onclick = closeDrawer;
  let r;
  try { r = await rpc('crm_lien_inscrits', { p_id: l.id }) || []; } catch (e) { $('.dbody', d).innerHTML = `<p class="empty">${esc(errMsg(e))}</p>`; return; }
  const ok = r.filter(x => x.confirme_le), att = r.filter(x => !x.confirme_le);
  const ligne = x => `<button type="button" class="irow" ${x.contact_id ? `data-c="${x.contact_id}"` : 'disabled'}>
      <span class="av" style="background:${avColor(x.contact_id || x.id)}">${esc((x.prenom || x.email || '?').slice(0, 1).toUpperCase())}</span>
      <span style="min-width:0;flex:1;text-align:left"><b>${esc(x.prenom || '')}</b> <span class="mut">${esc(x.email)}</span>
        ${x.commentaire ? `<span class="small icom">« ${esc(x.commentaire)} »</span>` : ''}</span>
      <span class="small mut" style="flex:none">${fmtD(x.confirme_le || x.cree_le)}</span></button>`;
  $('.dbody', d).innerHTML = `
    <div class="lurl"><input readonly value="${esc(lienUrl(l))}" onfocus="this.select()" aria-label="Lien d’inscription"></div>
    <div class="card"><h4>Inscrits confirmés <span class="mut" style="text-transform:none;letter-spacing:0">${ok.length}</span></h4>
      ${ok.length ? ok.map(ligne).join('') : '<p class="small mut" style="margin:4px 0 8px">Personne pour l’instant.</p>'}</div>
    ${att.length ? `<div class="card"><h4>En attente du code <span class="mut" style="text-transform:none;letter-spacing:0">${att.length}</span></h4>${att.map(ligne).join('')}
      <p class="small mut" style="margin:6px 0">Ces personnes ont demandé un code mais ne l’ont pas encore saisi (valable 30 minutes).</p></div>` : ''}`;
  $$('[data-c]', d).forEach(b => b.onclick = () => openFiche(+b.dataset.c));
}

/* ---------- PWA ---------- */
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
sb.auth.onAuthStateChange(ev => { if (ev === 'SIGNED_OUT' && S.user) { S.user = null; loginView('mail'); } });
boot();
