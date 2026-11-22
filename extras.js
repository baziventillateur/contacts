/* Contacts · compléments v1.1.0
   Badges (Malino, PaceApp, Pro, Particulier), installation de l'appli, cloche de notifications et notifications push
   (même principe que CovoitGo), ajout de contacts par photo (lecture des e-mails dans le navigateur) et import Google Contacts. */
(() => {
  const PUSH_FN = SB_URL + '/functions/v1/contacts-push';
  Object.assign(I, {
    bell: '<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/>',
    cam: '<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13.5" r="3.5"/>',
    up: '<path d="M12 15V3M7 8l5-5 5 5M5 21h14"/>',
    dl: '<path d="M12 3v12M7 10l5 5 5-5"/><rect x="4" y="17" width="16" height="4" rx="1.5"/>'
  });

  const css = document.createElement('style');
  css.textContent = `
  .xb{display:flex;gap:3px;flex-wrap:wrap;margin-top:3px}.xb.t{flex-wrap:nowrap;margin:0 0 0 6px;flex:none}.xb .chip{height:17px;font-size:10.5px;padding:0 6px}
  .c-mal{background:#EFE4FF;color:#6D28D9}.c-pace{background:#1E293B;color:#fff}.c-pro{background:#E0E7FF;color:#4338CA}.c-par{background:#FCE7F3;color:#BE185D}.c-eco{background:#CCFBF1;color:#0F766E}.c-cli{background:#DCFCE7;color:#15803D}
  .bellb{position:relative}.bellb .n{position:absolute;top:-5px;right:-5px;min-width:17px;height:17px;padding:0 4px;border-radius:9px;background:#E5484D;color:#fff;font-size:10.5px;font-weight:700;display:flex;align-items:center;justify-content:center}
  .nitem{display:flex;gap:9px;padding:8px 2px;border-top:1px solid var(--line2);align-items:flex-start}.nitem:first-child{border-top:0}.nitem .e{font-size:17px;line-height:22px}
  .nitem .m{flex:1;min-width:0}.nitem b{display:block;font-size:13px}.nitem small{color:var(--mut2)}.nitem.new b::after{content:'';display:inline-block;width:7px;height:7px;border-radius:4px;background:#E5484D;margin-left:6px;vertical-align:1px}
  .pushrow{display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap}
  .instb{position:fixed;left:12px;right:12px;bottom:calc(70px + env(safe-area-inset-bottom));z-index:30;max-width:430px;margin:0 auto;background:#16181D;color:#fff;border-radius:14px;padding:10px 12px;display:flex;gap:10px;align-items:center;box-shadow:0 12px 30px rgba(0,0,0,.25)}
  .instb img{width:38px;height:38px;border-radius:10px;flex:none}.instb .m{flex:1;min-width:0;font-size:12.5px;line-height:1.35}.instb b{font-size:13.5px}
  .instb .btn{height:30px}.instb .btn.primary{background:#7A6BFF;border-color:#7A6BFF}.instb .x{background:transparent;border:0;color:#aaa;font-size:18px;padding:0 4px}
  @media (min-width:900px){.instb{bottom:16px;left:auto;right:16px}}
  .ocr{border:1px dashed #C9CFEA;border-radius:11px;padding:8px;background:#FAFAFE}.ocr img{max-width:100%;max-height:170px;border-radius:8px;display:block;margin:0 auto 6px}
  .prog{height:5px;background:#E8EAF6;border-radius:3px;overflow:hidden;margin:6px 0}.prog i{display:block;height:100%;width:0;background:#5140E6;transition:width .2s}
  .det{display:flex;gap:7px;align-items:flex-start;padding:6px 0;border-top:1px solid var(--line2)}.det:first-child{border-top:0}.det input{margin-top:3px}.det .m{flex:1;min-width:0;word-break:break-all}
  .fab2{position:fixed;right:20px;bottom:132px;width:40px;height:40px;border-radius:12px;background:#fff;border:1px solid var(--line);color:var(--acc);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,.12);z-index:10}.fab2 svg{width:19px;height:19px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
  @media (min-width:900px){.fab2{display:none}}
  .steps{margin:4px 0 0;padding-left:18px;font-size:12.5px;color:var(--mut)}.steps li{margin:3px 0}`;
  document.head.appendChild(css);

  const PERSO = /@(gmail|hotmail|yahoo|outlook|live|icloud|msn|orange|free|sfr|laposte|wanadoo|aol|gmx|protonmail|me|neuf|bbox)\./i;
  const EMRE = /[a-z0-9._%+\-]+@[a-z0-9\-]+(?:\.[a-z0-9\-]+)*\.[a-z]{2,}/gi;
  const ago = x => { const m = (Date.now() - Date.parse(x)) / 6e4; return m < 1 ? 'à l’instant' : m < 60 ? Math.round(m) + ' min' : m < 1440 ? Math.round(m / 60) + ' h' : Math.round(m / 1440) + ' j'; };

  /* ---------- badges dans la liste ---------- */
  const KB = [['Malino', 'c-mal', '🦉 Malino', '🦉'], ['Malino+', 'c-mal', 'Malino+', '🦉+'], ['PaceApp', 'c-pace', '⚡ PaceApp', '⚡'], ['PaceApp Pro', 'c-pace', 'PaceApp Pro', '⚡Pro'],
    ['Pro', 'c-pro', 'Pro', 'Pro'], ['Particulier', 'c-par', 'Particulier', 'Part.'], ['Établissement', 'c-eco', 'École', 'École']];
  function badgesFor(r, court) {
    const t = r.tags || [];
    return KB.filter(([k]) => t.includes(k)).map(([k, c, l, sh]) => `<span class="chip ${c}" title="${esc(k)}">${esc(court ? sh : l)}</span>`).join('');
  }
  const _renderList = renderList;
  renderList = function () {
    _renderList.apply(this, arguments);
    const byId = new Map((S.rows || []).map(r => [r.id, r]));
    $$('#list .row[data-id]').forEach(el => {
      const r = byId.get(+el.dataset.id); if (!r) return; const h = badgesFor(r); if (!h) return;
      const t = $('.txt', el); if (t && !$('.xb', t)) t.insertAdjacentHTML('beforeend', `<span class="xb">${h}</span>`);
    });
    $$('#list tr[data-id]').forEach(el => {
      const r = byId.get(+el.dataset.id); if (!r) return; const h = badgesFor(r, true); if (!h) return;
      const n = $('td.name > div', el); if (n && !$('.xb', n)) n.insertAdjacentHTML('beforeend', `<span class="xb t">${h}</span>`);
    });
  };

  /* ---------- en-tête : cloche, import ---------- */
  function injectTop() {
    const top = $('.top-actions'); if (!top || $('#bellBtn')) return;
    top.insertAdjacentHTML('afterbegin', `<button class="btn only-d" id="impBtn" aria-label="Importer des contacts">${ico('up')}Importer</button>
      <button class="icon bellb" id="bellBtn" aria-label="Notifications">${ico('bell')}<span class="n hidden" id="bellN"></span></button>`);
    if (!$('#camFab')) document.body.insertAdjacentHTML('beforeend', `<button class="fab2" id="camFab" aria-label="Ajouter par photo">${ico('cam')}</button>`);
    $('#camFab').onclick = () => { openForm._photo = true; openForm(null); };
    $('#bellBtn').onclick = openNotifs; $('#impBtn').onclick = openImport;
    bellCount(); if (!injectTop.t) injectTop.t = setInterval(bellCount, 60000);
    setTimeout(maybeInstall, 1500);
  }
  const _renderSide = renderSide;
  renderSide = function () {
    _renderSide.apply(this, arguments);
    const n = $('#sNew'); if (!n || $('#sImp')) return;
    n.insertAdjacentHTML('afterend', `<button class="sbtn" id="sCam">${ico('cam')}Ajouter par photo</button><button class="sbtn" id="sImp">${ico('up')}Importer (Google…)</button><button class="sbtn" id="sBell">${ico('bell')}Notifications</button>`);
    $('#sCam').onclick = () => { toggleSide(false); openForm._photo = true; openForm(null); };
    $('#sImp').onclick = () => { toggleSide(false); openImport(); };
    $('#sBell').onclick = () => { toggleSide(false); openNotifs(); };
  };
  const _shell = shell;
  shell = function () { _shell.apply(this, arguments); injectTop(); };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) bellCount(); });
  new MutationObserver(() => { if ($('.top-actions') && !$('#bellBtn')) injectTop(); }).observe(document.body, { childList: true, subtree: true });

  /* ---------- cloche ---------- */
  let NOTIF_OK = true;
  async function bellCount() {
    if (!NOTIF_OK) return;
    const { data, error } = await sb.rpc('crm_notifs', { p_limite: 1 });
    const b = $('#bellN'); if (!b) return;
    if (error) { if (/function|schema cache|not find/i.test(error.message)) { NOTIF_OK = false; $('#bellBtn')?.classList.add('hidden'); } return; }
    const n = data?.non_lues || 0; b.textContent = n > 99 ? '99+' : n; b.classList.toggle('hidden', !n);
    if ('setAppBadge' in navigator) { try { n ? navigator.setAppBadge(n) : navigator.clearAppBadge(); } catch (e) { } }
  }
  const NICO = { contact: '👤', import: '📥', test: '🔔', info: '🔔' };
  async function openNotifs() {
    const d = drawer(`<div class="dhead"><button class="icon bare" id="dX" aria-label="Fermer">${ico('x')}</button><h2>Notifications</h2><button class="btn link" id="nRead">Tout lu</button></div>
      <div class="dbody"><div class="card"><h4>Sur ce téléphone</h4><div class="pushrow" id="pushRow"><span class="small mut">Chargement…</span></div></div>
      <div class="card"><h4>Dernières notifications</h4><div id="nList"><p class="small mut">Chargement…</p></div></div></div>`);
    $('#dX', d).onclick = closeDrawer;
    drawPush();
    const { data, error } = await sb.rpc('crm_notifs', { p_limite: 100 });
    const L = $('#nList', d); if (!L) return;
    if (error) { L.innerHTML = '<p class="small mut">Les notifications ne sont pas encore activées côté serveur.</p>'; return; }
    const it = data.items || [];
    const row = n => `<div class="nitem ${n.lu_le ? '' : 'new'}" ${n.contact_id ? `data-c="${n.contact_id}" style="cursor:pointer"` : ''}><span class="e">${NICO[n.genre] || '🔔'}</span><div class="m"><b>${esc(n.titre)}</b>${n.corps ? `<div class="small">${esc(n.corps)}</div>` : ''}<small>${ago(n.cree_le)}</small></div></div>`;
    let all = false;
    const draw = () => { L.innerHTML = it.length ? it.slice(0, all ? it.length : 8).map(row).join('') + (it.length > 8 ? `<button class="btn link" id="nMore">${all ? 'Réduire' : 'Tout voir (' + it.length + ')'}</button>` : '') : '<p class="small mut">Rien pour l’instant.</p>';
      $$('[data-c]', L).forEach(e => e.onclick = () => openFiche(+e.dataset.c)); const m = $('#nMore', L); if (m) m.onclick = () => { all = !all; draw(); }; };
    draw();
    $('#nRead', d).onclick = async () => { await sb.rpc('crm_notifs_lues', {}); it.forEach(n => n.lu_le = n.lu_le || new Date().toISOString()); draw(); bellCount(); };
  }

  /* ---------- notifications push (comme CovoitGo) ---------- */
  const pushOk = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  const reg = async () => pushOk() ? (await navigator.serviceWorker.getRegistration()) || null : null;
  const toBytes = b => { const s = (b + '='.repeat((4 - b.length % 4) % 4)).replace(/-/g, '+').replace(/_/g, '/'); return Uint8Array.from(atob(s), c => c.charCodeAt(0)); };
  async function pushOn() { const r = await reg(); return Notification.permission === 'granted' && !!(r && await r.pushManager.getSubscription()); }
  async function drawPush() {
    const box = $('#pushRow'); if (!box) return;
    if (!pushOk()) { box.innerHTML = `<span class="small mut">${/iphone|ipad/i.test(navigator.userAgent) ? 'Sur iPhone, installe d’abord l’appli sur l’écran d’accueil (Partager → Sur l’écran d’accueil), puis rouvre-la pour activer les notifications.' : 'Ce navigateur ne gère pas les notifications.'}</span>`; return; }
    const on = await pushOn();
    box.innerHTML = `<span class="small">${on ? '✅ Notifications activées sur cet appareil' : 'Reçois une alerte même appli fermée.'}</span>
      <span style="display:flex;gap:6px">${on ? '<button class="btn" id="pTest">Tester</button><button class="btn" id="pOff">Désactiver</button>' : '<button class="btn primary" id="pOn">Activer</button>'}</span>`;
    const b = id => $('#' + id, box);
    if (b('pOn')) b('pOn').onclick = async () => { b('pOn').disabled = true; try { await enablePush(); toast('Notifications activées'); } catch (e) { toast(e.message || String(e)); } drawPush(); };
    if (b('pOff')) b('pOff').onclick = async () => { try { const s = await (await reg())?.pushManager.getSubscription(); if (s) { await sb.rpc('crm_push_retirer', { p_endpoint: s.endpoint }); await s.unsubscribe(); } } catch (e) { } drawPush(); };
    if (b('pTest')) b('pTest').onclick = async () => { const { error } = await sb.rpc('crm_notifier', { p_titre: 'Test', p_corps: 'Les notifications de Contacts fonctionnent 🎉', p_genre: 'test' }); toast(error ? errMsg(error) : 'Notification envoyée'); setTimeout(bellCount, 1500); };
  }
  async function enablePush() {
    const r = await reg(); if (!r) throw new Error('Notifications indisponibles sur ce navigateur');
    if ((await Notification.requestPermission()) !== 'granted') throw new Error('Notifications refusées : autorise-les dans les réglages du navigateur.');
    const k = await fetch(PUSH_FN, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: SB_KEY }, body: JSON.stringify({ init: true }) }).then(x => x.json()).catch(() => null);
    if (!k?.public_key) throw new Error('Notifications indisponibles pour le moment');
    const sub = await r.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toBytes(k.public_key) });
    const j = sub.toJSON();
    const { error } = await sb.rpc('crm_push_enregistrer', { p_endpoint: j.endpoint, p_p256dh: j.keys.p256dh, p_auth: j.keys.auth, p_appareil: navigator.userAgent.slice(0, 110) });
    if (error) throw new Error(errMsg(error));
  }

  /* ---------- installation (comme les autres applis) ---------- */
  let bip = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); bip = e; maybeInstall(); });
  window.addEventListener('appinstalled', () => { bip = null; $('#instb')?.remove(); try { localStorage.setItem('contacts-installe', '1'); } catch (e) { } });
  function maybeInstall() {
    if ($('#instb') || !$('.top-actions')) return;
    const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    let skip = 0; try { skip = +localStorage.getItem('contacts-install-plus-tard') || 0; } catch (e) { }
    if (standalone || Date.now() - skip < 3 * 864e5) return;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    if (!bip && !ios) return;
    document.body.insertAdjacentHTML('beforeend', `<div class="instb" id="instb"><img src="icon-192.png" alt=""><div class="m"><b>Installer Contacts</b><br>${bip ? 'Sur ton écran d’accueil, comme une vraie appli, avec les notifications.' : 'Touche <b>Partager</b> puis <b>Sur l’écran d’accueil</b>.'}</div>
      ${bip ? '<button class="btn primary" id="iGo">Installer</button>' : ''}<button class="x" id="iX" aria-label="Plus tard">✕</button></div>`);
    $('#iX').onclick = () => { $('#instb').remove(); try { localStorage.setItem('contacts-install-plus-tard', Date.now()); } catch (e) { } };
    if ($('#iGo')) $('#iGo').onclick = async () => { const p = bip; bip = null; $('#instb').remove(); if (p) { p.prompt(); try { await p.userChoice; } catch (e) { } } };
  }

  /* ---------- ajout par photo : lecture des e-mails dans le navigateur ---------- */
  let tessP = null;
  const tess = () => tessP || (tessP = new Promise((ok, ko) => { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'; s.onload = () => ok(window.Tesseract); s.onerror = () => { tessP = null; ko(new Error('chargement')); }; document.head.appendChild(s); }));
  const shrink = (file, max = 2000) => new Promise(ok => { const img = new Image(); img.onload = () => { const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); ok(c.toDataURL('image/jpeg', .9)); URL.revokeObjectURL(img.src); }; img.src = URL.createObjectURL(file); });
  const fixOcr = t => t.replace(/\s*@\s*/g, '@').replace(/\(at\)|\[at\]/gi, '@').replace(/@([a-z0-9\-]+)\s*[.,]\s*(fr|com|net|org|eu|io|be|ch|info)\b/gi, '@$1.$2');
  function guess(email, text) {
    const [loc, dom] = email.split('@'), parts = loc.split(/[._-]+/).filter(w => /^[a-z]{2,}$/i.test(w)), cap = w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    const ph = (text.match(/(?:\+33\s?|0)[1-9](?:[\s.\-]?\d{2}){4}/) || [''])[0];
    return { email: email.toLowerCase(), prenom: parts.length >= 2 ? cap(parts[0]) : '', nom: parts.length >= 2 ? cap(parts[parts.length - 1]) : '', entreprise: PERSO.test(email) ? '' : cap(dom.split('.').slice(-2, -1)[0] || ''), telephone: ph };
  }
  const _openForm = openForm;
  openForm = function () {
    _openForm.apply(this, arguments);
    const d = $('#drawer'), form = d && $('#nForm', d); if (!form || $('#camBtn', d)) return;
    form.insertAdjacentHTML('afterbegin', `<button type="button" class="btn" id="camBtn" style="justify-content:center;flex:none;height:36px">${ico('cam')}Prendre une photo (carte de visite, liste…)</button><input type="file" id="camIn" accept="image/*" capture="environment" class="hidden"><div id="ocrZ"></div>`);
    $('#camBtn', d).onclick = () => { $('#camIn', d).value = ''; $('#camIn', d).click(); };
    $('#camIn', d).onchange = e => { const f = e.target.files[0]; if (f) readPhoto(f, d); };
    if (openForm._photo) { openForm._photo = false; setTimeout(() => $('#camBtn', d).click(), 50); }
  };
  async function readPhoto(file, d) {
    const z = $('#ocrZ', d), url = await shrink(file);
    z.innerHTML = `<div class="ocr"><img src="${url}" alt=""><div class="small" id="oSt">Lecture de la photo…</div><div class="prog"><i id="oP"></i></div></div>`;
    try {
      const T = await tess();
      const r = await T.recognize(url, 'fra+eng', { logger: m => { if (m.status === 'recognizing text') { const p = $('#oP', d); if (p) p.style.width = Math.round(m.progress * 100) + '%'; } else if (m.status && $('#oSt', d)) $('#oSt', d).textContent = /traineddata/.test(m.status) ? 'Préparation de la lecture (la 1re fois prend quelques secondes)…' : 'Lecture de la photo…'; } });
      const txt = fixOcr(r.data.text || ''), ems = [...new Set((txt.match(EMRE) || []).map(x => x.toLowerCase().replace(/[.,;:]+$/, '')))], G = ems.map(m => guess(m, txt));
      if (!ems.length) { z.innerHTML = `<div class="ocr"><img src="${url}" alt=""><p class="small"><b>Aucun e-mail lu.</b> Reprends la photo plus nette et bien droite.</p><details><summary class="small">Texte lu</summary><pre class="small" style="white-space:pre-wrap">${esc(txt)}</pre></details></div>`; return; }
      if (G.length === 1) {
        const g = G[0]; Object.entries(g).forEach(([k, v]) => { const i = $(`[name=${k}]`, d); if (i && v && !i.value) i.value = v; });
        const o = $('select[name=origine]', d); if (o && ![...o.options].some(x => x.value === 'Photo')) o.insertAdjacentHTML('afterbegin', '<option>Photo</option>'); if (o) o.value = 'Photo';
        z.innerHTML = `<div class="ocr"><img src="${url}" alt=""><p class="small">✅ <b>${esc(g.email)}</b> : formulaire rempli, vérifie puis touche « Créer ».</p></div>`; return;
      }
      z.innerHTML = `<div class="ocr"><img src="${url}" alt=""><p class="small"><b>${G.length} e-mails trouvés</b> · coche ceux à ajouter</p><div id="oDets">${G.map((g, i) => `<label class="det"><input type="checkbox" data-i="${i}" checked><span class="m"><b>${esc(g.email)}</b><br><span class="small mut">${esc([(g.prenom + ' ' + g.nom).trim(), g.entreprise, g.telephone].filter(Boolean).join(' · '))}</span></span></label>`).join('')}</div>
        <button type="button" class="btn primary" id="oAll" style="margin-top:6px">Ajouter la sélection</button></div>`;
      $('#oAll', d).onclick = async () => {
        const sel = $$('#oDets input:checked', d).map(i => G[+i.dataset.i]); if (!sel.length) return toast('Coche au moins un e-mail');
        $('#oAll', d).disabled = true; let n = 0, f = 0;
        for (const g of sel) { const { data, error } = await sb.rpc('crm_ajouter', { p: Object.assign({}, g, { origine: 'Photo', tags: ['Photo'], type_contact: PERSO.test(g.email) ? 'Particulier' : 'Pro' }) }); if (!error) { n++; if (data?.fusionne) f++; } }
        closeDrawer(); toast(`${n - f} ajouté(s)${f ? ' · ' + f + ' déjà présent(s), complété(s)' : ''}`); await refreshMeta(); load(true);
      };
    } catch (e) { z.innerHTML = `<div class="ocr"><img src="${url}" alt=""><p class="small">Lecture impossible (${esc(e.message || e)}). Vérifie la connexion et réessaie.</p></div>`; }
  }

  /* ---------- import Google Contacts (CSV ou vCard) ---------- */
  function parseCsv(t) {
    const rows = []; let row = [], cur = '', q = false;
    const sep = (t.split('\n', 1)[0].match(/;/g) || []).length > (t.split('\n', 1)[0].match(/,/g) || []).length ? ';' : ',';
    for (let i = 0; i < t.length; i++) { const c = t[i];
      if (q) { if (c === '"') { if (t[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
      else if (c === '"') q = true; else if (c === sep) { row.push(cur); cur = ''; } else if (c === '\n' || c === '\r') { if (c === '\r' && t[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = ''; } else cur += c; }
    if (cur || row.length) { row.push(cur); rows.push(row); }
    return rows.filter(r => r.some(x => x.trim()));
  }
  function fromCsv(t) {
    const R = parseCsv(t.replace(/^﻿/, '')); if (R.length < 2) return [];
    const H = R[0].map(h => h.trim().toLowerCase()), col = re => H.findIndex(h => re.test(h)), cols = re => H.map((h, i) => re.test(h) ? i : -1).filter(i => i >= 0);
    const iF = col(/^(first name|given name|prénom|prenom)$/), iL = col(/^(last name|family name|nom de famille|nom)$/), iN = col(/^(name|nom complet|display name)$/);
    const iO = col(/organi[sz]ation( 1)? ?(-|–)? ?name|^company$|^entreprise$|société/), iT = col(/organi[sz]ation( 1)? ?(-|–)? ?title|job title|^poste$|fonction/);
    const iP = col(/phone( 1)? ?(-|–)? ?value|mobile phone|^téléphone|^telephone|^phone$/), iE = cols(/e-?mail.*(value|address)|^e-?mail$|courriel/);
    return R.slice(1).map(r => { const ems = [...new Set(iE.flatMap(i => (r[i] || '').split(/\s*:::\s*|[;,]\s*/)).map(x => x.trim().toLowerCase()).filter(x => /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(x)))];
      let pre = iF >= 0 ? r[iF] : '', nom = iL >= 0 ? r[iL] : ''; if (!pre && !nom && iN >= 0) { const p = (r[iN] || '').trim().split(/\s+/); pre = p.shift() || ''; nom = p.join(' '); }
      return { email: ems[0] || '', autres: ems.slice(1), prenom: (pre || '').trim(), nom: (nom || '').trim(), entreprise: iO >= 0 ? (r[iO] || '').trim() : '', metier: iT >= 0 ? (r[iT] || '').trim() : '', telephone: iP >= 0 ? (r[iP] || '').split(':::')[0].trim() : '' }; });
  }
  function fromVcf(t) {
    return t.split(/BEGIN:VCARD/i).slice(1).map(b => { const L = b.replace(/\r?\n[ \t]/g, '').split(/\r?\n/), get = k => L.filter(l => new RegExp('^(item\\d+\\.)?' + k + '[;:]', 'i').test(l)).map(l => l.slice(l.indexOf(':') + 1).trim());
      const n = (get('N')[0] || '').split(';'), ems = [...new Set(get('EMAIL').map(x => x.toLowerCase()))];
      return { email: ems[0] || '', autres: ems.slice(1), prenom: n[1] || (get('FN')[0] || '').split(' ')[0] || '', nom: n[0] || '', entreprise: (get('ORG')[0] || '').split(';')[0], metier: get('TITLE')[0] || '', telephone: get('TEL')[0] || '' }; });
  }
  function openImport() {
    const d = drawer(`<div class="dhead"><button class="icon bare" id="dX" aria-label="Fermer">${ico('x')}</button><h2>Importer des contacts</h2></div>
      <div class="dbody"><div class="card"><h4>Depuis Google Contacts</h4><ol class="steps"><li>Ouvre <a href="https://contacts.google.com" target="_blank" rel="noopener">contacts.google.com</a> sur ordinateur.</li><li>À gauche : <b>Exporter</b> → <b>CSV Google</b> → Exporter.</li><li>Choisis le fichier ci-dessous : seuls les contacts avec un e-mail sont ajoutés, les doublons sont fusionnés.</li></ol>
      <p style="margin:10px 0 4px"><button class="btn primary" id="fBtn">${ico('up')}Choisir le fichier (.csv ou .vcf)</button><input type="file" id="fIn" accept=".csv,.vcf,text/csv,text/vcard" class="hidden"></p><div id="iZ"></div></div>
      <p class="small mut">Marche aussi avec un export Outlook ou iPhone (vCard).</p></div>`);
    $('#dX', d).onclick = closeDrawer; $('#fBtn', d).onclick = () => $('#fIn', d).click();
    $('#fIn', d).onchange = async e => {
      const f = e.target.files[0]; if (!f) return; const t = await f.text();
      const all = /BEGIN:VCARD/i.test(t) ? fromVcf(t) : fromCsv(t), L = all.filter(c => c.email), z = $('#iZ', d);
      if (!L.length) { z.innerHTML = '<p class="small"><b>Aucun contact avec e-mail</b> dans ce fichier.</p>'; return; }
      z.innerHTML = `<p class="small"><b>${L.length}</b> contacts avec e-mail sur ${all.length}.</p><button class="btn primary" id="iGo">Importer ${L.length} contacts</button><div class="prog hidden" id="iPr"><i></i></div><p class="small mut" id="iSt"></p>`;
      $('#iGo', d).onclick = async () => {
        $('#iGo', d).disabled = true; $('#iPr', d).classList.remove('hidden'); let done = 0, nouv = 0, fus = 0, err = 0, i = 0;
        const worker = async () => { while (i < L.length) { const c = L[i++];
          const p = { email: c.email, prenom: c.prenom, nom: c.nom, entreprise: c.entreprise, metier: c.metier, telephone: c.telephone, origine: 'Google Contacts', tags: ['Google Contacts'], type_contact: PERSO.test(c.email) ? 'Particulier' : 'Pro', notes: c.autres.length ? 'Autres e-mails : ' + c.autres.join(', ') : '' };
          const { data, error } = await sb.rpc('crm_ajouter', { p }); if (error) err++; else if (data?.fusionne) fus++; else nouv++;
          done++; $('#iPr i', d).style.width = Math.round(done / L.length * 100) + '%'; $('#iSt', d).textContent = `${done} / ${L.length}`; } };
        await Promise.all([worker(), worker(), worker(), worker()]);
        $('#iSt', d).innerHTML = `✅ <b>${nouv}</b> ajoutés · <b>${fus}</b> déjà présents (complétés)${err ? ` · ${err} erreurs` : ''}`;
        sb.rpc('crm_notifier', { p_titre: 'Import Google Contacts', p_corps: `${nouv} ajoutés, ${fus} complétés`, p_genre: 'import' }).then(() => setTimeout(bellCount, 1500));
        await refreshMeta(); load(true);
      };
    };
  }

  if ($('.top-actions')) injectTop();
  if ($('#side')) renderSide();
  if ($('#list') && S.rows && S.rows.length) renderList();
})();
