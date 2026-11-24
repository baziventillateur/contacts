/* Contacts · espace « Envois » (v1.17.0)
   Tout ce qui part par mail, rangé en 5 onglets :
   ⏳ À venir      — tout ce qui va partir, jour par jour (mails simples, campagnes programmées, parcours)
   ✉️ Mails simples — un mail écrit pour une personne, tout de suite ou à l'heure choisie (gardé et envoyé par Contacts : fonction crm-mails)
   📣 Campagnes     — le même mail à un groupe, une fois (prospection, relance, fidélisation) ou régulièrement (newsletter)
   ⚙️ Automatiques  — parcours (suites de mails après l'inscription) et mails des applis (codes, rapports, alertes)
   🕘 Historique    — tout ce qui est parti, filtrable par type */
(function () {
  const mFn = body => fnCall('crm-mails', body);
  const TABS = [['avenir', '⏳', 'À venir'], ['simples', '✉️', 'Mails simples'], ['campagnes', '📣', 'Campagnes'], ['auto', '⚙️', 'Automatiques'], ['histo', '🕘', 'Historique']];
  let TAB = 'avenir'; try { TAB = localStorage.getItem('contacts-envois') || 'avenir'; } catch (e) { }
  if (!TABS.some(t => t[0] === TAB)) TAB = 'avenir';
  const EXP = [['Émir de Malino', 'malino@paceapp.fr'], ['Houda via Malino', 'malino@paceapp.fr'], ['Malino', 'malino@paceapp.fr'], ['Samy de Malino', 'malino@paceapp.fr'], ['Samy', 'contact@paceapp.fr'], ['PaceApp', 'contact@paceapp.fr']];
  const ADR = ['malino@paceapp.fr', 'contact@paceapp.fr', 'nexbim@paceapp.fr'];
  const MKT = ['prospection', 'relance', 'fidelisation', 'newsletter'];
  const NB = { avenir: null, simples: null };

  const css = document.createElement('style');
  css.textContent = `
  .etabs{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;margin:0 12px 10px;max-width:1156px;padding:3px;background:var(--panel);border:1px solid var(--line);border-radius:12px;box-shadow:0 2px 8px rgba(20,30,60,.05)}
  .etabs::-webkit-scrollbar{display:none}
  .etabs button{flex:1 0 auto;display:inline-flex;align-items:center;justify-content:center;gap:5px;height:32px;padding:0 10px;border:0;border-radius:9px;background:transparent;font:600 12.5px Inter,system-ui,sans-serif;color:var(--mut);cursor:pointer;white-space:nowrap}
  .etabs button.on{background:linear-gradient(180deg,#FFFFFF,#F1EEFF);color:var(--ink);box-shadow:0 1px 0 var(--acc-line) inset,0 2px 6px rgba(75,47,214,.14)}
  .etabs .en{min-width:17px;height:17px;padding:0 5px;border-radius:9px;background:#EEE9FF;color:#4B2FD6;font-size:10.5px;display:inline-grid;place-items:center}
  .ehead{display:flex;align-items:center;gap:10px;margin:0 0 8px}.ehead .tx{flex:1;min-width:0}.ehead h2{margin:0;font-size:15px}.ehead p{margin:1px 0 0;font-size:12px;color:var(--mut)}
  .ewrap{display:flex;flex-direction:column;gap:10px;padding:0 12px 90px;max-width:1180px}
  .avday{font-size:11.5px;font-weight:700;color:var(--mut);text-transform:uppercase;letter-spacing:.4px;margin:6px 2px 4px}
  .avrow{display:flex;align-items:center;gap:9px;width:100%;text-align:left;border:1px solid var(--line);background:var(--panel);border-radius:11px;padding:7px 10px;margin:0 0 5px;font:inherit;color:inherit;cursor:pointer;box-shadow:0 1px 0 rgba(20,30,60,.04)}
  .avrow:hover{border-color:var(--acc-line)}
  .avrow .h{flex:none;width:44px;font:700 12.5px ui-monospace,Menlo,monospace;color:var(--ink)}
  .avrow .k{flex:none;width:30px;height:30px;border-radius:9px;display:grid;place-items:center;font-size:15px;box-shadow:inset 0 -2px 0 rgba(0,0,0,.06)}
  .k-simple{background:#E0F2FE}.k-campagne{background:#FEF3C7}.k-parcours{background:#DCFCE7}.k-erreur{background:#FEE2E2}
  .avrow .tx{flex:1;min-width:0}.avrow b{display:block;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .avrow .sub{display:block;font-size:11.5px;color:var(--mut);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .avrow>svg{width:14px;height:14px;stroke:var(--mut2);fill:none;stroke-width:2;flex:none}
  .ekey{display:flex;gap:10px;flex-wrap:wrap;font-size:11.5px;color:var(--mut);margin:2px 2px 0}.ekey i{font-style:normal}
  .estat{display:inline-block;padding:1px 7px;border-radius:8px;font-size:10.5px;font-weight:700;margin-left:4px;vertical-align:1px}
  .st-prevu{background:#EEE9FF;color:#4B2FD6}.st-erreur{background:#FEE2E2;color:#B91C1C}.st-envoye{background:#DCFCE7;color:#15803D}.st-annule{background:#EEF0F4;color:#6B7280}.st-envoi{background:#E0F2FE;color:#0369A1}
  .aucard{display:flex;align-items:center;gap:10px;width:100%;text-align:left;border:1px solid var(--line);background:linear-gradient(135deg,#F8FAFC,#FFFFFF);border-radius:11px;padding:8px 11px;margin:0 0 5px;font:inherit;color:inherit;cursor:pointer}
  .aucard .pe{font-size:18px;width:34px;height:34px;display:grid;place-items:center;border-radius:10px;background:#EEF2F7;flex:none}
  .aucard>svg{width:14px;height:14px;stroke:var(--mut2);fill:none;stroke-width:2;flex:none}.aucard .tx{flex:1;min-width:0}.aucard b{font-size:13px}.aucard .sub{display:block;font-size:11.5px;color:var(--mut)}
  .mse .card h4{margin-bottom:6px}.mse .row2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .mse textarea{width:100%;min-height:150px;resize:vertical;border:1px solid var(--line);border-radius:9px;padding:8px 10px;font:14px/1.45 Inter,system-ui,sans-serif}
  .mexp{display:flex;gap:4px;flex-wrap:wrap;margin:0 0 6px}.mexp button{border:1px solid var(--line);background:var(--panel);border-radius:13px;padding:2px 9px;font:600 11.5px Inter,system-ui,sans-serif;color:var(--mut);cursor:pointer}
  .mexp button.on{background:var(--acc-bg);border-color:var(--acc-line);color:var(--acc)}
  .msug{display:flex;flex-direction:column;gap:3px;margin:-2px 0 6px}.msug button{display:flex;gap:8px;align-items:center;text-align:left;border:1px solid var(--line);background:#FAFAFD;border-radius:8px;padding:5px 8px;font:inherit;font-size:12.5px;cursor:pointer}
  .msug button span{color:var(--mut);font-size:11.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .mhtml{border:1px solid #DDD6FE;background:#F5F3FF;border-radius:10px;padding:8px 10px;font-size:12.5px;line-height:1.45;display:flex;flex-direction:column;gap:6px}
  .mhtml .b{display:flex;gap:6px;flex-wrap:wrap}
  .mquand{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.mquand input{height:32px;border:1px solid var(--line);border-radius:8px;padding:0 8px;font-size:13px}
  .mdang{display:flex;gap:8px;flex-wrap:wrap;justify-content:space-between}
  .mfiche{display:flex;flex-direction:column;gap:4px;margin:6px 0 0}
  @media (max-width:899px){.etabs{margin:0 10px 8px}.ewrap{padding:0 10px 90px}}
  @media (max-width:520px){.etabs button{padding:0 8px;font-size:12px}.mse .row2{grid-template-columns:1fr}}`;
  document.head.appendChild(css);

  /* ---------- petits outils ---------- */
  const pad = n => String(n).padStart(2, '0');
  const loc = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const hm = x => new Date(x).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const jourKey = x => { const d = new Date(x); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  function jourTxt(x) {
    const d = new Date(x), j = new Date(); j.setHours(0, 0, 0, 0);
    const k = Math.round((new Date(d).setHours(0, 0, 0, 0) - j) / 864e5);
    const long = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    return k === 0 ? 'Aujourd’hui · ' + long : k === 1 ? 'Demain · ' + long : k < 0 ? 'En retard · ' + long : long;
  }
  const quandCourt = x => { const d = new Date(x); const auj = new Date().toDateString() === d.toDateString(); return (auj ? 'auj.' : d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' })) + ' · ' + hm(x); };
  const nomDe = m => [m.p_prenom || m.a_prenom, m.p_nom].filter(Boolean).join(' ') || m.a_email;
  const ST = { prevu: 'Prévu', envoi: 'En cours', envoye: 'Parti', annule: 'Annulé', erreur: 'Erreur' };
  const stc = s => `<span class="estat st-${esc(s)}">${esc(ST[s] || s)}</span>`;
  const chev = '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>';
  const head = (t, p, act) => `<div class="ehead"><div class="tx"><h2>${t}</h2><p>${p}</p></div>${act || ''}</div>`;
  const btnNew = `<button class="btn primary small" data-enew>${ico('plus')}Nouveau mail</button>`;
  function lier(w) { $$('[data-enew]', w).forEach(b => b.onclick = () => editer()); $$('[data-more]', w).forEach(b => b.onclick = () => { $('#' + b.dataset.more).classList.remove('hidden'); b.remove(); }); }

  /* ---------- page Envois : onglets ---------- */
  const _rc = window.renderCampagnes;
  window.renderCampagnes = async function (force) {
    const P = $('#pCamp'); if (!P) return;
    if (!$('#eTabs', P)) P.innerHTML = `<div class="etabs" id="eTabs" role="tablist" aria-label="Types d’envoi"></div><div id="pCampBody"></div>`;
    tabs();
    const B = $('#pCampBody');
    if (TAB === 'campagnes') return _rc.call(this, force);
    B.innerHTML = ''; const w = document.createElement('div'); w.className = 'ewrap'; B.appendChild(w);
    try {
      if (TAB === 'avenir') await avenir(w);
      else if (TAB === 'simples') await simples(w);
      else if (TAB === 'auto') await auto(w, force);
      else if (TAB === 'histo') await histo(w);
    } catch (e) { w.insertAdjacentHTML('beforeend', `<p class="empty">${esc(errMsg(e))}</p>`); }
  };
  function tabs() {
    const T = $('#eTabs'); if (!T) return;
    T.innerHTML = TABS.map(([k, e, l]) => `<button role="tab" aria-selected="${k === TAB}" class="${k === TAB ? 'on' : ''}" data-etab="${k}"><span>${e}</span>${l}${NB[k] ? `<span class="en">${NB[k]}</span>` : ''}</button>`).join('');
    $$('[data-etab]', T).forEach(b => b.onclick = () => ouvrir(b.dataset.etab));
    const on = $('.on', T); if (on && on.scrollIntoView) try { on.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) { }
  }
  function ouvrir(k) {
    TAB = k; try { localStorage.setItem('contacts-envois', k); } catch (e) { }
    if (S.page !== 'campagnes') showPage('campagnes', true);
    window.renderCampagnes();
  }
  window.ouvrirEnvois = ouvrir;
  async function compter() {
    try { const r = await mFn({ action: 'a_venir', jours: 14 }); NB.simples = (r.simples || []).length || null; tabs(); } catch (e) { }
  }

  /* ---------- ⏳ À venir ---------- */
  async function parcoursAVenir(jours) {
    try {
      const r = await fnCall('crm-parcours', { action: 'liste' }), out = [];
      for (const p of (r.parcours || []).filter(p => p.actif)) {
        const f = await fnCall('crm-parcours', { action: 'familles', parcours: p.slug });
        for (const x of f.familles || []) if (x.prochain && new Date(x.prochain.quand) < Date.now() + jours * 864e5) out.push({ p, x });
      }
      return out;
    } catch (e) { return []; }
  }
  async function avenir(w) {
    w.innerHTML = head('⏳ À venir', 'Tout ce qui va partir dans les 14 prochains jours, quel que soit le type.', btnNew) + '<div id="avL"><p class="small mut">Chargement…</p></div>';
    lier(w);
    const [a, pcs] = await Promise.all([mFn({ action: 'a_venir', jours: 14 }), parcoursAVenir(14)]);
    const it = [];
    (a.simples || []).forEach(m => it.push({ t: m.envoyer_le, k: m.statut === 'erreur' ? 'erreur' : 'simple', html: () => `<span class="k k-${m.statut === 'erreur' ? 'erreur' : 'simple'}">${m.statut === 'erreur' ? '⚠️' : '✉️'}</span><span class="tx"><b>${esc(m.sujet)}</b><span class="sub">Mail simple · ${esc(nomDe(m))}${m.statut === 'erreur' ? ' · pas parti, touche pour réessayer' : ''}</span></span>`, go: () => editer(m.id) }));
    (a.campagnes || []).forEach(c => it.push({ t: c.quand, k: 'campagne', html: () => `<span class="k k-campagne">📣</span><span class="tx"><b>${esc(campShort(c.nom))}</b><span class="sub">${c.type === 'newsletter' ? 'Newsletter' : 'Campagne'} · ${fmtN(c.nb)} personne${c.nb > 1 ? 's' : ''}</span></span>`, go: () => openCampagne(c.slug) }));
    const g = new Map();
    pcs.forEach(({ p, x }) => { const k = p.slug + '|' + x.prochain.quand.slice(0, 16) + '|' + x.prochain.num; if (!g.has(k)) g.set(k, { p, q: x.prochain, n: [] }); g.get(k).n.push(x.prenom || x.email); });
    g.forEach(v => it.push({ t: v.q.quand, k: 'parcours', html: () => `<span class="k k-parcours">🌱</span><span class="tx"><b>${esc(String(v.q.sujet).replace(/\{enfants?\}/g, 'l’enfant').replace(/\{[^}]+\}/g, '…'))}</b><span class="sub">Parcours · mail ${v.q.num} · ${esc(v.n.slice(0, 3).join(', '))}${v.n.length > 3 ? ' +' + (v.n.length - 3) : ''}</span></span>`, go: () => window.openParcours && openParcours(v.p.slug) }));
    it.sort((x, y) => new Date(x.t) - new Date(y.t));
    NB.avenir = it.length || null; tabs();
    const L = $('#avL', w);
    if (!it.length) { L.innerHTML = '<p class="empty">Rien de prévu pour l’instant.</p>'; return; }
    const jours = []; it.forEach(x => { const k = jourKey(x.t); let j = jours.find(z => z.k === k); if (!j) jours.push(j = { k, t: x.t, l: [] }); j.l.push(x); });
    let i = 0; const fn = [];
    L.innerHTML = jours.map((j, n) => `<div class="avday">${esc(jourTxt(j.t))}</div>` + shortList(j.l, 6, x => { fn[i] = x.go; return `<button class="avrow" data-av="${i++}"><span class="h">${esc(hm(x.t))}</span>${x.html()}${chev}</button>`; }, 'avd' + n)).join('')
      + `<div class="ekey"><i>✉️ mail simple</i><i>📣 campagne</i><i>🌱 parcours</i></div>`;
    $$('[data-av]', L).forEach(b => b.onclick = () => fn[+b.dataset.av]());
    lier(L);
  }

  /* ---------- ✉️ Mails simples ---------- */
  const ligne = m => `<button class="avrow" data-ms="${m.id}" data-st="${esc(m.statut)}" data-rid="${esc(m.resend_id || '')}"><span class="h">${esc(quandCourt(m.envoye_le || m.envoyer_le).replace(' · ', '\n'))}</span>
    <span class="tx"><b>${esc(m.sujet)}</b><span class="sub">${esc(nomDe(m))}${stc(m.statut)}${m.erreur ? ' · ' + esc(String(m.erreur).slice(0, 60)) : ''}</span></span>${chev}</button>`;
  function lierLignes(box) {
    $$('[data-ms]', box).forEach(b => b.onclick = () => b.dataset.st === 'envoye' && b.dataset.rid ? openApercu({ resend_id: b.dataset.rid }) : editer(+b.dataset.ms));
  }
  async function simples(w) {
    w.innerHTML = head('✉️ Mails simples', 'Un mail écrit pour une personne, envoyé tout de suite ou à l’heure choisie. Contacts le garde et l’envoie tout seul.', btnNew)
      + `<section class="csec"><h3>Programmés</h3><div id="msP"><p class="small mut">Chargement…</p></div></section>
         <section class="csec"><h3>Partis et annulés</h3><div id="msF"></div></section>`;
    lier(w);
    const r = await mFn({ action: 'liste' });
    NB.simples = (r.prevus || []).length || null; tabs();
    const P = $('#msP', w), F = $('#msF', w);
    P.innerHTML = (r.prevus || []).length ? shortList(r.prevus, 5, ligne, 'msPm') : '<p class="small mut">Aucun mail programmé. Touche « Nouveau mail », ou « Écrire un mail » sur la fiche d’un contact.</p>';
    F.innerHTML = (r.faits || []).length ? shortList(r.faits, 5, ligne, 'msFm') : '<p class="small mut">Rien pour l’instant.</p>';
    lierLignes(w); lier(w);
    $$('.avrow .h', w).forEach(h => { h.style.whiteSpace = 'pre-line'; h.style.lineHeight = '1.2'; h.style.width = '62px'; h.style.fontSize = '11px'; });
  }

  /* ---------- éditeur d'un mail simple ---------- */
  async function editer(id, pre) {
    let m = Object.assign({ mode: 'texte', expediteur: 'Émir de Malino <malino@paceapp.fr>' }, pre || {}), html = null;
    const d = drawer(`<div class="dhead"><button class="icon bare" id="dX" aria-label="Fermer">${ico('back')}</button><h2>${id ? 'Mail programmé' : 'Nouveau mail'}</h2></div><div class="dbody"><p class="small mut">Chargement…</p></div>`);
    $('#dX', d).onclick = closeDrawer;
    if (id) { try { const r = await mFn({ action: 'lire', id }); m = r.mail; html = m.html; } catch (e) { $('.dbody', d).innerHTML = `<p class="empty">${esc(errMsg(e))}</p>`; return; } }
    const parti = m.statut === 'envoye' || m.statut === 'envoi';
    const nomAff = (String(m.expediteur).match(/^(.*?)\s*</) || [])[1] || '';
    const adr = ((String(m.expediteur).match(/<([^>]+)>/) || [])[1] || m.expediteur || 'malino@paceapp.fr').toLowerCase();
    const demain = () => { const x = new Date(); x.setDate(x.getDate() + 1); x.setHours(9, 0, 0, 0); return x; };
    let prog = true, dt = m.envoyer_le && new Date(m.envoyer_le) > Date.now() ? loc(new Date(m.envoyer_le)) : loc(demain());
    let mode = m.mode === 'html' && html ? 'html' : 'texte';
    const draw = () => {
      d.innerHTML = `<div class="dhead"><button class="icon bare" id="dX" aria-label="Fermer">${ico('back')}</button><h2>${id ? (parti ? 'Mail parti' : 'Mail programmé') : 'Nouveau mail'}</h2>${id ? stc(m.statut) : ''}</div>
      <div class="dbody mse">
        ${m.statut === 'erreur' ? `<div class="alert bad"><b>Ce mail n’est pas parti.</b><span class="small">${esc(m.erreur || '')}</span></div>` : ''}
        <div class="card"><h4>À</h4>
          <label class="f">Destinataire<input id="mA" type="email" value="${esc(m.a_email || '')}" placeholder="Nom d’un contact ou adresse e-mail" autocomplete="off" ${parti ? 'disabled' : ''}></label>
          <div class="msug" id="mSug"></div>
          <label class="f">Prénom <span class="small mut">(remplace {prénom})</span><input id="mP" maxlength="60" value="${esc(m.a_prenom || '')}" ${parti ? 'disabled' : ''}></label></div>
        <div class="card"><h4>De</h4>
          <div class="mexp">${EXP.map(([n, a]) => `<button type="button" data-exp="${esc(n)}|${esc(a)}" class="${n === nomAff && a === adr ? 'on' : ''}">${esc(n)}</button>`).join('')}</div>
          <div class="row2"><label class="f">Nom affiché<input id="mN" maxlength="60" value="${esc(nomAff)}" ${parti ? 'disabled' : ''}></label>
            <label class="f">Adresse<select id="mAd" ${parti ? 'disabled' : ''}>${ADR.map(a => `<option ${a === adr ? 'selected' : ''}>${a}</option>`).join('')}</select></label></div>
          <p class="small mut" style="margin:2px 0 0">Les réponses arrivent sur cette adresse.</p></div>
        <div class="card"><h4>Mail</h4>
          <label class="f">Objet<input id="mS" maxlength="200" value="${esc(m.sujet || '')}" ${parti ? 'disabled' : ''}></label>
          ${mode === 'html' ? `<div class="mhtml"><span>🎨 <b>Mise en page personnalisée</b> (préparée avec Claude). Pour changer le texte, demande à Claude, ou repasse en texte simple.</span>
              <span class="b"><button type="button" class="btn small" id="mVoir">${ico('eye')}Voir le mail</button>${parti ? '' : '<button type="button" class="btn small" id="mTxt">Repasser en texte simple</button>'}</span></div>`
            : `<label class="f">Message<textarea id="mT" ${parti ? 'disabled' : ''} placeholder="Bonjour {prénom},&#10;&#10;…">${esc(m.texte || '')}</textarea></label>
              <div class="pcvars"><button type="button" data-var="{prénom}">{prénom}</button></div>
              <div class="row2"><label class="f">Bouton <span class="small mut">(facultatif)</span><input id="mBt" maxlength="60" value="${esc(m.bouton_texte || '')}" placeholder="ex. Rejoindre" ${parti ? 'disabled' : ''}></label>
                <label class="f">Lien du bouton<input id="mBu" value="${esc(m.bouton_url || '')}" placeholder="https://…" ${parti ? 'disabled' : ''}></label></div>`}</div>
        ${parti ? `<div class="card"><h4>Envoi</h4><p class="small" style="margin:0">Parti le ${esc(new Date(m.envoye_le || m.maj).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }))}.</p></div>`
          : `<div class="card"><h4>Quand</h4><div class="mquand"><div class="seg" id="mQ"><button type="button" data-q="0" class="${prog ? '' : 'on'}">Maintenant</button><button type="button" data-q="1" class="${prog ? 'on' : ''}">Programmer</button></div>
              <input type="datetime-local" id="mDt" value="${esc(dt)}" ${prog ? '' : 'hidden'}></div>
              <p class="small mut" style="margin:6px 0 0">${prog ? 'Contacts garde le mail et l’envoie tout seul à l’heure prévue.' : 'Le mail part dès que tu confirmes.'}</p></div>`}
        <label class="f">Note interne <span class="small mut">(pour toi, pas dans le mail)</span><input id="mNo" maxlength="300" value="${esc(m.note || '')}" ${parti ? 'disabled' : ''}></label>
        ${id && !parti && m.statut !== 'annule' ? `<div class="mdang"><button type="button" class="btn link small" id="mAnn" style="color:var(--bad);padding:0">Annuler l’envoi</button></div>` : ''}
      </div>
      <div class="dfoot">${parti ? `<button class="btn" id="mVoir2">${ico('eye')}Voir le mail</button><button class="btn primary" id="mFerme">Fermer</button>`
        : `<button class="btn" id="mAp">${ico('eye')}<span class="only-d">Aperçu</span></button><button class="btn" id="mTest">M’envoyer un test</button><button class="btn primary" id="mGo">${prog ? (id ? 'Enregistrer' : 'Programmer') : 'Envoyer'}</button>`}</div>`;
      bind();
    };
    const lire = () => {
      const g = s => { const e = $(s, d); return e ? e.value : ''; };
      if ($('#mA', d)) Object.assign(m, { a_email: g('#mA').trim(), a_prenom: g('#mP').trim(), sujet: g('#mS'), note: g('#mNo') });
      if ($('#mN', d)) m.expediteur = (g('#mN').trim() ? g('#mN').trim() + ' ' : '') + '<' + g('#mAd') + '>';
      if ($('#mT', d)) Object.assign(m, { texte: g('#mT'), bouton_texte: g('#mBt'), bouton_url: g('#mBu') });
      if ($('#mDt', d)) dt = g('#mDt') || dt;
    };
    const corps = extra => {
      lire();
      const nom = (String(m.expediteur).match(/^(.*?)\s*</) || [])[1] || '', ad = (String(m.expediteur).match(/<([^>]+)>/) || [])[1] || '';
      return Object.assign({ id: id || undefined, a_email: m.a_email, a_prenom: m.a_prenom, nom_affiche: nom, adresse: ad, sujet: m.sujet, mode, html: mode === 'html' ? html : undefined,
        texte: mode === 'html' ? m.texte : m.texte, bouton_texte: m.bouton_texte, bouton_url: m.bouton_url, note: m.note }, extra || {});
    };
    const voir = async () => {
      let r;
      try { r = mode === 'html' ? { html, sujet: m.sujet } : await mFn(Object.assign(corps(), { action: 'apercu' })); } catch (e) { return toast(errMsg(e)); }
      const w = dialog('Aperçu · ' + (r.sujet || ''), '<div id="mFr"></div><div class="mact"><button class="btn primary" id="mOk">Fermer</button></div>');
      const f = document.createElement('iframe'); f.className = 'mframe'; f.title = 'Aperçu du mail'; f.setAttribute('sandbox', 'allow-popups allow-popups-to-escape-sandbox');
      f.srcdoc = String(r.html).replace(/<head([^>]*)>/i, '<head$1><base target="_blank">'); f.style.minHeight = '420px'; $('#mFr', w).appendChild(f);
      $('#mOk', w).onclick = closeApercu;
    };
    function bind() {
      $('#dX', d).onclick = closeDrawer;
      const A = $('#mA', d), Sug = $('#mSug', d);
      let req = 0, tmr = null;
      if (A) A.oninput = () => {
        clearTimeout(tmr); const q = A.value.trim();
        if (q.length < 2 || /@.+\./.test(q)) { Sug.innerHTML = ''; return; }
        tmr = setTimeout(async () => {
          const my = ++req;
          try {
            const r = await rpc('crm_liste', { p: { q, limit: 6, offset: 0 } }); if (my !== req) return;
            const rows = (r.rows || []).filter(x => x.email);
            Sug.innerHTML = rows.map(x => `<button type="button" data-sg="${esc(x.email)}|${esc(x.prenom || '')}"><b>${esc(fullName(x))}</b><span>${esc(x.email)}</span></button>`).join('');
            $$('[data-sg]', Sug).forEach(b => b.onclick = () => { const [e, p] = b.dataset.sg.split('|'); A.value = e; if (p && !$('#mP', d).value) $('#mP', d).value = p; Sug.innerHTML = ''; });
          } catch (e) { }
        }, 220);
      };
      $$('[data-exp]', d).forEach(b => b.onclick = () => { const [n, a] = b.dataset.exp.split('|'); $('#mN', d).value = n; $('#mAd', d).value = a; $$('[data-exp]', d).forEach(x => x.classList.toggle('on', x === b)); });
      $$('[data-var]', d).forEach(b => b.onclick = () => { const t = $('#mT', d); if (!t) return; const p = t.selectionStart ?? t.value.length; t.value = t.value.slice(0, p) + b.dataset.var + t.value.slice(p); t.focus(); });
      $$('[data-q]', d).forEach(b => b.onclick = () => { lire(); prog = b.dataset.q === '1'; draw(); });
      const tx = $('#mTxt', d); if (tx) tx.onclick = () => { lire(); mode = 'texte'; draw(); };
      [$('#mVoir', d), $('#mVoir2', d), $('#mAp', d)].forEach(b => { if (b) b.onclick = () => parti && m.resend_id ? openApercu({ resend_id: m.resend_id }) : voir(); });
      const fe = $('#mFerme', d); if (fe) fe.onclick = closeDrawer;
      const an = $('#mAnn', d); if (an) an.onclick = () => {
        const w = dialog('Annuler ce mail ?', `<p style="margin:0 0 4px">« ${esc(m.sujet)} » ne partira pas. Tu pourras le reprogrammer plus tard.</p><div class="mact"><button class="btn" id="aNo">Garder</button><button class="btn primary" id="aOk" style="background:var(--bad);border-color:var(--bad)">Annuler l’envoi</button></div>`);
        $('#aNo', w).onclick = closeApercu;
        $('#aOk', w).onclick = async () => { try { await mFn({ action: 'annuler', id }); closeApercu(); closeDrawer(); toast('Envoi annulé'); refresh(); } catch (e) { toast(errMsg(e)); } };
      };
      const te = $('#mTest', d); if (te) te.onclick = async () => {
        te.disabled = true; te.textContent = 'Envoi du test…';
        try { const r = await mFn(Object.assign(corps(), { action: 'test' })); toast('Test envoyé à ' + r.a); } catch (e) { toast(errMsg(e)); }
        te.disabled = false; te.textContent = 'M’envoyer un test';
      };
      const go = $('#mGo', d); if (go) go.onclick = async () => {
        lire();
        let extra;
        if (prog) { const t = new Date(dt); if (isNaN(t) || t.getTime() < Date.now() + 60e3) return toast('Choisis une date et une heure à venir.'); extra = { envoyer_le: t.toISOString() }; }
        else extra = { maintenant: true };
        const fais = async () => {
          go.disabled = true; go.textContent = prog ? 'Enregistrement…' : 'Envoi…';
          try {
            const r = await mFn(Object.assign(corps(extra), { action: 'enregistrer' }));
            closeApercu(); closeDrawer();
            toast(prog ? 'Programmé · ' + new Date(extra.envoyer_le).toLocaleString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) + (r.contact && r.contact.nouveau ? ' · contact ajouté' : '') : 'Mail envoyé ✅');
            refresh();
          } catch (e) { go.disabled = false; go.textContent = 'Réessayer'; toast(errMsg(e)); }
        };
        if (prog) return fais();
        const w = dialog('Envoyer maintenant ?', `<p style="margin:0 0 4px">« ${esc(m.sujet)} » part tout de suite à <b>${esc(m.a_email)}</b>.</p><div class="mact"><button class="btn" id="cNo">Annuler</button><button class="btn primary" id="cOk">Envoyer</button></div>`);
        $('#cNo', w).onclick = closeApercu; $('#cOk', w).onclick = fais;
      };
    }
    draw();
  }
  window.editerMail = editer;
  function refresh() {
    if (S.page === 'campagnes' && $('#pCamp')) window.renderCampagnes(); else compter();
    const fiche = $('#mFiche'); if (fiche && fiche.dataset.pid) ficheMails(null, { id: +fiche.dataset.pid });
  }

  /* ---------- fiche d'un contact : mails programmés + « Écrire un mail » ---------- */
  async function ficheMails(d, c) {
    const box = $('#mFiche'); if (!box) return;
    box.dataset.pid = c.id;
    try {
      const r = await mFn({ action: 'liste', prospect_id: c.id });
      const L = (r.prevus || []);
      box.innerHTML = L.length ? `<p class="small" style="margin:6px 0 2px;font-weight:700">Programmés</p>` + L.map(ligne).join('') : '';
      lierLignes(box);
    } catch (e) { box.innerHTML = ''; }
  }
  window.ficheMails = ficheMails;

  /* ---------- ⚙️ Automatiques ---------- */
  async function auto(w, force) {
    w.innerHTML = head('⚙️ Automatiques', 'Ils partent tout seuls, sans que tu appuies sur « Envoyer ».')
      + `<section class="csec pcsec"><h3>🌱 Parcours <span class="small mut">une suite de mails après l’inscription ; chaque personne avance à son rythme</span></h3><div class="pcl" id="pcList"><p class="small mut">Chargement…</p></div></section>
         <section class="csec"><h3>🤖 Mails des applis <span class="small mut">envoyés par Malino et PaceApp eux-mêmes</span></h3><div id="auL"><p class="small mut">Chargement…</p></div>
           <p class="small mut" style="margin:6px 0 0">Codes de connexion, rapports aux parents, alertes… Ils se changent dans le code des applis : demande à Claude.</p></section>`;
    if (window.pcListe) window.pcListe($('#pcList', w));
    if (force || !S.camps) { S.camps = await rpc('crm_campagnes_vue'); renderSide(); }
    const L = (S.camps.campagnes || []).filter(c => c.type === 'transactionnel' || c.type === 'interne').sort((a, b) => String(b.dernier || '').localeCompare(String(a.dernier || '')));
    const E = { connexion: '🔑', 'malino-cycle': '📊', 'paceapp-cycle': '📊', interne: '🧪', autre: '📨' };
    $('#auL', w).innerHTML = L.length ? shortList(L, 5, c => `<button class="aucard" data-camp="${esc(c.slug)}"><span class="pe">${E[c.slug] || '📨'}</span><span class="tx"><b>${esc(campShort(c.nom))}</b>
      <span class="sub">${c.nb ? `${fmtN(c.nb)} envoyé${c.nb > 1 ? 's' : ''} · dernier le ${esc(fmtD(c.dernier))}` : 'Rien d’enregistré'}${c.description ? ' · ' + esc(c.description) : ''}</span></span>${chev}</button>`, 'auM') : '<p class="small mut">Aucun.</p>';
    $$('[data-camp]', w).forEach(b => b.onclick = () => openCampagne(b.dataset.camp));
    lier(w);
  }

  /* ---------- 🕘 Historique ---------- */
  const genre = m => { const t = m.campagne && m.campagne.type; return t === 'simple' ? 'simples' : MKT.includes(t) ? 'camp' : 'auto'; };
  async function histo(w) {
    w.innerHTML = head('🕘 Historique', 'Tout ce qui est parti du compte, du plus récent au plus ancien. Touche un mail pour le lire.')
      + `<div class="envf" id="hF"><button class="on" data-f="tous">Tous</button><button data-f="simples">✉️ Mails simples</button><button data-f="camp">📣 Campagnes</button><button data-f="auto">⚙️ Automatiques</button><button data-f="pb">⚠️ Problèmes</button></div>
         <section class="csec"><div id="hL"><p class="small mut">Chargement…</p></div><button class="btn" id="hMore" hidden style="margin-top:6px">Charger plus</button></section>`;
    let items = [], after = null, more = false, f = 'tous';
    const L = $('#hL', w), M = $('#hMore', w);
    const ok = m => f === 'tous' || (f === 'pb' ? /bounced|complained|failed|delivery_delayed/.test(m.statut || '') : genre(m) === f);
    const draw = () => { const v = items.filter(ok); L.innerHTML = v.length ? v.map(envRow).join('') : `<p class="small mut">${more ? 'Rien dans les derniers mails chargés : touche « Charger plus ».' : 'Aucun mail.'}</p>`; envBind(L); M.hidden = !more; };
    const load = async () => {
      M.disabled = true; M.textContent = 'Chargement…';
      try { const r = await envoyesFetch(after); items = items.concat(r.items || []); after = r.after; more = !!r.has_more; draw(); } catch (e) { L.innerHTML = `<p class="small mut">${esc(errMsg(e))}</p>`; }
      M.disabled = false; M.textContent = 'Charger plus';
    };
    $$('[data-f]', w).forEach(b => b.onclick = () => { f = b.dataset.f; $$('[data-f]', w).forEach(x => x.classList.toggle('on', x === b)); draw(); });
    M.onclick = load; await load();
  }

  /* ---------- liens directs : #envois/<onglet>, #mail/nouveau ---------- */
  function suivre() {
    const h = decodeURIComponent(location.hash.slice(1)); const m = h.match(/^(envois|mail)(?:\/(.+))?$/); if (!m) return;
    let n = 0;
    const go = () => {
      if (!S.user || !$('#pCamp')) { if (++n < 60) setTimeout(go, 250); return; }
      try { history.replaceState(null, '', location.pathname); } catch (e) { }
      if (m[1] === 'envois') ouvrir(TABS.some(t => t[0] === m[2]) ? m[2] : 'avenir');
      else { ouvrir('simples'); setTimeout(() => editer(/^\d+$/.test(m[2] || '') ? +m[2] : null), 200); }
    };
    go();
  }
  window.addEventListener('hashchange', suivre);
  suivre();
  (function attendre(k) { if (S.user) return compter(); if (k < 80) setTimeout(() => attendre(k + 1), 300); })(0);
})();
