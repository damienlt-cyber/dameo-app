-- ============================================================
-- NOMAD — Bannette email : token unique par utilisateur
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

-- 1. Ajouter la colonne inbox_token sur user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS inbox_token text UNIQUE DEFAULT gen_random_uuid()::text;

-- 2. Générer un token pour les utilisateurs existants qui n'en ont pas
UPDATE user_profiles
  SET inbox_token = gen_random_uuid()::text
  WHERE inbox_token IS NULL;

-- 3. Index pour la recherche rapide par token (webhook)
CREATE INDEX IF NOT EXISTS idx_user_profiles_inbox_token
  ON user_profiles (inbox_token);
