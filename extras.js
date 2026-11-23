/* Contacts · compléments v1.10.0
   Notifications par événement (alerte téléphone, son, nuit), sur le modèle de l'admin Malino.
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
  .nev{border-top:1px solid var(--line2)}.nev:first-of-type{border-top:0}
  .nevh{display:flex;align-items:center;gap:8px;padding:6px 0}.nevh .e{font-size:16px;width:22px;text-align:center;flex:none}
  .nevt{flex:1;min-width:0;text-align:left;background:none;border:0;padding:0;color:inherit;font:inherit;cursor:pointer;display:block}
  .nevt b{display:block;font-size:13px;font-weight:600;line-height:1.25}.nevt span{display:block;font-size:11.5px;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .nplay{width:28px;height:26px;border-radius:7px;border:1px solid var(--line);background:var(--panel);font-size:10.5px;color:var(--acc);flex:none;padding:0}
  .nsw{width:34px;height:19px;appearance:none;-webkit-appearance:none;background:#D5D9E0;border-radius:10px;position:relative;cursor:pointer;transition:background .15s;flex:none;margin:0}
  .nsw::after{content:"";position:absolute;top:2px;left:2px;width:15px;height:15px;border-radius:8px;background:#fff;transition:left .15s;box-shadow:0 1px 2px rgba(0,0,0,.2)}
  .nsw:checked{background:var(--acc)}.nsw:checked::after{left:17px}
  .ndesc{font-size:11.5px;color:var(--mut);padding:0 0 6px 30px;line-height:1.35}
  .nsons{display:flex;flex-wrap:wrap;gap:4px;padding:0 0 9px 30px}
  .nsons button{height:24px;padding:0 8px;border-radius:12px;border:1px solid var(--line);background:var(--panel);font-size:11.5px;display:inline-flex;align-items:center;gap:3px;color:var(--ink)}
  .nsons button.on{background:var(--acc-bg);border-color:var(--acc-line);color:var(--acc);font-weight:600}
  .nleg{font-size:11px;color:var(--mut2);padding:0 0 4px;line-height:1.35}
  .nset details{border-top:1px solid var(--line2)}.nset summary{font-size:12px;color:var(--mut);cursor:pointer;padding:7px 0}
  .nset details p{font-size:12px;color:var(--mut);margin:0 0 6px;line-height:1.45}.nset details a{color:var(--acc);text-decoration:none;white-space:nowrap}
  .instb{position:fixed;left:12px;right:12px;bottom:calc(70px + env(safe-area-inset-bottom));z-index:30;max-width:430px;margin:0 auto;background:#16181D;color:#fff;border-radius:14px;padding:10px 12px;display:flex;gap:10px;align-items:center;box-shadow:0 12px 30px rgba(0,0,0,.25)}
  .instb img{width:38px;height:38px;border-radius:10px;flex:none}.instb .m{flex:1;min-width:0;font-size:12.5px;line-height:1.35}.instb b{font-size:13.5px}
  .instb .btn{height:30px}.instb .btn.primary{background:#7A6BFF;border-color:#7A6BFF}.instb .x{background:transparent;border:0;color:#aaa;font-size:18px;padding:0 4px}
  @media (min-width:900px){.instb{bottom:16px;left:auto;right:16px}}
  .ocr{border:1px dashed #C9CFEA;border-radius:11px;padding:8px;background:#FAFAFE}.ocr img{max-width:100%;max-height:170px;border-radius:8px;display:block;margin:0 auto 6px}
  .prog{height:5px;background:#E8EAF6;border-radius:3px;overflow:hidden;margin:6px 0}.prog i{display:block;height:100%;width:0;background:#5140E6;transition:width .2s}
  .det{display:flex;gap:7px;align-items:flex-start;padding:6px 0;border-top:1px solid var(--line2)}.det:first-child{border-top:0}.det input{margin-top:3px}.det .m{flex:1;min-width:0;word-break:break-all}
  .fab2{position:fixed;right:20px;bottom:132px;width:40px;height:40px;border-radius:12px;background:#fff;border:1px solid var(--line);color:var(--acc);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,.12);z-index:10}.fab2 svg{width:19px;height:19px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
  @media (min-width:900px){.fab2{display:none}}
  .xexc.on{background:#FFF7ED;border-color:#FED7AA}
  .xadd{display:grid;grid-template-columns:1fr 1fr;gap:6px;flex:none}.xadd .btn{justify-content:center;height:34px;font-size:12.5px}
  .xtabs{display:flex;margin-bottom:8px}.xtabs button{flex:1;justify-content:center}
  .xta{width:100%;border:1px solid var(--line);border-radius:9px;padding:8px 9px;font-size:13px;line-height:1.4;resize:vertical;min-height:110px;background:var(--panel)}.xta:focus{outline:none;border-color:var(--acc-line);box-shadow:0 0 0 3px #E8EEFB}
  .mapr{display:flex;gap:8px;align-items:center;padding:6px 0;border-top:1px solid var(--line2)}.mapr:first-of-type{border-top:0}.mapr .m{flex:1;min-width:0;display:flex;flex-direction:column}.mapr .m b{font-size:12.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mapr .m span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .mapr select{width:132px;flex:none;height:30px;border:1px solid var(--line);border-radius:7px;font-size:12.5px;padding:0 6px;background:var(--panel)}
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
  // badges ajoutés seulement aux lignes qui n'en ont pas encore (la liste grandit par le bas)
  function addBadges() {
    const byId = new Map((S.rows || []).map(r => [r.id, r]));
    $$('#list .row[data-id]:not([data-xb])').forEach(el => {
      el.dataset.xb = '1';
      const r = byId.get(+el.dataset.id); if (!r) return; const h = badgesFor(r); if (!h) return;
      const t = $('.txt', el); if (t && !$('.xb', t)) t.insertAdjacentHTML('beforeend', `<span class="xb">${h}</span>`);
    });
    $$('#list tr[data-id]:not([data-xb])').forEach(el => {
      el.dataset.xb = '1';
      const r = byId.get(+el.dataset.id); if (!r) return; const h = badgesFor(r, true); if (!h) return;
      const n = $('td.name > div', el); if (n && !$('.xb', n)) n.insertAdjacentHTML('beforeend', `<span class="xb t">${h}</span>`);
    });
  }
  const _renderList = renderList;
  renderList = function () { _renderList.apply(this, arguments); addBadges(); };
  const _appendRows = appendRows;
  appendRows = function () { _appendRows.apply(this, arguments); addBadges(); };

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
    n.insertAdjacentHTML('afterend', `<button class="sbtn" id="sCam">${ico('cam')}Ajouter par photo</button><button class="sbtn" id="sImp">${ico('up')}Importer des contacts</button><button class="sbtn" id="sBell">${ico('bell')}Notifications</button>`);
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
  const NICO = { contact: '👤', import: '📥', desinscription: '🚫', probleme: '⚠️', campagne: '📤', inscription: '✍️', test: '🔔', info: '🔔' };
  // événements importants : pour chacun, alerte sur le téléphone oui / non et son (même principe que l'admin Malino)
  const NEV = [
    ['contact', '👤', 'Nouveau contact', 'Ajouté à la main ou par photo.'],
    ['import', '📥', 'Import terminé', 'Fin d’un import (Google Contacts, CSV, Excel, texte collé).'],
    ['desinscription', '🚫', 'Désinscription', 'Quelqu’un ne veut plus recevoir tes mails (lien ou réponse STOP).'],
    ['probleme', '⚠️', 'Problème d’envoi', 'Mail non délivré (adresse invalide) ou signalé comme spam.'],
    ['campagne', '📤', 'Campagne envoyée', 'Mails envoyés ou programmés, à la main ou par une automatisation.'],
    ['inscription', '✍️', 'Nouvel inscrit', 'Quelqu’un a confirmé son inscription via un lien d’inscription.'],
    ['test', '🔔', 'Essai', 'Le bouton « Tester » en haut.']
  ];
  const NSONS = [['', '📱', 'Son du téléphone'], ['silence', '🔕', 'Silencieux'], ['one-up', '🍄', '1-UP'], ['secret-zelda', '🗝️', 'Secret Zelda'],
    ['mario-mushroom', '⭐', 'Champignon'], ['wiii', '🎢', 'Wiiii'], ['yeet', '🚀', 'Yeet'], ['nom-nom-nom', '😋', 'Nom nom'], ['vine-boom', '💥', 'Vine boom'],
    ['film', '🎬', 'Film'], ['chuiii', '😮', 'Chuiiii'], ['heehee', '🕺', 'Hee-hee'], ['combien', '💸', 'Combiennn'], ['bruh', '😑', 'Bruh'], ['oof', '😵', 'Oof'], ['bonk', '🔨', 'Bonk']];
  const nomSon = k => { const x = NSONS.find(z => z[0] === (k || '')) || NSONS[0]; return x[1] + ' ' + x[2]; };
  const NSon = {
    a: {}, g: '', t: 0,
    jouer(k, genre) { if (genre !== undefined) { this.g = genre; this.t = Date.now(); } if (!k || k === 'silence') return; try { const x = this.a[k] || (this.a[k] = new Audio('sons/' + k + '.mp3')); x.currentTime = 0; x.play().catch(() => { }); } catch (e) { } }
  };
  // appli ouverte à l'écran : le téléphone reste muet et c'est l'appli qui joue le son choisi
  if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message', e => {
    const d = e.data || {}; if (!d.contactsNotif) return;
    if (!(d.genre && d.genre === NSon.g && Date.now() - NSon.t < 10000)) NSon.jouer(d.son); // pas deux fois le même son après un essai
    bellCount(); if (openNotifs.reload) openNotifs.reload();
  });
  async function openNotifs() {
    const d = drawer(`<div class="dhead"><button class="icon bare" id="dX" aria-label="Fermer">${ico('x')}</button><h2>Notifications</h2><button class="btn link" id="nRead">Tout lu</button></div>
      <div class="dbody"><div class="card"><h4>Sur ce téléphone</h4><div class="pushrow" id="pushRow"><span class="small mut">Chargement…</span></div></div>
      <div class="card"><h4>Dernières notifications</h4><div id="nList"><p class="small mut">Chargement…</p></div></div>
      <div class="card nset"><h4>Par événement</h4><div id="nPrefs"><p class="small mut">Chargement…</p></div></div></div>`);
    $('#dX', d).onclick = () => { openNotifs.reload = null; closeDrawer(); };
    drawPush(); drawPrefs($('#nPrefs', d));
    const L = $('#nList', d); let it = [], all = false;
    const row = n => `<div class="nitem ${n.lu_le ? '' : 'new'}" ${n.contact_id ? `data-c="${n.contact_id}" style="cursor:pointer"` : ''}><span class="e">${NICO[n.genre] || '🔔'}</span><div class="m"><b>${esc(n.titre)}</b>${n.corps ? `<div class="small">${esc(n.corps)}</div>` : ''}<small>${ago(n.cree_le)}</small></div></div>`;
    const draw = () => { L.innerHTML = it.length ? it.slice(0, all ? it.length : 5).map(row).join('') + (it.length > 5 ? `<button class="btn link" id="nMore">${all ? 'Réduire' : 'Tout voir (' + it.length + ')'}</button>` : '') : '<p class="small mut">Rien pour l’instant.</p>';
      $$('[data-c]', L).forEach(e => e.onclick = () => { openNotifs.reload = null; openFiche(+e.dataset.c); }); const m = $('#nMore', L); if (m) m.onclick = () => { all = !all; draw(); }; };
    const load = async () => {
      if (!L.isConnected) { openNotifs.reload = null; return; }
      const { data, error } = await sb.rpc('crm_notifs', { p_limite: 100 });
      if (error) { L.innerHTML = '<p class="small mut">Les notifications ne sont pas encore activées côté serveur.</p>'; return; }
      it = data.items || []; draw();
    };
    openNotifs.reload = load; load();
    $('#nRead', d).onclick = async () => { await sb.rpc('crm_notifs_lues', {}); it.forEach(n => n.lu_le = n.lu_le || new Date().toISOString()); draw(); bellCount(); };
  }

  /* ---------- réglages par événement : téléphone oui / non, son, nuit ---------- */
  async function drawPrefs(box) {
    if (!box) return;
    const { data, error } = await sb.rpc('crm_notif_prefs');
    if (error) { box.innerHTML = '<p class="small mut">Réglages indisponibles pour le moment.</p>'; return; }
    let P = data || {}, ouvert = '';
    const enreg = async (args, annuler) => {
      const { data: r, error: e } = await sb.rpc('crm_notif_pref', Object.assign({ p_genre: null, p_push: null, p_son: null, p_nuit: null }, args));
      if (e) { annuler(); toast(errMsg(e)); } else P = r || P;
      draw();
    };
    const draw = () => {
      box.innerHTML = `<p class="nleg">Touche un événement pour choisir son son. ▶ envoie un essai, l’interrupteur active l’alerte sur le téléphone (la liste garde tout).</p>`
        + NEV.map(([k, ic, l, desc]) => {
          const g = P[k] || {}, on = g.push !== false;
          return `<div class="nev"><div class="nevh"><span class="e">${ic}</span>
            <button class="nevt" data-k="${k}"><b>${l}</b><span>${on ? nomSon(g.son) : '📵 Seulement dans la liste'} ${ouvert === k ? '▴' : '▾'}</span></button>
            <button class="nplay" data-t="${k}" aria-label="Essayer ${esc(l)}">▶</button>
            <input type="checkbox" class="nsw" data-p="${k}" ${on ? 'checked' : ''} aria-label="Alerte sur le téléphone : ${esc(l)}"></div>
            ${ouvert === k ? `<div class="ndesc">${desc}</div><div class="nsons">${NSONS.map(([sk, si, sl]) => `<button class="${(g.son || '') === sk ? 'on' : ''}" data-s="${k}|${sk}">${si} ${sl}</button>`).join('')}</div>` : ''}</div>`;
        }).join('')
        + `<div class="nev"><div class="nevh"><span class="e">🌙</span><div class="nevt"><b>Silencieux la nuit</b><span>De 22 h à 7 h, les alertes arrivent sans son</span></div>
            <input type="checkbox" class="nsw" id="nNuit" ${P._nuit ? 'checked' : ''} aria-label="Silencieux la nuit"></div></div>
          <details><summary>🔊 À savoir sur les sons</summary><p>Le son choisi joue quand Contacts est ouvert à l’écran. Appli fermée ou téléphone verrouillé : c’est le son de notification du téléphone qui joue (sauf 🔕 Silencieux, ou la nuit avec 🌙).</p>
            <p>Pour qu’un de ces sons devienne le son des notifications Contacts sur Android, télécharge-le, puis fais un appui long sur une notification Contacts → ⚙️ → Son :<br>${NSONS.slice(2).map(([sk, si, sl]) => `<a href="sons/${sk}.mp3" download="contacts-${sk}.mp3">${si} ${sl}</a>`).join(' · ')}</p></details>`;
      $$('[data-k]', box).forEach(b => b.onclick = () => { ouvert = ouvert === b.dataset.k ? '' : b.dataset.k; draw(); });
      $$('[data-s]', box).forEach(b => b.onclick = () => {
        const [k, sk] = b.dataset.s.split('|'), g = P[k] = Object.assign({}, P[k]), av = g.son;
        g.son = sk; NSon.jouer(sk, k); draw(); enreg({ p_genre: k, p_son: sk }, () => { P[k].son = av; });
      });
      $$('[data-p]', box).forEach(c => c.onchange = () => {
        const k = c.dataset.p, on = c.checked; P[k] = Object.assign({}, P[k], { push: on }); draw();
        enreg({ p_genre: k, p_push: on }, () => { P[k].push = !on; });
      });
      const nu = $('#nNuit', box); if (nu) nu.onchange = () => { const on = nu.checked; P._nuit = on; enreg({ p_nuit: on }, () => { P._nuit = !on; }); };
      $$('[data-t]', box).forEach(b => b.onclick = () => essai(b, b.dataset.t));
    };
    // essai : joue le son ici et envoie une vraie alerte de cet événement (marquée lue tout de suite)
    const essai = async (b, k) => {
      const g = P[k] || {}, ev = NEV.find(x => x[0] === k);
      NSon.jouer(g.son, k); b.textContent = '…';
      const { data: id, error: e } = await sb.rpc('crm_notifier', { p_titre: 'Essai · ' + ev[2], p_corps: 'Voici l’alerte « ' + ev[2] + ' » avec le son ' + nomSon(g.son) + '.', p_genre: k });
      if (id) await sb.rpc('crm_notifs_lues', { p_ids: [id] });
      b.textContent = e ? '✕' : '✓'; setTimeout(() => { b.textContent = '▶'; }, 2200);
      if (e) return toast(errMsg(e));
      if (g.push === false) toast('Alerte téléphone coupée pour cet événement : seulement le son ici');
      else if (!(await pushOn().catch(() => false))) toast('Active les notifications sur ce téléphone pour recevoir l’alerte');
      else toast('Essai envoyé');
      if (openNotifs.reload) setTimeout(openNotifs.reload, 1200);
    };
    draw();
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
    form.insertAdjacentHTML('afterbegin', `<div class="xadd"><button type="button" class="btn" id="camBtn">${ico('cam')}Photo</button><button type="button" class="btn" id="impFBtn">${ico('up')}Importer plusieurs</button></div><input type="file" id="camIn" accept="image/*" capture="environment" class="hidden"><div id="ocrZ"></div>`);
    $('#camBtn', d).onclick = () => { $('#camIn', d).value = ''; $('#camIn', d).click(); };
    $('#impFBtn', d).onclick = () => openImport();
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

  /* ---------- import : texte collé, fichier CSV / Excel / vCard, Google Contacts ---------- */
  const CH = [['ignore', '— Ignorer'], ['email', 'E-mail'], ['prenom', 'Prénom'], ['nom', 'Nom'], ['pnom', 'Prénom + nom'], ['telephone', 'Téléphone'], ['entreprise', 'Entreprise'], ['metier', 'Métier / poste'], ['ville', 'Ville'], ['notes', 'Notes']];
  const PHG = /(?:\+\d{2,3}[\s.\-]?(?:\(0\))?|0)[1-9](?:[\s.\-]?\d{2}){4}/;
  const isEm = v => /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(String(v || '').trim());
  const isPh = v => { const s = String(v || '').trim(); return /^\+?[\d\s.\-()]{8,22}$/.test(s) && s.replace(/\D/g, '').length >= 9; };
  const uniq = a => [...new Set(a)];
  const allEm = t => uniq((String(t).match(EMRE) || []).map(x => x.toLowerCase().replace(/[.,;:]+$/, '')));
  function parseCsv(t) {
    const rows = []; let row = [], cur = '', q = false; const l0 = t.split('\n', 1)[0];
    const sep = (l0.match(/\t/g) || []).length ? '\t' : (l0.match(/;/g) || []).length > (l0.match(/,/g) || []).length ? ';' : ',';
    for (let i = 0; i < t.length; i++) { const c = t[i];
      if (q) { if (c === '"') { if (t[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
      else if (c === '"' && cur === '') q = true; else if (c === sep) { row.push(cur.trim()); cur = ''; } else if (c === '\n' || c === '\r') { if (c === '\r' && t[i + 1] === '\n') i++; row.push(cur.trim()); rows.push(row); row = []; cur = ''; } else cur += c; }
    if (cur || row.length) { row.push(cur.trim()); rows.push(row); }
    return rows.filter(r => r.some(x => x));
  }
  function fromVcf(t) {
    const R = t.split(/BEGIN:VCARD/i).slice(1).map(b => { const L = b.replace(/\r?\n[ \t]/g, '').split(/\r?\n/), get = k => L.filter(l => new RegExp('^(item\\d+\\.)?' + k + '[;:]', 'i').test(l)).map(l => l.slice(l.indexOf(':') + 1).trim());
      const n = (get('N')[0] || '').split(';');
      return [get('EMAIL').join(' '), n[1] || (get('FN')[0] || '').split(' ')[0] || '', n[0] || '', (get('ORG')[0] || '').split(';')[0], get('TITLE')[0] || '', get('TEL')[0] || '']; });
    return { head: ['E-mail', 'Prénom', 'Nom', 'Entreprise', 'Poste', 'Téléphone'], rows: R };
  }
  function guessHead(h) {
    h = String(h || '').toLowerCase().trim();
    if (!h) return null;
    if (/label|type|étiquette/.test(h)) return 'ignore';
    if (/e-?mail|courriel|^mail/.test(h)) return 'email';
    if (/^(first name|given name|prénom|prenom)/.test(h)) return 'prenom';
    if (/^(last name|family name|surname|nom de famille|^nom$)/.test(h)) return 'nom';
    if (/^(name|nom complet|display name|full name|nom et prénom|nom prénom|contact|identité)$/.test(h)) return 'pnom';
    if (/phone|téléphone|telephone|mobile|portable|^tél|^tel\b|gsm/.test(h)) return 'telephone';
    if (/organi[sz]ation.*title|job title|^titre|poste|fonction|métier|metier/.test(h)) return 'metier';
    if (/organi[sz]ation|company|entreprise|société|societe|raison sociale/.test(h)) return 'entreprise';
    if (/city|ville|commune/.test(h)) return 'ville';
    if (/^(notes?|commentaires?|remarques?)$/.test(h)) return 'notes';
    return null;
  }
  function hasHead(R) {
    if (R.length < 2) return false; const r0 = R[0];
    return !r0.some(isEm) && !r0.some(isPh) && r0.filter(Boolean).every(c => c.length < 45) && (r0.some(c => guessHead(c)) || R.slice(1, 20).some(r => r.some(isEm)));
  }
  function guessCols(R, H) {
    const n = Math.max(...R.map(r => r.length)), map = []; let txt = 0;
    for (let c = 0; c < n; c++) {
      const vals = R.map(r => String(r[c] || '').trim()).filter(Boolean);
      if (!vals.length) { map.push('ignore'); continue; }
      let g = H ? guessHead(H[c]) : null;
      if (!g) {
        const pe = vals.filter(v => EMRE.test(v) && (EMRE.lastIndex = 0, true)).length / vals.length, pp = vals.filter(isPh).length / vals.length;
        if (pe >= .5) g = 'email'; else if (pp >= .5) g = 'telephone';
        else if (H) g = 'ignore';
        else { const multi = vals.some(v => v.split(/\s+/).length > 1);
          g = txt === 0 ? (multi ? 'pnom' : 'prenom') : txt === 1 && map.includes('prenom') ? 'nom' : txt === 1 ? 'entreprise' : 'notes'; txt++; }
      }
      map.push(g);
    }
    return map;
  }
  function parseText(t) {
    const L = t.replace(/\r/g, '').split('\n').map(l => l.trim()).filter(Boolean);
    if (!L.length) return null;
    const rest = l => l.replace(EMRE, '').replace(/[\s,;:<>"'()\[\]|\/]+/g, '');
    if (L.every(l => !rest(l))) return { only: true, emails: allEm(t) };
    for (const d of ['\t', ';', '|', ',']) {
      if (L.filter(l => l.includes(d)).length / L.length < .8) continue;
      const R = d === ',' || d === ';' ? parseCsv(L.join('\n')) : L.map(l => l.split(d).map(x => x.trim().replace(/^"|"$/g, '')));
      const H = hasHead(R) ? R[0] : null;
      return { rows: H ? R.slice(1) : R, head: H };
    }
    // Séparé par des espaces : on repère l'e-mail et le téléphone, le reste devient une colonne de texte
    const R = L.map(l => { const em = (l.match(EMRE) || []).join(' '); let r = l.replace(EMRE, ' '); const ph = (r.match(PHG) || [''])[0]; if (ph) r = r.replace(ph, ' ');
      return [em, ph.trim(), r.replace(/[,;|:]+/g, ' ').replace(/\s+/g, ' ').trim()]; });
    return { rows: R, head: null, lab: ['E-mail repéré', 'Téléphone repéré', 'Reste de la ligne'] };
  }
  let xlsxP = null;
  const xlsx = () => xlsxP || (xlsxP = new Promise((ok, ko) => { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'; s.onload = () => ok(window.XLSX); s.onerror = () => { xlsxP = null; ko(new Error('chargement du lecteur Excel')); }; document.head.appendChild(s); }));
  async function readFile(f) {
    const nm = f.name.toLowerCase();
    if (/\.(xlsx|xlsm|xls|ods)$/.test(nm)) {
      const X = await xlsx(), wb = X.read(await f.arrayBuffer(), { type: 'array' });
      let best = null;
      wb.SheetNames.forEach(sn => { const R = X.utils.sheet_to_json(wb.Sheets[sn], { header: 1, defval: '', raw: false }).map(r => r.map(c => String(c ?? '').trim())).filter(r => r.some(Boolean));
        const n = allEm(R.map(r => r.join(' ')).join('\n')).length; if (!best || n > best.n) best = { R, n }; });
      const R = best ? best.R : []; const H = hasHead(R) ? R[0] : null; return { rows: H ? R.slice(1) : R, head: H, src: 'Import fichier' };
    }
    let t = await f.text(); if (t.includes('�')) t = new TextDecoder('windows-1252').decode(await f.arrayBuffer());
    t = t.replace(/^﻿/, '');
    if (/BEGIN:VCARD/i.test(t)) return Object.assign(fromVcf(t), { src: 'Import fichier' });
    if (!/[,;\t]/.test(t.split('\n', 1)[0])) { const p = parseText(t); return p && Object.assign(p, { src: 'Import fichier' }); }
    const R = parseCsv(t), H = hasHead(R) ? R[0] : null;
    return { rows: H ? R.slice(1) : R, head: H, src: H && H.some(h => /e-mail 1 - value|given name|first name/i.test(h)) ? 'Google Contacts' : 'Import fichier' };
  }
  function build(R, map) {
    const by = new Map();
    R.forEach(r => {
      const c = { email: '', autres: [], prenom: '', nom: '', telephone: '', entreprise: '', metier: '', ville: '', notes: [] };
      map.forEach((m, i) => { const v = String(r[i] || '').trim(); if (!v || m === 'ignore') return;
        if (m === 'email') allEm(v).forEach(e => { if (!c.email) c.email = e; else if (e !== c.email && !c.autres.includes(e)) c.autres.push(e); });
        else if (m === 'pnom') { const p = v.split(/\s+/); if (!c.prenom) c.prenom = p.shift() || ''; if (!c.nom) c.nom = p.join(' '); }
        else if (m === 'notes') c.notes.push(v);
        else if (m === 'telephone') { if (!c.telephone) c.telephone = v.split(/\s*:::\s*/)[0]; }
        else if (!c[m]) c[m] = v; });
      if (!c.email) return;
      const o = by.get(c.email); if (!o) by.set(c.email, c); else Object.keys(c).forEach(k => { if (Array.isArray(c[k])) o[k] = uniq(o[k].concat(c[k])); else if (!o[k]) o[k] = c[k]; });
    });
    return [...by.values()];
  }
  function openImport() {
    const d = drawer(`<div class="dhead"><button class="icon bare" id="dX" aria-label="Fermer">${ico('x')}</button><h2>Importer des contacts</h2></div>
      <div class="dbody"><div class="seg xtabs" id="iTabs"><button class="on" data-t="txt">Coller du texte</button><button data-t="file">Fichier CSV / Excel</button></div>
      <div id="iSrc"></div><div id="iMap"></div></div>`);
    $('#dX', d).onclick = closeDrawer;
    const src = $('#iSrc', d), out = $('#iMap', d);
    const tab = t => { $$('#iTabs button', d).forEach(b => b.classList.toggle('on', b.dataset.t === t)); out.innerHTML = '';
      if (t === 'txt') {
        src.innerHTML = `<div class="card"><textarea id="iTxt" class="xta" rows="6" placeholder="Colle ici des e-mails (séparés par des espaces, virgules ou retours à la ligne)…&#10;&#10;…ou une liste, un contact par ligne :&#10;jean@exemple.fr Jean 06 12 34 56 78"></textarea>
          <p class="small mut" style="margin:6px 0 0">Seulement des e-mails : ils sont pris tels quels. Plusieurs informations par ligne : je te demande à quoi correspond chaque colonne.</p></div>`;
        let tm = 0; $('#iTxt', d).oninput = e => { clearTimeout(tm); tm = setTimeout(() => show(parseText(e.target.value), 'Import texte', e.target.value), 350); };
        setTimeout(() => $('#iTxt', d)?.focus(), 80);
      } else {
        src.innerHTML = `<div class="card"><button class="btn primary" id="fBtn">${ico('up')}Choisir un fichier</button><input type="file" id="fIn" accept=".csv,.txt,.tsv,.xlsx,.xlsm,.xls,.ods,.vcf,text/csv,text/vcard" class="hidden">
          <p class="small mut" style="margin:6px 0 0">CSV, Excel (.xlsx, .xls), vCard (.vcf). Seuls les contacts avec un e-mail sont gardés, les doublons sont fusionnés.</p>
          <details class="small" style="margin-top:6px"><summary>Exporter depuis Google Contacts</summary><ol class="steps"><li>Ouvre <a href="https://contacts.google.com" target="_blank" rel="noopener">contacts.google.com</a> sur ordinateur.</li><li>À gauche : <b>Exporter</b> → <b>CSV Google</b> → Exporter.</li><li>Choisis le fichier téléchargé ici.</li></ol></details></div>`;
        $('#fBtn', d).onclick = () => $('#fIn', d).click();
        $('#fIn', d).onchange = async e => { const f = e.target.files[0]; if (!f) return; out.innerHTML = '<p class="small mut">Lecture du fichier…</p>';
          try { const p = await readFile(f); show(p, p && p.src, null, f.name); } catch (x) { out.innerHTML = `<p class="small">Fichier illisible (${esc(x.message || x)}).</p>`; } };
      } };
    $$('#iTabs button', d).forEach(b => b.onclick = () => tab(b.dataset.t));
    tab('txt');

    function show(p, origine, rawText, fname) {
      if (!p || (!p.only && !p.rows.length)) { out.innerHTML = rawText === '' ? '' : '<p class="small">Rien de lisible pour l’instant.</p>'; return; }
      if (p.only) return showEmails(p.emails, origine);
      const R = p.rows, H = p.head, map = guessCols(R, H), n = Math.max(...R.map(r => r.length));
      const cols = [...Array(n).keys()].filter(c => R.some(r => String(r[c] || '').trim()));
      const lab = c => (H && H[c]) || (p.lab && p.lab[c]) || 'Colonne ' + (c + 1);
      const sample = c => R.map(r => String(r[c] || '').trim()).filter(Boolean).slice(0, 2).map(v => v.length > 32 ? v.slice(0, 30) + '…' : v).join(' · ');
      let all = false;
      const draw = () => {
        const main = cols.filter(c => map[c] !== 'ignore'), rest = cols.filter(c => map[c] === 'ignore');
        const shown = all || cols.length <= 8 ? cols : main.length ? main : cols.slice(0, 5);
        const L = build(R, map);
        out.innerHTML = `<div class="card"><h4>${cols.length} colonne${cols.length > 1 ? 's' : ''} détectée${cols.length > 1 ? 's' : ''}${fname ? ' · ' + esc(fname) : ''}</h4><p class="small mut" style="margin:0 0 4px">Indique ce que contient chaque colonne.</p>
          ${shown.map(c => `<div class="mapr"><div class="m"><b>${esc(lab(c))}</b><span class="small mut">${esc(sample(c)) || '—'}</span></div><select data-c="${c}">${CH.map(([k, l]) => `<option value="${k}" ${map[c] === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>`).join('')}
          ${!all && shown.length < cols.length ? `<button class="btn link" id="mAll">Autres colonnes (${cols.length - shown.length})</button>` : ''}
          ${rawText != null ? '<label class="small" style="display:flex;gap:6px;align-items:center;margin-top:6px"><input type="checkbox" id="mOnly">Ne garder que les e-mails (un contact par e-mail)</label>' : ''}</div>
          ${!map.includes('email') ? '<p class="small" style="color:#B42318">⚠️ Choisis la colonne qui contient l’e-mail.</p>' : ''}
          ${footer(L, R.length, origine)}`;
        $$('select[data-c]', out).forEach(s => s.onchange = () => { map[+s.dataset.c] = s.value; draw(); });
        const m = $('#mAll', out); if (m) m.onclick = () => { all = true; draw(); };
        const o = $('#mOnly', out); if (o) o.onchange = () => showEmails(allEm(rawText), origine, () => draw());
        bindGo(L, origine);
      };
      draw();
    }
    function showEmails(E, origine, back) {
      let all = false;
      const draw = () => { const L = E.map(e => ({ email: e, autres: [], prenom: '', nom: '', telephone: '', entreprise: '', metier: '', ville: '', notes: [] }));
        out.innerHTML = `<div class="card"><h4>${E.length} e-mail${E.length > 1 ? 's' : ''} détecté${E.length > 1 ? 's' : ''}</h4>${E.slice(0, all ? E.length : 5).map(e => `<div class="small" style="padding:2px 0">${esc(e)}</div>`).join('')}
          ${E.length > 5 && !all ? `<button class="btn link" id="eAll">Tout voir (${E.length})</button>` : ''}${back ? '<button class="btn link" id="eBack">Revenir aux colonnes</button>' : ''}</div>${footer(L, E.length, origine)}`;
        const a = $('#eAll', out); if (a) a.onclick = () => { all = true; draw(); };
        const b = $('#eBack', out); if (b) b.onclick = back;
        bindGo(L, origine); };
      if (!E.length) { out.innerHTML = '<p class="small">Aucun e-mail trouvé.</p>'; return; }
      draw();
    }
    const footer = (L, tot, origine) => `<div class="card"><div class="f" style="margin:0 0 8px"><span class="small">Étiquettes à ajouter (facultatif)</span><div id="iTagP"></div></div>
      <p class="small" style="margin:0 0 6px"><b>${L.length}</b> contact${L.length > 1 ? 's' : ''} avec e-mail${tot > L.length ? ` sur ${tot} ligne${tot > 1 ? 's' : ''}` : ''} · origine « ${esc(origine)} »</p>
      <button class="btn primary" id="iGo" ${L.length ? '' : 'disabled'}>Importer ${L.length} contact${L.length > 1 ? 's' : ''}</button><div class="prog hidden" id="iPr"><i></i></div><p class="small mut" id="iSt"></p></div>`;
    function bindGo(L, origine) {
      const g = $('#iGo', out); if (!g) return;
      // étiquettes : on garde celles déjà choisies si la liste est redessinée ; suggestions d'après les domaines des e-mails importés
      const host = $('#iTagP', out), avant = out._tp ? out._tp.get() : [];
      const tp = host ? tagPicker(host, avant, () => ({ emails: L.slice(0, 200).map(c => c.email) })) : null;
      out._tp = tp;
      g.onclick = async () => {
        g.disabled = true; $$('select,#mOnly', out).forEach(x => x.disabled = true); if (tp) tp.lock(true); $('#iPr', out).classList.remove('hidden');
        const extra = tp ? tp.get() : [], tag = extra.join(', '), tags = uniq(['Import', origine === 'Google Contacts' ? 'Google Contacts' : null, ...extra].filter(Boolean));
        let done = 0, nouv = 0, fus = 0, err = 0, i = 0;
        const worker = async () => { while (i < L.length) { const c = L[i++];
          const notes = [c.notes.join(' · '), c.autres.length ? 'Autres e-mails : ' + c.autres.join(', ') : ''].filter(Boolean).join('\n');
          const p = { email: c.email, prenom: c.prenom, nom: c.nom, entreprise: c.entreprise, metier: c.metier, ville: c.ville, telephone: c.telephone, origine, tags, type_contact: PERSO.test(c.email) ? 'Particulier' : 'Pro', notes };
          const { data, error } = await sb.rpc('crm_ajouter', { p }); if (error) err++; else if (data?.fusionne) fus++; else nouv++;
          done++; $('#iPr i', out).style.width = Math.round(done / L.length * 100) + '%'; $('#iSt', out).textContent = `${done} / ${L.length}`; } };
        await Promise.all([1, 2, 3, 4, 5].map(worker));
        $('#iSt', out).innerHTML = `✅ <b>${nouv}</b> ajouté${nouv > 1 ? 's' : ''} · <b>${fus}</b> déjà présent${fus > 1 ? 's' : ''} (complété${fus > 1 ? 's' : ''})${err ? ` · ${err} erreur${err > 1 ? 's' : ''}` : ''}`;
        g.textContent = 'Terminé'; toast(`${nouv} contact${nouv > 1 ? 's' : ''} ajouté${nouv > 1 ? 's' : ''}`);
        sb.rpc('crm_notifier', { p_titre: 'Import terminé', p_corps: `${origine} : ${nouv} ajoutés, ${fus} complétés${tag ? ' · ' + tag : ''}`, p_genre: 'import' }).then(() => setTimeout(bellCount, 1500));
        await refreshMeta(); load(true);
      };
    }
  }


  /* ---------- exclusion des envois : modifiable dans la fiche et en lot ---------- */
  const MOTIFS = ['exclu à la main', 'Particulier', 'Ne veut pas être contacté', 'Adresse en échec', 'Concurrent', 'Doublon', 'Autre'];
  const _renderFiche = renderFiche;
  renderFiche = function (d, c) {
    _renderFiche.apply(this, arguments);
    const qa = $('.qa', d); if (!qa || $('#xExc', d)) return;
    const exc = !!(c.a_exclure || c.desinscrit);
    const info = exc ? (c.desinscrit ? 'Ne plus contacter' + (c.motif_exclusion && !/ne plus contacter/i.test(c.motif_exclusion) ? ' · ' + c.motif_exclusion : '') : (c.motif_exclusion || 'Exclu')) : 'Reçoit les campagnes e-mail';
    qa.insertAdjacentHTML('afterend', `<div class="card xexc${exc ? ' on' : ''}" id="xExc"><label class="tog" style="border:0;min-height:30px"><span><b>Exclu des envois</b><br><span class="small mut">${esc(info)}</span></span><input type="checkbox" id="xExcT" ${exc ? 'checked' : ''} aria-label="Exclu des envois"></label>
      ${exc && !c.desinscrit ? `<div class="f" style="margin:6px 0 0"><label class="small">Motif</label><select id="xMot">${uniq([c.motif_exclusion, ...MOTIFS].filter(Boolean)).map(m => `<option ${m === c.motif_exclusion ? 'selected' : ''}>${esc(m)}</option>`).join('')}</select></div>` : ''}
      ${c.blacklist ? '<p class="small" style="margin:6px 0 0;color:#B42318">Adresse en liste noire (e-mails en échec) : elle reste bloquée pour les envois.</p>' : ''}</div>`);
    $('#xExcT', d).onchange = e => {
      const on = e.target.checked;
      if (!on && c.desinscrit && !confirm('Cette personne avait demandé à ne plus être contactée. La réintégrer quand même ?')) { e.target.checked = true; return; }
      save(d, on ? { id: c.id, a_exclure: true, motif_exclusion: 'exclu à la main' } : { id: c.id, a_exclure: false, desinscrit: false }, true);
    };
    const mo = $('#xMot', d); if (mo) mo.onchange = () => save(d, { id: c.id, a_exclure: true, motif_exclusion: mo.value }, true);
  };
  const _renderBulk = renderBulk;
  renderBulk = function () {
    _renderBulk.apply(this, arguments);
    const b = $('#bExc'); if (!b || $('#bInc')) return;
    b.insertAdjacentHTML('afterend', `<button class="btn" id="bInc">Réintégrer</button>`);
    $('#bInc').onclick = async () => {
      const n = S.sel.size;
      try { const k = await rpc('crm_lot', { p_ids: Array.from(S.sel), p_action: 'inclure', p_valeur: null });
        toast(`${k} réintégré${k > 1 ? 's' : ''}${k < n ? ` · ${n - k} désinscrit${n - k > 1 ? 's' : ''} ou en échec restent exclus` : ''}`); await refreshMeta(); load(true);
      } catch (e) { toast(errMsg(e)); }
    };
  };

  if ($('.top-actions')) injectTop();
  if ($('#side')) renderSide();
  if ($('#list') && S.rows && S.rows.length) renderList();
})();
