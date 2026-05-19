# NOMAD — Cahier des Charges V1.0
**Application de gestion de chantier mobile**
Document de référence pour le développement avec Claude Code
Version 1.0 — Mai 2026

| | |
|---|---|
| Secteur cible initial | Chantier naval / Refit nautisme |
| Stack technique | Vanilla JS / Supabase / Claude API |
| Statut | MVP existant — V1 production en cours |

---

## 1. Contexte produit

### 1.1 Vision
Nomad est une application de gestion de chantier mobile-first, IA-native, conçue pour les équipes terrain des PME et TPE. Elle permet à un chef de projet de piloter un chantier depuis son PC, et à ses intervenants et opérateurs de saisir, suivre et documenter leurs tâches depuis leur téléphone — sans formation, sans friction.

L'application repose sur trois principes fondateurs :
- **Zéro friction terrain** : la saisie d'information doit prendre moins de 10 secondes sur mobile.
- **IA au service du signal** : Claude analyse les emails et réunions pour en extraire automatiquement des tâches et événements.
- **Adoption par l'usage** : l'interface s'adapte au profil cognitif de l'utilisateur, pas l'inverse.

### 1.2 Positionnement marché
Nomad se positionne sur le segment des outils terrain pour PME/TPE (5 à 50 personnes), aujourd'hui massivement sous-équipées.

| Critère | Concurrents (Procore, Fieldwire) | Nomad |
|---|---|---|
| Prix | 200–500 €/mois | 49–99 €/projet/mois |
| Onboarding | Plusieurs semaines | < 10 minutes |
| IA intégrée | Absente ou marginale | Native (emails, réunions) |
| Profils cognitifs | Non | 4 modes de saisie adaptés |
| Mobile-first | Partiel | Core de l'expérience |
| Nautisme/refit | Non adressé | Marché de lancement |

### 1.3 Marché de lancement
- **Phase 1 (actuelle)** : chantier naval et refit nautisme haut de gamme. Marché de niche à forte valeur, projets de plusieurs mois, équipes pluridisciplinaires (électriciens, charpentiers, mateloteurs, composites...).
- **Phase 2** : généralisation multi-secteurs (bâtiment, agencement, maintenance industrielle, paysagisme, événementiel technique). L'architecture doit anticiper cette extension : terminologie configurable, zones paramétrables, corps de métier adaptables.

---

## 2. Utilisateurs et rôles

### 2.1 Trois niveaux d'accès

| Rôle | Nom interne | Périmètre d'accès | Droits |
|---|---|---|---|
| Admin | `admin` | Tous les projets | Accès total : création, invitation, configuration, suppression, transfert de propriété |
| Intervenant qualifié | `resp` | Projets auxquels il est invité | Tâches, commentaires, photos, fichiers, planning, emails |
| Opérateur | `worker` | Job list et planning qui lui sont assignés | Consultation, commentaires, avancement de ses tâches |

> Tous les niveaux peuvent être modifiés à tout moment par l'admin du projet. Le transfert de propriété (admin → admin) doit être possible en cas de changement de chef de projet.

### 2.2 Gestion des accès par projet
Chaque projet est un espace cloisonné. L'accès se donne via un lien d'invitation généré par l'admin.

- **Lien lecture seule** : accès consultation uniquement
- **Lien modification** : accès selon le rôle assigné (resp ou worker)

L'admin voit tous les projets de son espace. Les autres utilisateurs ne voient que les projets auxquels ils ont été invités.

**Flux d'invitation :**
1. L'admin génère un lien depuis le projet (paramètres > membres)
2. Le lien contient le rôle préassigné et l'identifiant projet
3. Le destinataire crée un compte ou se connecte → accès automatique au projet avec le rôle défini
4. L'admin peut modifier ou révoquer l'accès à tout moment

---

## 3. Profils cognitifs et modes de saisie

### 3.1 Principe
La saisie d'information terrain est le point de friction n°1. Nomad propose 4 modes de saisie, choisis à l'inscription et modifiables à tout moment dans les paramètres.

### 3.2 Les 4 modes

