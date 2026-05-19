-- ============================================================
-- NOMAD — Phase 2b : Profils utilisateurs + Invitations
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

-- 1. TABLE user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL DEFAULT '',
  role       text NOT NULL DEFAULT 'worker' CHECK (role IN ('admin','resp','worker')),
  metier     text DEFAULT '',
  phone      text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Tout utilisateur authentifié peut lire tous les profils
CREATE POLICY "profiles_select"
  ON user_profiles FOR SELECT TO authenticated USING (true);

-- Chaque utilisateur peut créer/modifier son propre profil
CREATE POLICY "profiles_own"
  ON user_profiles FOR ALL TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Un admin peut modifier le rôle de n'importe quel profil
-- (Phase 2c ajoutera une vérification server-side via RLS function)
CREATE POLICY "profiles_admin_write"
  ON user_profiles FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

-- 2. TABLE invitations
CREATE TABLE IF NOT EXISTS invitations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token       text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(20), 'hex'),
  role        text NOT NULL DEFAULT 'worker' CHECK (role IN ('admin','resp','worker')),
  created_by  uuid REFERENCES auth.users(id),
  used_by     uuid REFERENCES auth.users(id),
  created_at  timestamptz DEFAULT now(),
  expires_at  timestamptz DEFAULT now() + interval '7 days'
);
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Lecture publique (anon + authenticated) pour vérifier un token avant inscription
CREATE POLICY "invitations_read"
  ON invitations FOR SELECT USING (true);

-- Seuls les authentifiés peuvent créer/modifier des invitations
CREATE POLICY "invitations_write"
  ON invitations FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "invitations_update"
  ON invitations FOR UPDATE TO authenticated USING (true);
