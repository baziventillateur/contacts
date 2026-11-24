/* Parcours d'accueil : mails automatiques envoyés après l'inscription (fonction crm-parcours),
   liens directs depuis l'admin Malino (#parcours/<slug>, #campagnes/<marque>, #inscrits/malino)
   et filtre par marque sur la page Campagnes. */
(function () {
  const pcFn = body => fnCall('crm-parcours', body);
  const MARQUES = [['', 'Toutes'], ['Malino', 'Malino'], ['PaceApp', 'PaceApp']];
  let MQ = ''; try { MQ = localStorage.getItem('contacts-marque') || ''; } catch (e) { }
  const VARS = ['{prénom}', '{enfant}', '{enfants}', '{niveau}', '{il}', '{Il}', '{le}', '{bloc_progres}', '{bouton}', '[[pas_installe]] '];
  const HEURES = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  const css = document.createElement('style');
  css.textContent = `
  .pcsec .pcl{display:flex;flex-direction:column;gap:6px}
  .pcit{display:flex;align-items:center;gap:10px;width:100%;text-align:left;border:1px solid var(--line);background:linear-gradient(135deg,#F7F4FF,#FFFFFF);border-radius:11px;padding:9px 11px;font:inherit;color:inherit;cursor:pointer}
  .pcit:hover{border-color:var(--acc-line)}.pcit .pe{font-size:20px;width:36px;height:36px;display:grid;place-items:center;border-radius:10px;background:#EEE9FF;flex:none}.pcit .tx{flex:1;min-width:0}
  .pcit .l1{display:flex;align-items:center;gap:6px;min-width:0}.pcit .l1 b{font-size:13.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}.pcit .l1 .pctag{flex:none;margin:0}
  .pcit .l2{display:flex;flex-wrap:wrap;gap:3px 9px;margin-top:3px;font-size:11.5px;color:var(--mut)}.pcit .l2 b{color:var(--ink);font-weight:700}
  .pcit>svg{width:15px;height:15px;stroke:var(--mut2);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:none}
  .pctag{display:inline-block;padding:1px 7px;border-radius:9px;font-size:10.5px;font-weight:700;margin-right:4px}.pctag.on{background:#DCFCE7;color:#15803D}.pctag.off{background:#EEF0F4;color:#6B7280}
  .mqchips{display:flex;gap:5px;flex-wrap:wrap;margin:0 0 8px}.mqchips button{border:1px solid var(--line);background:var(--panel);border-radius:14px;padding:3px 10px;font:600 12px Inter,system-ui,sans-serif;color:var(--mut);cursor:pointer}.mqchips button.on{background:var(--ink);color:#fff;border-color:var(--ink)}
  .pcq{display:inline-block;min-width:74px;text-align:center;padding:2px 6px;border-radius:7px;background:#EEE9FF;color:#4B2FD6;font-size:10.5px;font-weight:700;white-space:nowrap}
  .pccond{display:inline-block;margin-top:2px;padding:0 6px;border-radius:6px;background:#FFF4D6;color:#8A5A00;font-size:10.5px;font-weight:600}
  .pcnums{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.pcnums div{background:var(--panel);border:1px solid var(--line);border-radius:9px;padding:6px 4px;text-align:center}.pcnums b{display:block;font-size:16px}.pcnums span{font-size:10.5px;color:var(--mut)}
  .pcregle{font-size:11.5px;color:var(--mut);line-height:1.45;margin:2px 0 6px}
  .pcfam{display:flex;gap:8px;align-items:flex-start;padding:6px 0;border-top:1px solid var(--line2);font-size:12.5px}.pcfam:first-child{border-top:0}.pcfam .tx{flex:1;min-width:0}.pcfam b{display:block;font-size:12.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pcfam .small{display:block}
  .pcvars{display:flex;gap:4px;flex-wrap:wrap;margin:-2px 0 2px}.pcvars button{border:1px solid var(--line);background:#F7F4FF;color:#4B2FD6;border-radius:6px;padding:1px 6px;font:600 11px ui-monospace,Menlo,monospace;cursor:pointer}
  .pcwhen{display:flex;gap:6px;align-items:center;flex-wrap:wrap;font-size:12.5px;color:var(--ink)}.seqed .pcwhen input,.seqed .pcwhen select{height:32px!important;border:1px solid var(--line);border-radius:7px;padding:0 6px;font-size:13px;background:var(--panel);width:auto!important}.seqed .pcwhen input{width:64px!important}.pcwhen>span{display:inline-flex;gap:6px;align-items:center}.pcwhen>span[hidden]{display:none}
  .pcqui{border:1px solid #FDE68A;background:#FFFBEB;border-radius:9px;padding:8px 10px;font-size:12px;display:flex;flex-direction:column;gap:6px}
  .pcqui .echk{align-items:flex-start;line-height:1.35;font-size:12.5px;cursor:pointer}.pcqui input[type=radio]{width:16px;height:16px;flex:none;margin:1px 0 0;accent-color:var(--acc)}
  .seqed .seact{position:sticky;bottom:-14px;z-index:2;margin:2px -14px -14px;padding:8px 14px 10px;background:var(--panel);border-top:1px solid var(--line2);box-shadow:0 -6px 14px rgba(20,30,60,.06)}
  @media (max-width:899px){
    .seqed .seact{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding-bottom:max(10px,env(safe-area-inset-bottom))}
    .seqed .seact .sp{display:none}.seqed .seact .btn{height:36px;justify-content:center;font-size:13px;width:100%;margin:0}
    #peVoir{order:1}#peTest{order:2}#peDel{order:3}#peOk{order:4}.seqed .seact:not(:has(#peDel)) #peOk{grid-column:1/-1}
    .pcvars{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;padding-bottom:2px;margin-right:-14px;padding-right:14px}.pcvars::-webkit-scrollbar{display:none}.pcvars button{flex:none}
    .seqed textarea#peT{min-height:240px}
  }
  .pcn{flex:none;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;background:#4B2FD6;color:#fff;font-size:11px;font-weight:800;box-shadow:0 2px 4px rgba(75,47,214,.3)}
  .pcst{display:flex;flex-wrap:wrap;gap:3px 5px;margin-top:3px}.pcst i{font-style:normal;font-size:11px;font-weight:600;border-radius:6px;padding:1px 6px;background:#F1F2F6;color:#4B5163;white-space:nowrap}
  .pcst i.e{background:#EEE9FF;color:#4B2FD6}.pcst i.r{background:#DCFCE7;color:#15803D}.pcst i.s{background:#FFF1E6;color:#B45309}.pcst i.v{background:#EAF2FF;color:#1D4ED8}.pcst i.x{background:#FEE2E2;color:#B91C1C}
  .pcleg{font-size:11px;color:var(--mut);line-height:1.45;margin:-2px 0 8px}
  .pcfam .pcet{display:inline-block;font-size:10.5px;font-weight:800;color:#4B2FD6;background:#EEE9FF;border-radius:6px;padding:0 6px;margin-right:4px}
  .pmplan{display:flex;flex-direction:column;gap:4px;margin:4px 0 2px}.pmr{display:flex;align-items:center;gap:8px;font-size:12.5px;padding:5px 8px;border-radius:9px;background:#F7F8FB}.pmr.now{background:#F1ECFF;box-shadow:inset 0 0 0 1.5px #7B5CFF}
  .pmr .tx{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pmr em{font-style:normal;font-size:11px;font-weight:700;color:var(--mut);white-space:nowrap}.pmr.fait em{color:#15803D}.pmr.saute em{color:#9CA3AF}.pmr.fait .tx,.pmr.saute .tx{color:var(--mut)}
  .pmnote{font-size:11.5px;color:#8A5A00;background:#FFF8E6;border-radius:8px;padding:6px 8px;margin:6px 0 0;line-height:1.4}
  .pcimg{width:100%;max-height:120px;object-fit:cover;border-radius:8px;border:1px solid var(--line)}
  .pcaide{font-size:11.5px;color:var(--mut);line-height:1.5;margin:0}.pcaide code{background:#F1F2F6;border-radius:4px;padding:0 4px;font-size:11px}
  `;
  document.head.appendChild(css);

  const quandTxt = e => e.minutes != null ? (e.minutes < 60 ? `+${e.minutes} min` : `+${String(Math.round(e.minutes / 6) / 10).replace('.', ',')} h`) + (e.jour ? ` · J+${e.jour}` : '') : `J+${e.jour} · ${e.heure ?? 18} h 30`;
  const nomP = p => p.nom + (p.marque && !String(p.nom).toLowerCase().includes(String(p.marque).toLowerCase()) ? ' · ' + p.marque : '');
  const dateH = x => x ? new Date(x).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';

  /* ---------- page Campagnes : parcours + filtre par marque ---------- */
  const _render = window.renderCampagnes;
  window.renderCampagnes = async function (force) { const r = await _render.apply(this, arguments); try { decorer(); } catch (e) { console.warn(e); } return r; };
  async function decorer() {
    const P = $('#pCamp'); if (!P) return;
    const w = $('.cwrap', P); if (!w) return;
    // filtre par marque, au-dessus de la grille des campagnes
    const grid = $('.cgrid', w);
    if (grid && !$('.mqchips', w)) {
      const ch = document.createElement('div'); ch.className = 'mqchips';
      ch.innerHTML = MARQUES.map(([k, l]) => `<button data-mq="${esc(k)}" class="${MQ === k ? 'on' : ''}">${esc(l)}</button>`).join('');
      grid.parentNode.insertBefore(ch, grid);
      $$('[data-mq]', ch).forEach(b => b.onclick = () => { MQ = b.dataset.mq; try { localStorage.setItem('contacts-marque', MQ); } catch (e) { } $$('[data-mq]', ch).forEach(x => x.classList.toggle('on', x === b)); filtrer(w); });
      filtrer(w);
    }
  }
  /* liste des parcours (onglet « Automatiques » de l'espace Envois) */
  async function pcListe(L) {
    if (!L) return;
    try {
      const r = await pcFn({ action: 'liste' });
      const lst = r.parcours || [];
      L.innerHTML = lst.length ? lst.map(p => `<button class="pcit" data-pc="${esc(p.slug)}"><span class="pe">🌱</span><span class="tx"><span class="l1"><b>${esc(nomP(p))}</b><span class="pctag ${p.actif ? 'on' : 'off'}">${p.actif ? 'Actif' : 'En pause'}</span></span>
        <span class="l2"><span><b>${p.mails}</b> mail${p.mails > 1 ? 's' : ''}</span><span><b>${fmtN(p.en_cours)}</b> en cours</span><span><b>${fmtN(p.envoyes)}</b> envoyé${p.envoyes > 1 ? 's' : ''}</span><span>v${p.version}</span></span></span>${ico('right')}</button>`).join('')
        : '<p class="small mut">Aucun parcours pour l’instant.</p>';
      $$('[data-pc]', L).forEach(b => b.onclick = () => openParcours(b.dataset.pc));
    } catch (e) { L.innerHTML = `<p class="small mut">${esc(errMsg(e))}</p>`; }
  }
  window.pcListe = pcListe;
  function filtrer(w) {
    $$('.ccard', w).forEach(c => { const m = (($('.cmeta', c) || {}).textContent || ''); c.style.display = !MQ || m.toLowerCase().includes(MQ.toLowerCase()) ? '' : 'none'; });
  }

  // les chiffres d'un mail, en clair
  function chiffres(e) {
    const c = [];
    c.push(e.envoyes ? `<i class="e">✉️ ${fmtN(e.envoyes)} envoyé${e.envoyes > 1 ? 's' : ''}</i>` : '<i>Pas encore envoyé</i>');
    if (e.envoyes && e.recus != null) c.push(`<i class="r">✅ ${fmtN(e.recus)} reçu${e.recus > 1 ? 's' : ''}</i>`);
    if (e.rebonds) c.push(`<i class="x">⚠️ ${fmtN(e.rebonds)} rebond${e.rebonds > 1 ? 's' : ''}</i>`);
    if (e.sautes) c.push(`<i class="s">⏭️ ${fmtN(e.sautes)} sauté${e.sautes > 1 ? 's' : ''} · ${e.saute_pourquoi === 'retard' ? 'inscrits trop tôt' : 'condition non remplie'}</i>`);
    if (e.a_venir) c.push(`<i class="v">⏳ ${fmtN(e.a_venir)} à venir</i>`);
    return `<span class="pcst">${c.join('')}</span>`;
  }
  const quandRel = x => {
    if (!x) return '';
    const d = new Date(x), j = new Date(); j.setHours(0, 0, 0, 0); const k = Math.round((new Date(d).setHours(0, 0, 0, 0) - j) / 864e5);
    const h = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    if (d - Date.now() < 6e5 && d - Date.now() > -6e5) return 'tout de suite';
    return (k === 0 ? 'aujourd’hui' : k === 1 ? 'demain' : d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' })) + ' à ' + h;
  };

  /* ---------- fiche du parcours ---------- */
  async function openParcours(slug, data) {
    let d = $('#drawer');
    if (!d || d.dataset.pc !== slug) {
      d = drawer(`<div class="dhead"><button class="icon bare" id="dX" aria-label="Fermer">${ico('back')}</button><h2>Parcours d’accueil</h2></div><div class="dbody"><p class="empty">Chargement…</p></div>`);
      d.dataset.pc = slug; $('#dX', d).onclick = closeDrawer;
    }
    let q = data;
    if (!q) { try { q = await pcFn({ action: 'lire', parcours: slug }); } catch (e) { $('.dbody', d).innerHTML = `<p class="empty">${esc(errMsg(e))}</p>`; return; } }
    const P = q.parcours, et = q.etapes || [], st = q.stats || {}, envTot = et.reduce((a, e) => a + (e.envoyes || 0), 0);
    const vAnc = (q.versions || []).filter(v => v.version !== P.version && v.en_cours > 0);
    $('.dbody', d).innerHTML = `
      <div class="hero"><span style="font-size:34px">🌱</span><div><h3 style="font-size:16px">${esc(nomP(P))}</h3>
        <div class="small mut">Chaque nouvel inscrit reçoit ces mails un par un, au moment indiqué.</div></div></div>
      <div class="card seqc"><h4>Envoi automatique<label class="sw"><input type="checkbox" id="pcOn" ${P.actif ? 'checked' : ''}><i></i><span>${P.actif ? 'Actif' : 'En pause'}</span></label></h4>
        <p class="pcregle">Jamais plus d’un mail ${esc(P.marque || '')} par jour et par famille (relances et rapports compris) · jamais entre 21 h et 9 h · arrêt sur STOP, désinscription ou rebond · un mail en retard de plus de 4 jours est sauté.${P.depuis ? ` Actif pour les inscrits depuis le ${esc(dateH(P.depuis))}.` : ''}</p>
        <div class="pcnums"><div><b>${fmtN(st.en_cours || 0)}</b><span>en cours</span></div><div><b>${fmtN(st.termines || 0)}</b><span>terminés</span></div><div><b>${fmtN(envTot)}</b><span>envoyés</span></div><div><b>${st.recus == null ? '–' : fmtN(st.recus)}</b><span>reçus</span></div></div></div>
      <div class="card seqc"><h4>Les mails · version ${P.version}<span class="small mut" style="text-transform:none;letter-spacing:0">${q.en_cours_version ? `${pl(q.en_cours_version, 'famille')} sur cette version` : ''}</span></h4>
        <p class="pcleg">Pour chaque mail : <b>envoyés</b> · <b>reçus</b> (arrivés dans la boîte) · <b>sautés</b> (inscrit trop tôt ou condition non remplie) · <b>à venir</b> (familles en cours qui l’attendent encore).</p>
        <div class="sql">${et.map((e, i) => `<button type="button" class="sqr" data-pe="${esc(e.id)}"><span class="pcn">${e.num || i + 1}</span><span class="pcq">${esc(quandTxt(e))}</span><span class="txt"><b>${esc(e.sujet)}</b>
          ${chiffres(e)}${e.condition !== 'toujours' ? `<span class="pccond">${esc((q.conditions || {})[e.condition] || e.condition)}</span>` : ''}</span>${ico('right')}</button>`).join('') || '<p class="small mut">Aucun mail pour l’instant.</p>'}</div>
        <div class="sqbas" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px"><button type="button" class="btn small" id="pcAdd">${ico('plus')}Ajouter un mail</button><button type="button" class="btn small" id="pcTout">${ico('send')}M’envoyer tous les mails en test</button></div>
        ${vAnc.length ? `<p class="small mut" style="margin:8px 0 0">Les familles déjà en cours gardent leur version : ${vAnc.map(v => `version ${v.version} (${pl(v.en_cours, 'famille')})`).join(', ')}.</p>` : ''}</div>
      <div class="card"><h4>Familles</h4><div id="pcFam"><p class="small mut">Chargement…</p></div></div>
      <div class="card"><h4>Écrire un mail</h4><p class="pcaide">Un paragraphe par bloc, séparé par une ligne vide. <code># Titre</code> en première ligne · <code>**gras**</code> · <code>- liste</code> · <code>1. étape</code> (pastilles) · <code>&gt; astuce</code> (encadré) · <code>{bouton}</code> place le bouton · <code>{bloc_progres}</code> carte des progrès · <code>[[pas_installe]]</code> devant un bloc pour l’afficher seulement si la condition est vraie.<br>
        Variables : <code>{prénom}</code> du parent (retiré s’il est inconnu), <code>{enfant}</code>, <code>{enfants}</code>, <code>{niveau}</code>, <code>{il}</code>/<code>{Il}</code> et <code>{le}</code> (il/elle, le/la selon l’enfant).</p></div>`;
    $$('[data-pe]', d).forEach(b => b.onclick = () => openPEtape(slug, q, et.find(e => String(e.id) === b.dataset.pe)));
    $('#pcAdd', d).onclick = () => openPEtape(slug, q, { jour: et.length ? Math.min(365, et[et.length - 1].jour + 5) : 0, heure: 18, condition: 'toujours' });
    $('#pcTout', d).onclick = async () => {
      const b = $('#pcTout', d), o = b.innerHTML; b.disabled = true; b.textContent = 'Envoi…';
      try { const r = await pcFn({ action: 'test_tout', parcours: slug }); toast(`${r.envoyes} mail${r.envoyes > 1 ? 's' : ''} de test envoyé${r.envoyes > 1 ? 's' : ''} à ${r.a}`); } catch (x) { toast(errMsg(x)); }
      b.disabled = false; b.innerHTML = o;
    };
    const on = $('#pcOn', d);
    on.onchange = () => {
      const regler = async (b, msg) => { try { openParcours(slug, await pcFn(Object.assign({ action: 'reglages', parcours: slug }, b))); toast(msg); } catch (e) { on.checked = !on.checked; toast(errMsg(e)); } };
      if (!on.checked) return regler({ actif: false }, 'Parcours en pause');
      if (P.depuis) return regler({ actif: true }, 'Parcours réactivé');
      const w = dialog('Activer le parcours', `<p class="small" style="margin:0">Chaque nouvel inscrit ${esc(P.marque || '')} recevra les ${et.length} mails, un par un, au moment prévu.</p>
        <label class="f">Inclure aussi les inscrits récents<select id="pcInc"><option value="0">Non, seulement les prochains inscrits</option><option value="1">Inscrits depuis 1 jour</option><option value="3">Inscrits depuis 3 jours</option><option value="7">Inscrits depuis 7 jours</option></select></label>
        <p class="small mut" style="margin:0">Les inscrits récents commencent au mail prévu à leur date ; un mail en retard de plus de 4 jours est sauté.</p>
        <div class="mact"><button class="btn" id="pcNo">Annuler</button><button class="btn primary" id="pcGo">Activer</button></div>`);
      const annuler = () => { on.checked = false; closeApercu(); };
      $('#pcNo', w).onclick = annuler; $('#mX', w).onclick = annuler; w.onclick = e => { if (e.target === w) annuler(); };
      $('#pcGo', w).onclick = () => { const n = +$('#pcInc', w).value; closeApercu(); regler({ actif: true, inclure_jours: n }, 'Parcours activé'); };
    };
    familles(slug, d);
  }
  async function familles(slug, d) {
    const box = $('#pcFam', d); if (!box) return;
    try {
      const r = await pcFn({ action: 'familles', parcours: slug });
      const lab = { en_cours: 'en cours', termine: 'terminé', arrete: 'arrêté' };
      const mot = { stop: 'STOP', desabonne: 'désabonné', desinscrit: 'désinscrit', rebond: 'rebond', compte_supprime: 'compte supprimé', retire: 'retiré' };
      const row = f => `<div class="pcfam"><span class="tx"><b>${esc(f.prenom ? f.prenom + ' · ' : '')}${esc(f.email)}</b>
        <span class="small mut">${f.statut === 'en_cours' && f.etape ? `<span class="pcet">Étape ${f.etape}/${f.total}</span>` : ''}${f.envoyes} envoyé${f.envoyes > 1 ? 's' : ''} · ${esc(lab[f.statut] || f.statut)}${f.motif ? ' (' + esc(mot[f.motif] || f.motif) + ')' : ''} · inscrit le ${esc(dateH(f.debut))}</span>
        ${f.prochain ? `<span class="small mut">Prochain : ${f.prochain.num}. ${esc(f.prochain.sujet)} · ${esc(quandRel(f.prochain.quand))}</span>` : ''}</span>
        ${f.modifiable ? `<button class="btn small" data-mod="${esc(f.email)}">${f.statut === 'en_cours' ? 'Modifier' : 'Relancer'}</button>` : ''}</div>`;
      box.innerHTML = r.familles.length ? shortList(r.familles, 8, row, 'pcFamMore') : `<p class="small mut">${r.actif ? 'Personne pour l’instant : les prochains inscrits apparaîtront ici.' : 'Le parcours est en pause : active-le pour que les nouveaux inscrits y entrent.'}</p>`;
      $$('[data-more]', box).forEach(b => b.onclick = () => { $('#' + b.dataset.more).classList.remove('hidden'); b.remove(); });
      $$('[data-mod]', box).forEach(b => b.onclick = () => { const f = r.familles.find(x => x.email === b.dataset.mod); if (f) modifier(slug, d, f, (r.mails || {})[f.version] || []); });
    } catch (e) { box.innerHTML = `<p class="small mut">${esc(errMsg(e))}</p>`; }
  }

  // Faire passer une famille à une autre étape (en avant ou en arrière) : aperçu du nouveau calendrier, puis validation
  function modifier(slug, d, f, mails) {
    const encours = f.statut === 'en_cours';
    const w = dialog(encours ? 'Modifier le parcours' : 'Relancer le parcours', `
      <p class="small" style="margin:0"><b>${esc(f.prenom ? f.prenom + ' · ' : '')}${esc(f.email)}</b><br><span class="mut">${encours ? `Étape ${f.etape}/${f.total}${f.prochain ? ` · prochain : ${esc(quandRel(f.prochain.quand))}` : ''}` : `Parcours ${f.statut === 'termine' ? 'terminé' : 'arrêté'} · ${f.envoyes} mail${f.envoyes > 1 ? 's' : ''} envoyé${f.envoyes > 1 ? 's' : ''}`}</span></p>
      <label class="f">Passer à l’étape<select id="pmE"><option value="">Choisir une étape…</option>${mails.map(m => `<option value="${esc(m.id)}" ${encours && f.etape === m.num ? 'disabled' : ''}>${m.num}. ${esc(m.sujet.length > 38 ? m.sujet.slice(0, 37) + '…' : m.sujet)}${encours && f.etape === m.num ? ' (actuelle)' : ''}</option>`).join('')}</select></label>
      <div id="pmPlan"><p class="small mut" style="margin:0">Choisis l’étape : tu verras le nouveau calendrier avant de valider.</p></div>
      <div class="mact" style="flex-wrap:wrap">${encours ? '<button class="btn danger small" id="pmRet">Retirer du parcours</button><span style="flex:1"></span>' : ''}<button class="btn small" id="pmNo">Annuler</button><button class="btn primary small" id="pmOk" disabled>Valider</button></div>`);
    const sel = $('#pmE', w), ok = $('#pmOk', w), plan = $('#pmPlan', w);
    $('#pmNo', w).onclick = closeApercu;
    sel.onchange = async () => {
      ok.disabled = true; if (!sel.value) return;
      plan.innerHTML = '<p class="small mut" style="margin:0">Calcul du calendrier…</p>';
      try {
        const r = await pcFn({ action: 'deplacer', parcours: slug, email: f.email, etape: Number(sel.value) });
        const lab = x => x.etat === 'envoye' ? '✓ déjà envoyé' : x.etat === 'saute' ? 'passé' : '📩 ' + quandRel(x.quand);
        plan.innerHTML = `<p class="small" style="margin:0 0 4px"><b>Après validation :</b></p><div class="pmplan">${r.plan.map(x => `<div class="pmr ${x.etat === 'envoye' ? 'fait' : x.etat === 'saute' ? 'saute' : ''} ${x.num === r.etape ? 'now' : ''}"><span class="pcn">${x.num}</span><span class="tx">${esc(x.sujet)}</span><em>${esc(lab(x))}</em></div>`).join('')}</div>
          <p class="pmnote">${r.deja_aujourdhui ? 'Un mail est déjà parti aujourd’hui à cette famille : l’étape ' + r.etape + ' partira demain (un mail par jour au maximum). ' : ''}Les mails avec une condition ne partent que si elle est remplie. Jamais entre 21 h et 9 h.</p>`;
        ok.disabled = false;
      } catch (x) { plan.innerHTML = `<p class="small" style="margin:0;color:#B91C1C">${esc(errMsg(x))}</p>`; }
    };
    ok.onclick = async () => {
      const o = ok.innerHTML; ok.disabled = true; ok.textContent = 'Validation…';
      try { await pcFn({ action: 'deplacer', parcours: slug, email: f.email, etape: Number(sel.value), confirmer: true }); closeApercu(); toast(`Famille passée à l’étape ${sel.selectedIndex}`); openParcours(slug); }
      catch (x) { ok.disabled = false; ok.innerHTML = o; toast(errMsg(x)); }
    };
    const ret = $('#pmRet', w);
    if (ret) ret.onclick = async () => {
      if (!ret.dataset.ok) { ret.dataset.ok = '1'; ret.textContent = 'Confirmer le retrait'; return; }
      try { await pcFn({ action: 'retirer', parcours: slug, email: f.email }); closeApercu(); toast('Famille retirée du parcours'); familles(slug, d); } catch (x) { toast(errMsg(x)); }
    };
  }

  /* ---------- écrire ou modifier un mail ---------- */
  function openPEtape(slug, q, e) {
    e = e || { jour: 3, heure: 18, condition: 'toujours' };
    const neuf = !e.id, minutes = e.minutes != null;
    const n = q.en_cours_version || 0;
    const w = dialog(neuf ? 'Nouveau mail' : 'Modifier le mail', `<div class="seqed">
      <div class="f">Quand<div class="pcwhen"><select id="peMode"><option value="min" ${minutes ? 'selected' : ''}>Peu après l’inscription</option><option value="jour" ${minutes ? '' : 'selected'}>Un jour précis</option></select>
        <span id="peMin" ${minutes ? '' : 'hidden'}><input id="peM" type="number" min="0" max="1440" inputmode="numeric" value="${minutes ? e.minutes : 30}"> min après l’inscription</span>
        <span id="peJour" ${minutes ? 'hidden' : ''}>J + <input id="peJ" type="number" min="0" max="365" inputmode="numeric" value="${e.jour || 0}"> à <select id="peH">${HEURES.map(h => `<option value="${h}" ${(e.heure ?? 18) === h ? 'selected' : ''}>${h} h 30</option>`).join('')}</select></span></div></div>
      <label class="f">Envoyer<select id="peC">${Object.entries(q.conditions || { toujours: 'Toujours' }).map(([k, l]) => `<option value="${esc(k)}" ${e.condition === k ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>
      <label class="f">Objet<input id="peS" maxlength="200" value="${esc(e.sujet || '')}" placeholder="ex. 🎁 De vrais cadeaux pour {enfant}"></label>
      <label class="f">Image en haut du mail (lien https, facultatif)<input id="peI" type="url" value="${esc(e.image_url || '')}" placeholder="https://…"></label>
      ${e.image_url ? `<img class="pcimg" src="${esc(e.image_url)}" alt="">` : ''}
      <div class="f">Texte<div class="pcvars">${VARS.map(v => `<button type="button" data-var="${esc(v)}">${esc(v.trim())}</button>`).join('')}</div><textarea id="peT" rows="12">${esc(e.corps || '# Titre\n\nBonjour {prénom},\n\n\n\n{bouton}\n\nÀ bientôt,\nSamy')}</textarea></div>
      <details class="sebt" ${e.bouton_url ? 'open' : ''}><summary>Bouton</summary><div class="sebtg"><label class="f">Texte du bouton<input id="peBt" maxlength="60" value="${esc(e.bouton_texte || '')}" placeholder="ex. Ouvrir Malino"></label>
        <label class="f">Lien<input id="peBu" type="url" value="${esc(e.bouton_url || '')}" placeholder="https://"></label></div></details>
      <label class="f">Aperçu avec les données d’une famille (e-mail, facultatif)<input id="peF" type="email" placeholder="sinon : famille d’exemple (Nael, niveau 4)"></label>
      ${n ? `<div class="pcqui"><b>${pl(n, 'famille')} ${n > 1 ? 'sont' : 'est'} en cours sur cette version. Ce changement s’applique à :</b>
        <label class="echk"><input type="radio" name="peQ" value="nouveaux" checked><span>Seulement les prochains inscrits <span class="mut">(crée la version ${(q.parcours || {}).version + 1})</span></span></label>
        <label class="echk"><input type="radio" name="peQ" value="tous"><span>Aussi les familles déjà en cours</span></label></div>` : ''}
      <div id="peFr" class="efr hidden"></div>
      <div class="mact seact">${neuf ? '' : '<button class="btn danger small" id="peDel">Supprimer</button>'}<span class="sp"></span>
        <button class="btn small" id="peVoir">${ico('eye')}Aperçu</button><button class="btn small" id="peTest">${ico('send')}Me l’envoyer</button><button class="btn primary small" id="peOk">Enregistrer</button></div></div>`);
    const mode = $('#peMode', w);
    mode.onchange = () => { $('#peMin', w).hidden = mode.value !== 'min'; $('#peJour', w).hidden = mode.value === 'min'; };
    const ta = $('#peT', w);
    $$('[data-var]', w).forEach(b => b.onclick = () => { const v = b.dataset.var, a = ta.selectionStart || 0, z = ta.selectionEnd || 0; ta.value = ta.value.slice(0, a) + v + ta.value.slice(z); ta.focus(); ta.setSelectionRange(a + v.length, a + v.length); });
    const brouillon = () => {
      const m = mode.value === 'min';
      return { id: e.id || null, jour: m ? 0 : Number($('#peJ', w).value || 0), minutes: m ? Number($('#peM', w).value || 0) : null, heure: m ? null : Number($('#peH', w).value),
        condition: $('#peC', w).value, sujet: $('#peS', w).value, corps: ta.value, image_url: $('#peI', w).value.trim(), bouton_texte: $('#peBt', w).value, bouton_url: $('#peBu', w).value.trim() };
    };
    const pourTous = () => { const r = $('input[name="peQ"]:checked', w); return !r || r.value === 'tous'; };
    const occupe = (b, t) => { const o = b.innerHTML; b.disabled = true; b.textContent = t; return () => { b.disabled = false; b.innerHTML = o; }; };
    $('#peVoir', w).onclick = async () => {
      const box = $('#peFr', w), fin = occupe($('#peVoir', w), 'Aperçu…');
      try {
        const r = await pcFn({ action: 'apercu', parcours: slug, etape: brouillon(), famille: $('#peF', w).value.trim() });
        box.innerHTML = r.condition_ok === false ? '<p class="small" style="margin:6px">⚠️ Avec ces données, la condition n’est pas remplie : ce mail serait sauté.</p>' : '';
        const f = document.createElement('iframe'); f.className = 'mframe'; f.title = 'Aperçu du mail';
        f.setAttribute('sandbox', 'allow-popups allow-popups-to-escape-sandbox'); f.srcdoc = String(r.html).replace(/<head([^>]*)>/i, '<head$1><base target="_blank">');
        box.appendChild(f); box.classList.remove('hidden'); box.scrollIntoView({ block: 'nearest' });
        if (r.donnees === 'exemple' && $('#peF', w).value.trim()) toast('Famille introuvable : aperçu avec la famille d’exemple');
      } catch (x) { toast(errMsg(x)); }
      fin();
    };
    $('#peTest', w).onclick = async () => {
      const fin = occupe($('#peTest', w), 'Envoi…');
      try { const r = await pcFn({ action: 'test', parcours: slug, etape: brouillon(), famille: $('#peF', w).value.trim() }); toast(`Test envoyé à ${r.a}`); } catch (x) { toast(errMsg(x)); }
      fin();
    };
    $('#peOk', w).onclick = async () => {
      const fin = occupe($('#peOk', w), 'Enregistrement…');
      try { const r = await pcFn({ action: 'etape', parcours: slug, etape: brouillon(), pour_tous: pourTous() }); closeApercu();
        toast(r.parcours.version !== q.parcours.version ? `Enregistré dans la version ${r.parcours.version} (pour les prochains inscrits)` : 'Mail enregistré'); openParcours(slug, r); }
      catch (x) { fin(); toast(errMsg(x)); }
    };
    const del = $('#peDel', w);
    if (del) del.onclick = async () => {
      if (!del.dataset.ok) { del.dataset.ok = '1'; del.textContent = 'Confirmer la suppression'; return; }
      const fin = occupe(del, 'Suppression…');
      try { const r = await pcFn({ action: 'etape_suppr', parcours: slug, id: e.id, pour_tous: pourTous() }); closeApercu(); toast('Mail supprimé'); openParcours(slug, r); }
      catch (x) { fin(); toast(errMsg(x)); }
    };
  }

  /* ---------- liens directs (depuis l'admin Malino) ---------- */
  function suivre() {
    const h = decodeURIComponent(location.hash.slice(1)); if (!h) return;
    const m = h.match(/^(parcours|campagnes|inscrits)(?:\/(.+))?$/); if (!m) return;
    let essais = 0;
    const go = () => {
      if (!S.user || !$('#pCamp')) { if (++essais < 60) setTimeout(go, 250); return; }
      try { history.replaceState(null, '', location.pathname); } catch (e) { }
      if (m[1] === 'parcours') { if (window.ouvrirEnvois) ouvrirEnvois('auto'); else showPage('campagnes'); setTimeout(() => openParcours(m[2] || 'malino-bienvenue'), 200); }
      else if (m[1] === 'campagnes') { const k = MARQUES.find(([x]) => x.toLowerCase() === String(m[2] || '').toLowerCase()); MQ = k ? k[0] : ''; try { localStorage.setItem('contacts-marque', MQ); } catch (e) { } if (window.ouvrirEnvois) ouvrirEnvois('campagnes'); else showPage('campagnes'); }
      else if (m[1] === 'inscrits') { const app = String(m[2] || 'malino').toLowerCase(); goContacts({ tags: [app === 'paceapp' ? 'PaceApp' : 'Malino'], email: 'tous' }); const t = $('#vTitle'); if (t) t.textContent = `Inscrits ${app === 'paceapp' ? 'PaceApp' : 'Malino'}`; }
    };
    go();
  }
  window.addEventListener('hashchange', suivre);
  suivre();
  window.openParcours = openParcours;
})();
