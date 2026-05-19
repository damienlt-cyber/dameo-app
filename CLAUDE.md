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

## Où on en est — Phase 1 (bugs critiques)
Voir SPECS.md section 5.1. Bugs B1 à B7 à corriger avant tout nouveau développement.

| Bug | Statut |
|-----|--------|
| B1 — Modal m-task balise manquante | ✅ Corrigé |
| B2 — saveAvancement() bug logique | ✅ Corrigé |
| B3 — Photos base64 localStorage | ⬜ À faire (migrer vers Supabase Storage) |
| B4 — Clé API Claude exposée | ✅ Corrigé (Edge Function claude-proxy déployée) |
| B5 — Gantt inaccessible nav | ✅ Corrigé (sidebar desktop) |
| B6 — Notification bar hardcodée | ✅ Corrigé (données réelles) |
| B7 — Meetings non sync Supabase | ✅ Corrigé (table créée + sync/fetch) |

## Déploiement
```
git add index.html
git commit -m "description"
git push
vercel --prod
```

## Supabase
- URL : `https://owkavqtcmrenazfatbny.supabase.co`
- Tables existantes : tasks, contacts, events, emails, projets, metiers
- Table manquante : meetings (B7)
- RLS : non activée (à faire en Phase 2a)
