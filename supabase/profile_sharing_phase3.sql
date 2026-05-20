-- ============================================================
-- NOMAD — Phase 3 : Profil étendu + Partage projets + Boîte mail
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

-- 1. Colonnes supplémentaires sur user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS avatar_url  text,
  ADD COLUMN IF NOT EXISTS logo_url    text,
  ADD COLUMN IF NOT EXISTS notif_start text DEFAULT '07:30',
  ADD COLUMN IF NOT EXISTS notif_end   text DEFAULT '18:00';

-- 2. Bucket "avatars" (photos profil + logos chantier)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policies bucket avatars
CREATE POLICY "auth_upload_avatars"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "public_read_avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "auth_update_avatars"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "auth_delete_avatars"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars');

-- 3. Colonne shared_with sur projets (tableau de user_ids)
ALTER TABLE projets ADD COLUMN IF NOT EXISTS shared_with jsonb DEFAULT '[]';

-- 4. Table emails_inbox — emails reçus via webhook
CREATE TABLE IF NOT EXISTS emails_inbox (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  from_addr   text        NOT NULL,
  subject     text        NOT NULL,
  body        text        NOT NULL,
  received_at timestamptz DEFAULT now(),
  processed   boolean     DEFAULT false
);
ALTER TABLE emails_inbox ENABLE ROW LEVEL SECURITY;

-- L'utilisateur voit ses propres emails
CREATE POLICY "own_inbox"
  ON emails_inbox FOR ALL TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Le service role peut insérer depuis le webhook
CREATE POLICY "service_insert_inbox"
  ON emails_inbox FOR INSERT
  USING (true);