| Mode | Formulation utilisateur | Profil cognitif | Interface adaptée |
|---|---|---|---|
| 📸 Photo | Je prends une photo et j'ajoute un commentaire | Visuel-spatial | Bouton photo en entrée principale, texte en secondaire |
| 🎤 Vocal | Je dicte à voix haute | Vocal-narratif | Microphone en entrée principale, transcription auto, validation rapide |
| ✍️ Rapide | J'écris une phrase courte | Synthétique | Champ unique, parsing NLP, classification automatique |
| 📋 Structuré | Je remplis un formulaire | Verbal-séquentiel | Formulaire complet, champs nommés, progression visible |

> Le mode choisi détermine l'ordre des boutons et le point d'entrée par défaut sur la job list. Ce n'est pas un changement cosmétique — c'est le chemin critique vers la saisie qui change.

### 3.3 Règles d'implémentation
- Le choix du mode est présenté à l'inscription avec les 4 formulations en langage naturel (pas de termes techniques).
- Le mode est modifiable à tout moment dans Paramètres > Mon profil.
- Tous les modes aboutissent au même objet (tâche, commentaire, observation) — seul le chemin d'entrée change.
- Sur desktop, le mode vocal et photo sont disponibles mais moins prioritaires visuellement.

---

## 4. Cycle de vie d'une tâche

### 4.1 Flux standard

| Étape | Statut | Qui agit | Notification push |
|---|---|---|---|
| 1. Création | À faire | Admin ou Intervenant | Non |
| 2. Assignation | Assignée | Admin ou Intervenant | ✅ Oui → destinataire |
| 3. Acceptation / Refus | En attente / Refusée | Opérateur ou Intervenant | ✅ Oui → créateur |
| 4. En cours | En cours | Assigné | Non |
| 5. Soumission vérification | À vérifier | Assigné | ✅ Oui → admin/resp |
| 6. Clôture | Terminée | Admin ou Intervenant | Non |

### 4.2 Règles métier
- Un opérateur ne peut pas créer de tâche — il peut seulement commenter et faire avancer le statut de ses tâches assignées.
- Un intervenant qualifié peut créer, assigner et clôturer des tâches dans son périmètre projet.
- Seul l'admin peut supprimer une tâche définitivement.
- Une tâche refusée revient à l'admin avec le motif de refus en commentaire.
- Les tâches en retard (deadline dépassée, statut non terminé) sont signalées visuellement : bordure rouge, badge dans le compteur.

### 4.3 Attributs d'une tâche

| Attribut | Type | Obligatoire | Notes |
|---|---|---|---|
| id | UUID | Oui | Généré automatiquement |
| nom | Texte | Oui | Titre court de la tâche |
| zone | Liste (configurable) | Oui | Zone du chantier |
| metier | Liste (configurable) | Oui | Corps de métier concerné |
| statut | Enum | Oui | à_faire / assignée / en_cours / à_vérifier / terminée / refusée |
| priorité | Enum | Oui | normale / haute |
| assigné | Référence contact | Non | ID du contact assigné |
| deadline | Date | Non | Date limite d'exécution |
| notes | Texte long | Non | Commentaires et observations |
| photos | Tableau fichiers | Non | Stockage Supabase Storage (pas base64) |
| projet_id | UUID | Oui | Référence au projet parent |
| créé_par | UUID user | Oui | Référence à l'utilisateur créateur |
| créé_le | Timestamp | Oui | Date de création |
| modifié_le | Timestamp | Oui | Dernière modification (pour gestion conflits) |

---

## 5. Fonctionnalités — Priorités de développement

### 5.1 Phase 1 — Corrections critiques (avant tout nouveau développement)

> ⚠️ Ces bugs bloquent la fiabilité en production. Ils doivent être corrigés en premier, avant tout ajout de fonctionnalité.

| # | Bug | Impact | Correction |
|---|---|---|---|
| B1 | Modal m-task : balise ouvrante manquante (ligne 467) | Critique — crash sur navigateurs stricts | Ajouter `<div id='m-task'>` manquante |
| B2 | saveAvancement() : bug logique — historique jamais créé sans note | Majeur — perte de traçabilité | Corriger la comparaison : sauvegarder avant réassignation |
| B3 | Photos en base64 dans localStorage — quota dépassé sans avertissement | Majeur — perte de données silencieuse | Migrer vers Supabase Storage |
| B4 | Clé API Claude exposée côté client | Sécurité — clé récupérable par inspection réseau | Créer une Supabase Edge Function proxy |
| B5 | Gantt inaccessible depuis la navigation | UX — fonctionnalité invisible | Ajouter bouton nav ou accès depuis dashboard |
| B6 | Notification bar hardcodée (contenu statique) | UX — information fausse | Brancher sur les données réelles |
| B7 | Meetings non synchronisés vers Supabase | Données — archive locale uniquement | Ajouter sync table meetings |

