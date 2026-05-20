-- ============================================================
-- NOMAD — Phase 2.6 : Supabase Storage pour les photos
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

-- 1. Créer le bucket public "task-photos"
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-photos', 'task-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Policies Storage
-- Upload : utilisateurs authentifiés seulement
CREATE POLICY "auth_upload_photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'task-photos');

-- Lecture : public (pour afficher les images)
CREATE POLICY "public_read_photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'task-photos');

-- Suppression : authentifiés seulement
CREATE POLICY "auth_delete_photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'task-photos');
