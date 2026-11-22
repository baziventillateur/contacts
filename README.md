# Contacts

Carnet de contacts et prospects centralisé, installable sur téléphone (PWA).

- Données : Supabase, projet Malino, espace `crm` (table `crm.prospects`), accessible uniquement aux admins via les fonctions `crm_*`.
- Connexion : code reçu par e-mail (même compte admin que Malino).
- Hébergement : GitHub Pages, fichiers statiques (`index.html`, `app.js`, `app.css`), sans étape de build.

Fonctions : recherche instantanée, vue tableau (ordinateur) et liste (téléphone), favoris, vues enregistrées,
filtres (origine, statut, profil, secteur, étiquettes, zone), sélection multiple et actions groupées,
fiche modifiable, ajout de contacts, export CSV.
