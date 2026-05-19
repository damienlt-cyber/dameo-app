-- ============================================================
-- NOMAD — Phase 2a : Activation RLS sur toutes les tables
-- À exécuter dans Supabase > SQL Editor
-- ============================================================
-- Effet : seuls les utilisateurs authentifiés (connectés) peuvent
-- lire et modifier les données. Les anonymes n'ont plus accès.
-- Phase 2b ajoutera des restrictions par projet (project_members).
-- ============================================================

-- 1. Activer RLS sur chaque table
ALTER TABLE tasks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails   ENABLE ROW LEVEL SECURITY;
ALTER TABLE projets  ENABLE ROW LEVEL SECURITY;
ALTER TABLE metiers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- 2. Policies : utilisateurs authentifiés = accès complet
-- (Phase 2b restreindra par projet via project_members)

CREATE POLICY "auth_all_tasks"    ON tasks    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_contacts" ON contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_events"   ON events   FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_emails"   ON emails   FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_projets"  ON projets  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_metiers"  ON metiers  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_meetings" ON meetings FOR ALL TO authenticated USING (true) WITH CHECK (true);
