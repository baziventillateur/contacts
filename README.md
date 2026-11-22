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