### 5.2 Phase 2 — Fonctionnalités V1 production

#### 5.2.1 Système de rôles et accès
- Implémentation des 3 rôles (admin / resp / worker) avec droits différenciés dans l'UI
- Génération de liens d'invitation par projet avec rôle préassigné
- Page d'acceptation d'invitation (création compte ou connexion → accès auto)
- Gestion des membres depuis Paramètres > Projet : liste, modification de rôle, révocation
- Transfert de propriété admin → admin

#### 5.2.2 Profils cognitifs
- Écran de choix du mode à l'inscription (4 options en langage naturel)
- Adaptation du point d'entrée par défaut de la job list selon le mode
- Mode Photo : bouton caméra en premier, champ texte optionnel
- Mode Vocal : bouton micro en premier, transcription auto, validation
- Mode Rapide : champ unique avec parsing NLP
- Mode Structuré : formulaire complet actuel
- Paramètre modifiable dans Profil utilisateur

#### 5.2.3 Cycle de vie des tâches
- Implémentation des 6 statuts avec transitions autorisées par rôle
- Bouton Accepter / Refuser (avec motif) pour l'assigné
- Vue 'À vérifier' dans la job list admin/resp
- Historique des changements de statut (qui, quand, commentaire)

#### 5.2.4 Notifications push
- Activation PWA push notifications via Service Worker
- 3 événements déclencheurs : tâche assignée, tâche acceptée/refusée, tâche soumise à vérification
- Respect de la plage horaire définie dans Paramètres (début / fin)
- Paramètre de plage horaire fonctionnel et persisté (actuellement UI non branchée)

#### 5.2.5 Liaison tâches ↔ projets
- Champ projet_id obligatoire à la création de tâche
- Vue projet : liste des tâches liées avec filtres statut/priorité
- KPIs projet calculés depuis les tâches réelles (pas de valeurs manuelles seules)

#### 5.2.6 Stockage fichiers
- Migration photos vers Supabase Storage (suppression du stockage base64 localStorage)
- Support fichiers attachés aux tâches (PDF, images) — upload et téléchargement
- Limite de taille par fichier : 10 Mo. Limite par tâche : 5 fichiers

### 5.3 Phase 3 — Améliorations ergonomiques

#### 5.3.1 Ergonomie desktop
- Layout 3 colonnes : sidebar navigation (220px) + liste tâches + détail tâche
- Raccourcis clavier pour les actions fréquentes (admin/resp)
- Vue Gantt accessible depuis la navigation principale desktop
- Tableau de bord admin : vue d'ensemble multi-projets avec KPIs

#### 5.3.2 Ergonomie mobile
- Gestes swipe sur les tâches : swipe gauche = changer statut, swipe droit = commenter
- Mode hors-ligne : file d'attente des actions, sync au retour réseau
- Chargement optimisé : skeleton screens, pas de blanc
- Job list : groupement visuel par zone avec compteurs, tri par priorité/deadline

#### 5.3.3 Personnalisation visuelle (par projet)
- Upload logo par l'admin (affiché dans l'en-tête et la PWA)
- Couleur primaire configurable (palette restreinte de 8 couleurs)
- Image de fond optionnelle ou couleur unie
- Scope : au niveau projet (tous les membres voient la même identité visuelle)

---

## 6. Ergonomie et design

### 6.1 Principes directeurs
- **Mobile-first** : chaque écran est conçu pour le pouce, une main, debout sur un chantier.
- **Desktop = même data, meilleure lisibilité** : pas d'outil différent, juste plus d'espace.
- **L'interface s'efface derrière la tâche** : 2 secondes pour trouver, 10 secondes pour saisir.
- **Signal > bruit** : seules les anomalies sont visibles. Ce qui fonctionne est invisible.

### 6.2 Codes couleurs sémantiques (non modifiables)

| Couleur | Signification | Usage |
|---|---|---|
| Amber / Orange | À faire | Statut initial, badge compteur |
| Bleu | En cours | Statut actif, barre de progression |
| Vert | Terminé / Validé | Statut clôturé, confirmation |
| Rouge | Retard / Refus | Deadline dépassée, tâche refusée |
| Gris | Archivé / Inactif | Emails archivés, projets terminés |

