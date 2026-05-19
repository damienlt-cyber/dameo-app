# Nomad — Instructions pour Claude Code

## Lire en premier
Consulte **SPECS.md** avant toute session. Il contient le cahier des charges complet : vision, rôles, fonctionnalités, architecture, roadmap.

## Projet en un mot
Application web de gestion de chantier naval (Nomade 7), vanilla JS pur, fichier unique `index.html`, Supabase backend, Claude API pour l'analyse IA. Déployé sur Vercel : https://dameo-app.vercel.app

## Stack — ne jamais changer
- **Front** : HTML/CSS/JS vanilla, fichier unique `index.html`, aucun framework
- **Backend** : Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **IA** : Claude API via proxy Supabase Edge Function (B4 à implémenter)
- **Hébergement** : Vercel (déploiement via `vercel --prod` après `git push`)

## Où on en est — Phase 2b en cours

| Élément | Statut |
|---------|--------|
| B1 — Modal m-task balise manquante | ✅ Corrigé |
| B2 — saveAvancement() bug logique | ✅ Corrigé |
| B3 — Photos base64 localStorage | ⬜ Phase 2.6 (Supabase Storage) |
| **Phase 2a — RLS Supabase** | ✅ Activé sur 7 tables (authenticated only) |
| B4 — Clé API Claude exposée | ✅ Corrigé (Edge Function claude-proxy déployée) |
| B5 — Gantt inaccessible nav | ✅ Corrigé (sidebar desktop) |
| B6 — Notification bar hardcodée | ✅ Corrigé (données réelles) |
| B7 — Meetings non sync Supabase | ✅ Corrigé (table créée + sync/fetch) |
| **Phase 2b — Rôles & invitations** | ✅ Code JS prêt — SQL à exécuter dans Supabase |

### Phase 2b — Tables à créer (SQL dans supabase/rls_phase2b.sql)
- `user_profiles` (id, name, role, metier, phone, created_at)
- `invitations` (id, token, role, created_by, used_by, created_at, expires_at)

### Vars globales ajoutées
- `curRole` / `curUserId` / `curUserName` — état de l'utilisateur connecté
- `_inviteToken` / `_inviteRole` — détection lien d'invitation dans l'URL

### Fonctions ajoutées
- `loadUserProfile()` — charge profil après connexion, crée si absent (1er user = admin)
- `applyRoleUI()` — badge rôle dans Settings
- `genInvite(role)` — génère un lien d'invitation (admin only), copie dans presse-papiers
- `rMembers()` — liste des membres depuis user_profiles
- `updateMemberRole(userId, role)` — change le rôle d'un membre (admin only)
- `showToast(msg)` — notification toast légère

## Déploiement
```
git add index.html
git commit -m "description"
git push
vercel --prod
```

## Supabase
- URL : `https://owkavqtcmrenazfatbny.supabase.co`
- Tables existantes : tasks, contacts, events, emails, projets, metiers, meetings
- Tables Phase 2b à créer : user_profiles, invitations (SQL dans supabase/rls_phase2b.sql)
- RLS : activée sur toutes les tables (Phase 2a)
