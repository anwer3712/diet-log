# Journal de Soins Sunshine / Sunshine Care Log

> Un outil de suivi gratuit et open source pour les soins quotidiens des patients âgés — conçu pour les aidants familiaux.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live-Demo-rose)](https://anwer3712.github.io/diet-log/)

---

## Qu'est-ce que c'est ?

Une application web bilingue (Chinois traditionnel 🇹🇼 / Indonésien 🇮🇩) conçue pour aider les **aidants familiaux** à suivre les données quotidiennes de santé des patients âgés à domicile — en particulier ceux souffrant de conditions chroniques nécessitant une gestion stricte des liquides (insuffisance cardiaque, dialyse, récupération post-chirurgicale).

Aucune installation requise. Fonctionne sur n'importe quel navigateur de smartphone. Les données se synchronisent avec Google Sheets via Google Apps Script.

---

## Fonctionnalités

- **Suivi de l'apport en liquides** — eau, boissons médicales, suppléments nutritionnels, repas (avec objectif quotidien et barre de progression)
- **Suivi de la production de liquides** — volume d'urine + couleur, selles avec état
- **Algorithme intelligent de cible d'urine** — calcule automatiquement la production d'urine attendue selon l'objectif d'apport en eau, ajusté pour les médicaments diurétiques (plage ×1,1–1,5) vs. pas de médicament (plage ×0,4–0,6)
- **Avertissement de surcharge liquidienne** — alerte rouge lorsque l'apport total dépasse 1 200 c.c.
- **Enregistrement de l'exercice** — levage de bouteilles, appuis-pieds, flexions des genoux, aide au levage (avec liste de contrôle du protocole de sécurité)
- **Tension artérielle et fréquence cardiaque** — mesures du matin et du soir avec directives de mesure
- **Système d'alerte de constipation** — se déclenche automatiquement toutes les 2 heures entre 60–72 heures après la dernière selle, avec instructions de sécurité bilingues interdisant l'utilisation d'enema sans surveillance
- **Suivi de l'état des médicaments** — diurétiques et laxatifs, persistant dans le cloud
- **Système de rappel basé sur l'heure** — rappels intelligents pour la mesure de la PA, les créneaux d'exercice et la vérification de l'urine avant le coucher
- **Synchronisation cloud** — toutes les données enregistrées dans Google Sheets via Google Apps Script; prend en charge les ménages à plusieurs aidants
- **Interface optimiste** — les enregistrements apparaissent instantanément sans attendre la réponse du serveur
- **Rappels de nettoyage hebdomadaires** — calendrier intégré pour les tâches d'hygiène domestique

---

## À qui s'adresse cet outil ?

- Membres de la famille prenant soin de parents ou grands-parents âgés à domicile
- Ménages avec plusieurs aidants en rotation (en particulier à travers les barrières linguistiques)
- Patients nécessitant une surveillance liquidienne stricte (insuffisance cardiaque, dialyse, récupération post-chirurgicale)

---

## Pile technologique

| Couche | Technologie |
|-------|-----------|
| Frontend | HTML + JavaScript + Tailwind CSS vanille |
| Backend | Google Apps Script (sans serveur) |
| Base de données | Google Sheets |
| Hébergement | GitHub Pages (gratuit) |

Sans frameworks. Sans outils de construction. Aucune dépendance à installer. S'ouvre directement dans n'importe quel navigateur.

---

## Configuration / Auto-hébergement

1. Forker ce référentiel
2. Déployer votre propre backend Google Apps Script (voir `GAS_URL` dans `index.html`)
3. Créer une feuille Google pour le stockage des données
4. Mettre à jour les constantes `GAS_URL` et `SPREADSHEET_URL` dans `index.html`
5. Activer GitHub Pages sur votre fork → terminer

---

## Captures d'écran

| Suivi quotidien | Saisie bilingue guidée | Analyse des tendances |
|---|---|---|
| Journal des soins quotidiens : bande de progression, objectif d'apport liquidien avec barre de progression, sélection des catégories eau/médicaments/nutrition/repas | Écran de saisie guidée affichant les instructions en chinois traditionnel et indonésien côte à côte, avec étapes numérotées | Page d'analyse des tendances de santé avec sélecteur de plage 7/14/30 jours et quinze graphiques de variables croisées sélectionnables |
| Bande de progression, objectif liquidien et enregistrement des catégories | Chaque chaîne en chinois traditionnel et indonésien, étape par étape | 15 graphiques de variables croisées (7/14/30 jours) |

*（Démo en direct : https://anwer3712.github.io/diet-log/ — captures d'écran prises sur un port d'affichage téléphonique 414×896）*

---

## Motivation

Construit par nécessité. Lorsqu'un membre de la famille avait besoin de soins à domicile 24/7 avec une gestion stricte des liquides, les applications existantes étaient soit trop complexes, en anglais uniquement, soit nécessitaient un abonnement mensuel. Cet outil vise à fournir une solution simple, gratuite et multilingue pour que les aidants puissent se concentrer sur le patient, pas sur l'application.

---

## Feuille de route

Améliorations prévues — chacune est un problème ouvert, les commentaires de la communauté sont les bienvenus :

- [ ] [#15](https://github.com/anwer3712/diet-log/issues/15) **Analyse de santé assistée par IA** — intégrer Claude pour détecter les tendances anormales dans les données d'apport liquidien, de production d'urine et de tension artérielle, et traduire les chiffres bruts en conseils de soins en langage clair
- [ ] [#16](https://github.com/anwer3712/diet-log/issues/16) **Questions et réponses des aidants par IA** — permettre aux aidants de poser des questions dans leur propre langue (« son urine était foncée aujourd'hui, devrais-je m'inquiéter ? ») sur la base des données réellement enregistrées du patient
- [ ] [#17](https://github.com/anwer3712/diet-log/issues/17) **Paires de langues supplémentaires** — anglais, vietnamien, tagalog, thaï pour les ménages de soins multiculturelsǹ
- [ ] [#18](https://github.com/anwer3712/diet-log/issues/18) **Mode hors ligne** — mise en cache du travailleur de service pour les connexions instables
- [ ] [#19](https://github.com/anwer3712/diet-log/issues/19) **Rapports hebdomadaires imprimables** — résumés d'une page pour les visites médicales
- [ ] [#20](https://github.com/anwer3712/diet-log/issues/20) **Support multi-patients** — pour les ménages ou petits établissements de soins suivant plus d'une personne

---

## Contribution

Les demandes de fusion sont les bienvenues — voir [CONTRIBUTING.md](CONTRIBUTING.md) pour savoir comment aider (les contributions de traduction sont particulièrement appréciées). Ce projet suit un [Code de conduite](CODE_OF_CONDUCT.md).

Si vous prenez soin d'un membre de la famille âgé et avez besoin d'une fonction — [ouvrez un problème](https://github.com/anwer3712/diet-log/issues).

---

## Sécurité

Vous avez trouvé une vulnérabilité ? Veuillez la signaler en privé — voir [SECURITY.md](SECURITY.md).
N'ouvrez pas de problème public et n'incluez jamais de données réelles de patients dans un rapport.

---

## Licence

MIT © 2026 anwer3712
