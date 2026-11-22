/* Contacts — appli de contacts centralisés (Supabase, espace crm du projet Malino) */
const APP_VERSION = '1.1.0';
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

const STATUTS = ['Client', 'Utilisateur', 'À contacter', 'Contacté', 'A répondu', 'Intéressé', 'Pas intéressé', 'E-mail à vérifier', 'Ancien contact Beecook', 'Désinscrit'];
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
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  ban: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
  out: '<path d="M15 4h4v16h-4M10 17l5-5-5-5M15 12H4"/>'
};
const ico = (k, cls = '') => `<svg viewBox="0 0 24 24" aria-hidden="true" class="${cls}">${I[k]}</svg>`;

/* ---------- état ---------- */
const VUES_BASE = [
  { id: 'tous', nom: 'Tous les contacts', icon: 'users', f: {} },
  { id: 'joignables', nom: 'Joignables par e-mail', icon: 'mail', f: { joignables: true } },
  { id: 'favoris', nom: 'Favoris', icon: 'star', f: { favoris: true } },
  { id: 'prospection', nom: 'Prospection PaceApp', icon: 'flag', f: { origines: ['Prospection PaceApp (Clay)', 'Prospection PaceApp (CV)'] } },
  { id: 'chefs', nom: 'Chefs Beecook joignables', icon: 'user', f: { origines: ['Beecook (2021-2022)'], profils: ['chef'], joignables: true } },
  { id: 'a_contacter', nom: 'À contacter', icon: 'cal', f: { statuts: ['À contacter'] } },
  { id: 'exclus', nom: 'Exclus des envois', icon: 'ban', f: { exclus: true } }
];
const emptyF = () => ({ q: '', origines: [], statuts: [], profils: [], secteurs: [], tags: [], zone: '', joignables: false, avec_tel: false, accord: false, favoris: false, exclus: false, tri: 'recent' });
const S = {
  user: null, stats: null, vues: [], favs: [], rows: [], total: 0, offset: 0, req: 0,
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
  return [prof, r.ville].filter(Boolean).join(' · ') || r.email || '';
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
  return data;
}
const activeCount = f => ['origines', 'statuts', 'profils', 'secteurs', 'tags'].reduce((n, k) => n + f[k].length, 0)
  + (f.zone ? 1 : 0) + ['joignables', 'avec_tel', 'accord', 'favoris', 'exclus'].filter(k => f[k]).length;

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
  app.innerHTML = '<p class="empty">Chargement…</p>';
  try {
    await refreshMeta();
  } catch (e) {
    app.innerHTML = `<div class="login"><div class="logo">C</div><p>${esc(errMsg(e))}</p>
      <button class="btn" id="lo">Se déconnecter</button></div>`;
    $('#lo').onclick = logout;
    return;
  }
  shell();
  applyVue('tous');
}
async function logout() { await sb.auth.signOut(); S.user = null; loginView('mail'); }
async function refreshMeta() {
  const [stats, vues, favs] = await Promise.all([
    rpc('crm_stats'), rpc('crm_vues'), rpc('crm_liste', { p: { favoris: true, limit: 6, tri: 'nom' } })
  ]);
  S.stats = stats; S.vues = vues || []; S.favs = favs.rows || [];
  if ($('#side')) renderSide();
}