> ⚠️ Ces codes couleurs sont fixes et non personnalisables — ils sont sémantiques, pas décoratifs.

### 6.3 Navigation

**Mobile (bottom nav — 6 éléments max)**
1. Job list (icône liste)
2. Agenda (icône calendrier)
3. Emails (icône email + badge non-lus)
4. Réunions (icône micro)
5. Contacts (icône personnes)
6. Projets (icône dossier)

> Le Gantt est accessible depuis le détail projet ou depuis un bouton dans le dashboard admin — pas dans la nav principale (économie d'espace sur mobile).

**Desktop (sidebar fixe 220px)**
- Mêmes 6 éléments + Gantt + Dashboard
- Libellés texte visibles (pas icônes seules)
- Indicateur projet actif en haut de la sidebar

---

## 7. Architecture technique

### 7.1 Stack — Décisions et contraintes

| Composant | Choix | Contrainte / Raison |
|---|---|---|
| Front-end | Vanilla JS — fichier unique index.html | Projet solo non-dev : zéro framework, zéro bundler, déploiement simple |
| Base de données | Supabase (PostgreSQL) | Auth intégrée, SDK JS simple, edge functions disponibles |
| Authentification | Supabase Auth | Email/password, reset, onAuthStateChange — déjà implémenté |
| IA | Claude API (claude-sonnet-4-20250514) | Analyse emails et réunions → extraction tâches/événements |
| Proxy IA | Supabase Edge Function | La clé Claude ne doit jamais être exposée côté client |
| Stockage fichiers | Supabase Storage | Migration depuis base64 localStorage — buckets par projet |
| Notifications push | Web Push API + Service Worker | PWA déjà installable — à brancher sur les 3 événements définis |
| Hébergement | Vercel (actuellement) | Fichier statique, déploiement simple via git push |
| Offline | Service Worker cache + file d'attente | Chantiers avec connectivité partielle |

### 7.2 Supabase Edge Function — Proxy Claude
**Objectif** : isoler la clé API Claude côté serveur.

- Nom de la fonction : `claude-proxy`
- Endpoint : `POST /functions/v1/claude-proxy`
- Payload entrant : `{ messages: [...], system: '...' }`
- La fonction ajoute la clé Claude depuis les variables d'environnement Supabase et retourne la réponse.

> ⚠️ Cette migration est classée B4 (sécurité critique). Elle doit être réalisée avant tout usage en production avec de vrais utilisateurs.

### 7.3 Gestion des conflits de données
**Problème actuel** : si un utilisateur travaille hors-ligne puis se reconnecte, ses modifications locales peuvent être écrasées par Supabase.

**Solution** : ajouter un champ `modifié_le` (timestamp) sur chaque objet. Règle de merge : la version la plus récente gagne. En cas de conflit détecté, afficher un indicateur à l'admin.

### 7.4 Structure des tables Supabase

**Table : projects**
| Colonne | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| nom | text | |
| type | text | |
| client | text | |
| owner_id | uuid | FK auth.users — admin propriétaire |
| statut | text | actif / archivé / terminé |
| avancement | int2 | 0-100 |
| budget | numeric | |
| date_debut | date | |
| date_fin | date | |
| notes | text | |
| logo_url | text | URL Supabase Storage |
| accent_color | text | Hex color |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Table : project_members**
| Colonne | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| project_id | uuid | FK projects |
| user_id | uuid | FK auth.users |
| role | text | admin / resp / worker |
| invited_at | timestamptz | |
| accepted_at | timestamptz | null si invitation en attente |

> ⚠️ Row Level Security (RLS) doit être activée sur toutes les tables. Les policies doivent vérifier que l'utilisateur est membre du projet concerné avec le rôle approprié avant tout accès.

---

## 8. Sécurité

| Point | Statut actuel | Action requise |
|---|---|---|
| Clé API Claude exposée client | 🔴 Non conforme | Créer Supabase Edge Function proxy |
| Row Level Security Supabase | 🟡 Non documenté | Activer RLS sur toutes les tables avec policies par projet |
| Clé Supabase anon exposée | 🟢 Acceptable | Normal pour une anon key — vérifier les policies RLS |
| Validation des inputs | 🟡 Partielle | Sanitiser tous les champs texte libres côté Supabase Functions |
| Gestion des sessions expirées | 🟡 Partielle | Gérer onAuthStateChange pour refresh silencieux |
| Upload fichiers | 🔴 Non implémenté | Valider type MIME et taille côté Supabase Storage policies |

---

## 9. Roadmap de développement

### 9.1 Séquençage recommandé

| Phase | Contenu | Durée estimée | Condition de passage |
|---|---|---|---|
| Phase 1 — Stabilisation | Corrections B1 à B7 (bugs critiques) | 1–2 sessions Claude Code | Zéro bug critique en production |
| Phase 2a — Sécurité | Edge Function proxy Claude + RLS Supabase | 1 session | Clé Claude non exposée + policies actives |
| Phase 2b — Rôles et accès | 3 rôles différenciés + système d'invitation | 2–3 sessions | Onboarding d'un nouvel utilisateur fonctionnel |
| Phase 2c — Profils cognitifs | 4 modes de saisie + adaptation interface | 2 sessions | Test utilisateur terrain sur chaque mode |
| Phase 2d — Cycle de vie tâches | 6 statuts + notifications push + historique | 2 sessions | Flux complet testé de bout en bout |
| Phase 3 — Ergonomie Desktop | 3 colonnes + offline + swipe mobile | 3–4 sessions | Validation usage réel chantier |
| Phase 3b — Personnalisation | Logo + couleurs + fond par projet | 1 session | Après stabilisation complète |

> ⚠️ Priorité absolue : ne pas ajouter de fonctionnalités avant d'avoir corrigé les bugs Phase 1. Un produit fiable avec moins de features vaut plus qu'un produit instable avec plus.

### 9.2 Indicateurs de succès V1
- Onboarding d'un nouveau projet en moins de 10 minutes
- Saisie d'une tâche terrain en moins de 10 secondes (mode vocal ou photo)
- Zéro perte de données entre sessions
- Notifications reçues sur les 3 événements définis, dans la plage horaire
- Accès différencié fonctionnel : un opérateur ne voit pas ce qu'il ne doit pas voir

---

## 10. Instructions pour Claude Code

### 10.1 Contexte de développement
Ce projet est développé par un non-développeur avec l'assistance de Claude Code. Les instructions ci-dessous s'appliquent à chaque session de développement.

- **Stack fixe** : vanilla JS, HTML/CSS pur, un seul fichier index.html. Ne pas proposer de migration vers React, Vue ou tout autre framework.
- **Supabase est le seul backend.** Ne pas proposer d'autres services.
- Chaque modification doit être expliquée en langage non-technique avant d'être implémentée.
- Tester mentalement chaque modification sur mobile (écran 390px) ET desktop (1440px) avant de la proposer.
- Toujours vérifier l'impact sur localStorage ET Supabase quand on modifie une structure de données.

### 10.2 Ordre d'intervention obligatoire
1. Lire ce cahier des charges avant toute session
2. Vérifier dans quelle phase on se trouve (1, 2a, 2b...)
3. Corriger les bugs de la phase actuelle avant d'ajouter des fonctionnalités
4. Valider chaque correction avant de passer à la suivante
5. Mettre à jour ce document si une décision technique majeure change

### 10.3 Patterns à respecter
- **Nommage** : camelCase pour JS, snake_case pour les colonnes Supabase
- **IDs** : toujours des UUID (`crypto.randomUUID()` côté JS)
- **Timestamps** : toujours en ISO 8601 UTC
- **Gestion d'erreurs** : chaque appel Supabase et Claude API dans un try/catch avec message visible pour l'utilisateur
- **Offline first** : toujours écrire dans localStorage en premier, puis sync Supabase async
- **Images/fichiers** : jamais de base64 en localStorage ou Supabase — toujours Supabase Storage

### 10.4 Ce qui ne doit pas changer sans décision explicite
- La structure des 15 modules existants (sc-jobs, sc-agenda, sc-emails, etc.)
- Les 6 éléments de navigation principale
- Les codes couleurs sémantiques (amber=à faire, bleu=en cours, vert=terminé, rouge=retard)
- L'URL Supabase et la configuration Auth
- Le manifest.json et le Service Worker PWA (sauf pour ajouter les push notifications)

---

*— FIN DU CAHIER DES CHARGES —*
*Nomad v1.0 — Document vivant, à mettre à jour à chaque décision structurante*
