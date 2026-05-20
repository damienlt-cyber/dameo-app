-- ============================================================
-- NOMAD — Phase 2.4 : Push Notifications (table subscriptions)
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription jsonb NOT NULL,
  created_at   timestamptz DEFAULT now(),
  UNIQUE (user_id)
);
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Chaque utilisateur gère sa propre subscription
CREATE POLICY "own_push_sub"
  ON push_subscriptions FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