/* ---------- squelette ---------- */
function shell() {
  app.innerHTML = `<div class="shell">
    <aside class="side" id="side" aria-label="Vues et favoris"></aside>
    <main class="main">
      <header class="top">
        <button class="icon only-m" id="menuBtn" aria-label="Ouvrir le menu">${ico('menu')}</button>
        <div class="ttl"><h1 id="vTitle">Contacts</h1><span id="vCount" class="mut small"></span></div>
        <div class="top-actions">
          <div class="seg only-d" role="group" aria-label="Affichage">
            <button data-mode="table">${ico('table')}Tableau</button><button data-mode="liste">${ico('list')}Liste</button>
          </div>
          <button class="btn" id="expBtn" aria-label="Exporter en CSV">${ico('down')}<span class="only-d">Exporter</span></button>
          <button class="btn primary only-d" id="newBtn">${ico('plus')}Nouveau</button>
        </div>
      </header>
      <div class="toolbar">
        <label class="search">${ico('search')}<span class="sr">Rechercher</span>
          <input id="q" type="search" placeholder="Nom, e-mail, entreprise, ville, note…" autocomplete="off"></label>
        <button class="btn" id="filtBtn">${ico('filter')}Filtres <span class="badge" id="filtN"></span></button>
        <label class="sr" for="tri">Tri</label>
        <select class="sel" id="tri"><option value="recent">Récents</option><option value="nom">Nom A→Z</option><option value="ajout">Derniers ajoutés</option></select>
      </div>
      <div class="achips" id="achips"></div>
      <div class="bulk hidden" id="bulk"></div>
      <section id="list" aria-live="polite"></section>
      <div class="more" id="more"></div>
    </main>
  </div>
  <button class="fab only-m" id="fab" aria-label="Ajouter un contact">${ico('plus')}</button>
  <nav class="bnav only-m" aria-label="Navigation">
    <button class="on" id="nContacts">${ico('users')}Contacts</button>
    <button id="nVues">${ico('list')}Vues</button>
    <button id="nExport">${ico('down')}Exporter</button>
  </nav>`;
  renderSide();
  $('#menuBtn').onclick = () => toggleSide(true);
  $('#nVues').onclick = () => toggleSide(true);
  $('#nContacts').onclick = () => { applyVue('tous'); window.scrollTo(0, 0); };
  $('#nExport').onclick = exportCsv;
  $('#expBtn').onclick = exportCsv;
  $('#newBtn').onclick = () => openForm(null);
  $('#fab').onclick = () => openForm(null);
  $('#filtBtn').onclick = openFilters;
  $('#tri').onchange = e => { S.f.tri = e.target.value; load(true); };
  let t;
  $('#q').oninput = e => { clearTimeout(t); t = setTimeout(() => { S.f.q = e.target.value; load(true); }, 250); };
  $$('.seg button').forEach(b => b.onclick = () => { S.mode = b.dataset.mode; localStorage.setItem('contacts-mode', S.mode); renderList(); });
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); const q = $('#q'); if (q) q.focus(); }
    if (e.key === 'Escape') { closeDrawer(); toggleSide(false); }
  });
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(renderList, 150); });
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
  if (v.id === 'tous') return fmtN(st.total);
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
    <div class="shead">Favoris</div>
    ${favs.length ? favs.map(r => `<button class="sbtn" data-fav="${r.id}"><span class="av" style="width:18px;height:18px;font-size:9px;background:${avColor(r.id)}">${esc(initials(r))}</span>${esc(fullName(r))}</button>`).join('')
      : '<p class="small mut" style="padding:0 8px;margin:2px 0">Touche l’étoile d’un contact pour l’ajouter ici.</p>'}
    ${S.favs.length > 5 ? `<button class="sbtn" data-vue="favoris" style="color:var(--acc)">Tout voir</button>` : ''}
    <div class="shead">Vues</div>
    ${VUES_BASE.map(v => `<button class="sbtn ${S.vue === v.id ? 'on' : ''}" data-vue="${v.id}">${ico(v.icon)}${esc(v.nom)}<span class="n">${vueCount(v)}</span></button>`).join('')}
    ${S.vues.length ? `<div class="shead">Mes vues</div>` + S.vues.map(v => `<button class="sbtn ${S.vue === 'v' + v.id ? 'on' : ''}" data-vue="v${v.id}">${ico('eye')}${esc(v.nom)}<span class="x" data-delvue="${v.id}" role="button" aria-label="Supprimer la vue ${esc(v.nom)}">✕</span></button>`).join('') : ''}
    <div class="sfoot">
      <span class="small mut" style="overflow:hidden;text-overflow:ellipsis">${esc(S.user?.email || '')}</span>
      <button class="sbtn" id="sOut">${ico('out')}Se déconnecter</button>
      <span class="small mut">Contacts v${APP_VERSION}</span>
    </div>`;
  $('#sSearch').onclick = () => { toggleSide(false); $('#q').focus(); };
  $('#sNew').onclick = () => { toggleSide(false); openForm(null); };
  $('#sOut').onclick = logout;
  $$('[data-fav]', s).forEach(b => b.onclick = () => { toggleSide(false); openFiche(+b.dataset.fav); });
  $$('[data-vue]', s).forEach(b => b.onclick = e => {
    if (e.target.closest('[data-delvue]')) return;
    toggleSide(false); applyVue(b.dataset.vue);
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
  S.f = Object.assign(emptyF(), JSON.parse(JSON.stringify(f)), { tri: S.f.tri });
  $('#q').value = S.f.q || '';
  $('#vTitle').textContent = nom;
  renderSide();
  load(true);
}
function filtersChanged() {
  S.vue = null;
  $('#vTitle').textContent = activeCount(S.f) ? 'Sélection filtrée' : 'Tous les contacts';
  if (!activeCount(S.f)) S.vue = 'tous';
  renderSide();
  load(true);
}

/* ---------- chargement ---------- */
async function load(reset) {
  const my = ++S.req;
  if (reset) { S.offset = 0; S.rows = []; S.sel.clear(); }
  const p = Object.assign({}, S.f, { limit: PAGE, offset: S.offset });
  if (reset) $('#list').innerHTML = '<p class="empty">Chargement…</p>';
  try {
    const d = await rpc('crm_liste', { p });
    if (my !== S.req) return;
    S.total = d.total;
    S.rows = S.rows.concat(d.rows || []);
    S.offset = S.rows.length;
  } catch (e) {
    if (my !== S.req) return;
    $('#list').innerHTML = `<p class="empty">${esc(errMsg(e))}</p>`;
    if (/JWT|session/i.test(e.message || '')) logout();
    return;
  }
  renderChips();
  renderList();
}

function renderChips() {
  $('#vCount').textContent = fmtN(S.total) + (S.total > 1 ? ' contacts' : ' contact');
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
  if (S.f.joignables) add('Joignables', () => S.f.joignables = false);
  if (S.f.avec_tel) add('Avec téléphone', () => S.f.avec_tel = false);
  if (S.f.accord) add('Accord e-mail', () => S.f.accord = false);
  if (S.f.favoris) add('Favoris', () => S.f.favoris = false);
  if (S.f.exclus) add('Exclus', () => S.f.exclus = false);
  const el = $('#achips');
  el.innerHTML = c.map((x, i) => `<button class="chip t-acc" data-i="${i}" aria-label="Retirer le filtre ${esc(x.lab)}">${esc(x.lab)} ✕</button>`).join('')
    + (c.length > 1 ? '<button class="btn link small" id="clrF">Tout effacer</button>' : '');
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
  L.innerHTML = mode === 'table' ? tableHtml() : listHtml();
  // interactions
  $$('[data-id]', L).forEach(el => el.onclick = e => {
    if (e.target.closest('a,input,[data-pick]')) return;
    openFiche(+el.dataset.id);
  });
  $$('[data-pick]', L).forEach(el => el.onclick = e => { e.stopPropagation(); togglePick(+el.dataset.pick); });
  $$('input[data-cb]', L).forEach(cb => cb.onchange = () => togglePick(+cb.dataset.cb, cb.checked));
  const all = $('#cbAll', L);
  if (all) all.onchange = () => { S.rows.forEach(r => all.checked ? S.sel.add(r.id) : S.sel.delete(r.id)); renderList(); };
  const left = S.total - S.rows.length;
  $('#more').innerHTML = left > 0 ? `<button class="btn" id="moreBtn">Afficher ${Math.min(PAGE, left)} de plus · ${fmtN(left)} restants</button>` : '';
  const mb = $('#moreBtn'); if (mb) mb.onclick = () => { mb.disabled = true; mb.textContent = 'Chargement…'; load(false); };
  renderBulk();
}
function togglePick(id, on) {
  if (on === undefined) on = !S.sel.has(id);
  on ? S.sel.add(id) : S.sel.delete(id);
  renderList();
}
function listHtml() {
  return `<div class="cards">${S.rows.map(r => {
    const [b, t] = rowBadge(r); const sel = S.sel.has(r.id);
    return `<div class="row ${sel ? 'sel' : ''}" data-id="${r.id}">
      <button class="av ${sel ? 'sel' : ''}" style="border:0;background:${avColor(r.id)}" data-pick="${r.id}" aria-label="Sélectionner ${esc(fullName(r))}">${sel ? '✓' : esc(initials(r))}</button>
      <div class="txt"><span class="nm">${r.favori ? '<span style="color:#C98A00">★</span> ' : ''}${esc(fullName(r))}</span><span class="sub">${esc(subLine(r))}</span></div>
      ${b ? `<span class="chip ${t}">${esc(b)}</span>` : ''}
    </div>`;
  }).join('')}</div>`;
}
function tableHtml() {
  const allSel = S.rows.length && S.rows.every(r => S.sel.has(r.id));
  const th = (icon, lab, cls = '') => `<th class="${cls}"><span>${ico(icon)}${lab}</span></th>`;
  return `<div class="tablewrap"><table class="grid"><thead><tr>
      <th><label class="sr" for="cbAll">Tout sélectionner</label><input type="checkbox" id="cbAll" ${allSel ? 'checked' : ''}></th>
      ${th('user', 'Nom', 'name')}${th('mail', 'E-mail')}${th('phone', 'Téléphone')}${th('build', 'Entreprise / métier')}
      ${th('pin', 'Ville')}${th('source', 'Origine')}${th('flag', 'Statut')}${th('tag', 'Étiquettes')}${th('cal', 'Dernier envoi')}
    </tr></thead><tbody>${S.rows.map(r => {
      const sel = S.sel.has(r.id);
      const tags = (r.tags || []).slice(0, 2).map(x => `<span class="chip out">${esc(x)}</span>`).join('') + ((r.tags || []).length > 2 ? `<span class="chip out">+${r.tags.length - 2}</span>` : '');
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
        <td><div class="tags">${tags || '<span class="mut">—</span>'}</div></td>
        <td class="dim">${esc(fmtD(r.date_dernier_envoi)) || '—'}</td>
      </tr>`;
    }).join('')}</tbody></table></div>`;
}

/* ---------- actions groupées ---------- */
function renderBulk() {
  const el = $('#bulk'); const n = S.sel.size;
  if (!n) { el.classList.add('hidden'); el.innerHTML = ''; return; }
  el.classList.remove('hidden');
  el.innerHTML = `<b>${n} sélectionné${n > 1 ? 's' : ''}</b>
    <label class="sr" for="bStat">Changer le statut</label>
    <select id="bStat"><option value="">Statut…</option>${STATUTS.map(s => `<option>${esc(s)}</option>`).join('')}</select>
    <button class="btn" id="bTag">${ico('tag')}Étiquette</button>
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
  $('#bTag').onclick = () => { const t = prompt('Étiquette à ajouter :'); if (t && t.trim()) run('tag+', t.trim(), 'Étiquette ajoutée'); };
  $('#bFav').onclick = () => run('favori', 'true', 'Ajouté aux favoris');
  $('#bExc').onclick = () => run('exclure', 'exclu à la main', 'Exclus des envois');
  $('#bExp').onclick = () => downloadCsv(S.rows.filter(r => S.sel.has(r.id)), 'selection');
  $('#bDel').onclick = async () => {
    if (!confirm(`Supprimer définitivement ${n} contact${n > 1 ? 's' : ''} ?`)) return;
    try { const k = await rpc('crm_supprimer', { p_ids: ids() }); toast(`${k} supprimé${k > 1 ? 's' : ''}`); await refreshMeta(); load(true); } catch (e) { toast(errMsg(e)); }
  };
  $('#bClr').onclick = () => { S.sel.clear(); renderList(); };
}

/* ---------- export CSV ---------- */
async function exportCsv() {
  try {
    toast('Préparation de l’export…');
    const d = await rpc('crm_liste', { p: Object.assign({}, S.f, { limit: 5000, offset: 0 }) });
    downloadCsv(d.rows || [], 'contacts');
  } catch (e) { toast(errMsg(e)); }
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
function tagEditor(tags) {
  return `<div class="tagbox" id="tagbox">${tags.map(t => `<span class="chip t-acc" data-tag="${esc(t)}">${esc(t)}<button type="button" aria-label="Retirer ${esc(t)}">✕</button></span>`).join('')}
    <label class="sr" for="tagIn">Ajouter une étiquette</label><input id="tagIn" placeholder="+ étiquette (Entrée)" list="tagList"></div>
    <datalist id="tagList">${(S.stats?.tags || []).map(t => `<option value="${esc(t.v)}">`).join('')}</datalist>`;
}
function bindTagEditor(root) {
  const box = $('#tagbox', root), inp = $('#tagIn', root);
  const addTag = v => {
    v = v.trim().replace(/,$/, ''); if (!v) return;
    if ($$('[data-tag]', box).some(x => x.dataset.tag.toLowerCase() === v.toLowerCase())) return;
    const s = document.createElement('span'); s.className = 'chip t-acc'; s.dataset.tag = v;
    s.innerHTML = `${esc(v)}<button type="button" aria-label="Retirer ${esc(v)}">✕</button>`;
    box.insertBefore(s, inp.previousElementSibling);
  };
  box.onclick = e => { const b = e.target.closest('button'); if (b) b.parentElement.remove(); else inp.focus(); };
  inp.onkeydown = e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(inp.value); inp.value = ''; } };
  inp.onchange = () => { if (inp.value) { addTag(inp.value); inp.value = ''; } };
  return () => { if (inp.value.trim()) { addTag(inp.value); inp.value = ''; } return $$('[data-tag]', box).map(x => x.dataset.tag); };
}
function formFields(c) {
  const v = k => esc(c[k] ?? '');
  const st = STATUTS.includes(c.statut) || !c.statut ? STATUTS : [c.statut, ...STATUTS];
  return `<div class="fgrid">
    <label class="f">Prénom<input name="prenom" value="${v('prenom')}" autocomplete="off"></label>
    <label class="f">Nom<input name="nom" value="${v('nom')}" autocomplete="off"></label>
    <label class="f full">E-mail<input name="email" type="email" value="${v('email')}" autocomplete="off"></label>
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
      ${c.accroche ? `<div class="card"><h4>Accroche utilisée</h4><p class="small" style="margin:0 0 6px;line-height:1.45">${esc(c.accroche)}</p></div>` : ''}
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
  const getTags = bindTagEditor(d);
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

/* ---------- PWA ---------- */
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
sb.auth.onAuthStateChange(ev => { if (ev === 'SIGNED_OUT' && S.user) { S.user = null; loginView('mail'); } });
boot();
