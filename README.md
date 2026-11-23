# Contacts

Carnet de contacts et prospects centralisé, installable sur téléphone (PWA).

- Données : Supabase, projet Malino, espace `crm` (table `crm.prospects`), accessible uniquement aux admins via les fonctions `crm_*`.
- Connexion : code reçu par e-mail (même compte admin que Malino).
- Hébergement : GitHub Pages, fichiers statiques (`index.html`, `app.js`, `app.css`), sans étape de build.

Fonctions : recherche instantanée, vue tableau (ordinateur) et liste (téléphone), favoris, vues enregistrées,
filtres (origine, statut, profil, secteur, étiquettes, zone), sélection multiple et actions groupées,
fiche modifiable, ajout de contacts, export CSV.

## v1.1.0
- Logo (cartes empilées + pastille @), icônes maskable et Apple.
- Proposition d'installation (Android/ordinateur : bouton ; iPhone : consigne Partager → Sur l'écran d'accueil).
- Cloche de notifications (`crm_notifs`, `crm_notifs_lues`) et notifications push (fonction `contacts-push`, clés VAPID en base, même principe que CovoitGo).
- Ajout par photo : lecture des e-mails sur l'appareil (Tesseract.js), un ou plusieurs contacts d'un coup.
- Import Google Contacts / vCard : seuls les contacts avec e-mail, doublons fusionnés (`crm_ajouter`).
- Badges Malino, PaceApp, Pro, Particulier, École dans la liste.

## v1.12.0
- Liens d'inscription (menu « Liens d'inscription », ou « Liens » sur téléphone) : pour chaque lien, sujet, message, marque (Samy, PaceApp, Malino, Vacances Muslims), étiquettes (création possible), statut, type, secteur, origine et note interne. Fonctions `crm_liens_inscription`, `crm_lien_inscription_enregistrer`, `crm_lien_inscription_actif`, `crm_lien_inscrits` ; tables `crm.liens_inscription` et `crm.inscriptions`.
- Page publique `inscription.html?l=<code>` : prénom, e-mail, commentaire, puis code à 6 chiffres reçu par e-mail (fonction `crm-inscription`, expéditeur selon la marque, code valable 30 min, 5 essais, limites anti-abus). Une fois confirmé, la personne est ajoutée (ou fusionnée) dans `crm.prospects` avec les réglages du lien, et une notification arrive dans l'appli.
- Le commentaire de l'inscrit est rangé dans `commentaire_inscrit` (carte « Commentaire de l'inscrit » sur la fiche), à part des notes internes.
- Statut « Inscrit » ajouté, notification « Nouvel inscrit » (réglable comme les autres événements) ; bouton « Sheet » dans la barre du haut (copie de suivi, la base de Contacts fait foi).
