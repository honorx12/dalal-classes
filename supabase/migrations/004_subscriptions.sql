-- 004_subscriptions.sql
-- Subscription foundation for the SaaS pivot.
-- Adds `plans` (public catalog) + `subscriptions` (per-user). No existing table
-- is altered, so enrollment/progress/quiz/certificate flows are unaffected.
--
-- FUTURE PHASE (multi-tenant / "academies") — documented, NOT implemented here:
--   tenants(id, slug, name, owner_id, branding jsonb)
--   courses.tenant_id, profiles.default_tenant_id
--   plans.tenant_id becomes an FK; subscriptions scoped via a membership table.
-- The nullable tenant_id columns below are placeholders so that phase is additive.

-- ============ plans ============
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,                 -- 'free' | 'pro'
  name TEXT NOT NULL,
  description TEXT,
  price_monthly INTEGER NOT NULL DEFAULT 0,  -- in paise (INR minor unit)
  price_yearly INTEGER NOT NULL DEFAULT 0,   -- in paise
  features JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  tenant_id UUID,                            -- forward-compat, unused now
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ subscriptions ============
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly'
    CHECK (billing_cycle IN ('monthly', 'yearly')),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  razorpay_subscription_id TEXT,             -- filled by the payment worker later
  tenant_id UUID,                            -- forward-compat, unused now
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, plan_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);

-- ============ RLS ============
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active plans" ON plans;
CREATE POLICY "Anyone can view active plans" ON plans
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT/UPDATE for the authenticated role is intentionally omitted:
-- subscription writes happen only via the service-role payment worker,
-- matching the pattern in workers/verify-payment.js.

-- ============ seed platform plans ============
INSERT INTO plans (slug, name, description, price_monthly, price_yearly, features) VALUES
  ('free', 'Free', 'Everything you need to start learning', 0, 0,
    '["All free courses","Community discussions","Progress tracking","Quizzes & self-assessment"]'),
  ('pro', 'Pro', 'Full access for serious learners', 49900, 478800,
    '["Everything in Free","All Pro courses","Verified certificates","Downloadable PDF materials","Priority support","Early access to new courses"]')
ON CONFLICT (slug) DO NOTHING;
