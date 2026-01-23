-- ========================================
-- Subscriptions & Usage Tracking Tables
-- ========================================

-- 1. Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Plan details
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'pro')),
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),

  -- Stripe integration
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,

  -- Billing dates
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure one subscription per user
  UNIQUE(user_id)
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- RLS policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
ON subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
ON subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON subscriptions FOR UPDATE
USING (auth.uid() = user_id);


-- 2. Usage tracking table
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Operation type
  operation_type TEXT NOT NULL CHECK (operation_type IN (
    'article_analysis',
    'pdf_analysis',
    'quiz_generation',
    'chat_message',
    'brain_merge',
    'learning_action_generation'
  )),

  -- Token usage
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,

  -- Cost estimation (in cents)
  estimated_cost_cents INTEGER DEFAULT 0,

  -- Metadata
  resource_id UUID, -- ID of article/document/etc

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_user_created ON usage_logs(user_id, created_at DESC);
CREATE INDEX idx_usage_logs_operation ON usage_logs(operation_type);

-- RLS policies
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage"
ON usage_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert usage logs"
ON usage_logs FOR INSERT
WITH CHECK (true); -- Backend will handle this


-- 3. Usage summary view (for quick monthly stats)
CREATE OR REPLACE VIEW usage_summary AS
SELECT
  user_id,
  DATE_TRUNC('month', created_at) as month,
  operation_type,
  COUNT(*) as operation_count,
  SUM(input_tokens) as total_input_tokens,
  SUM(output_tokens) as total_output_tokens,
  SUM(estimated_cost_cents) as total_cost_cents
FROM usage_logs
GROUP BY user_id, DATE_TRUNC('month', created_at), operation_type;


-- 4. Function to get current month usage for a user
CREATE OR REPLACE FUNCTION get_current_month_usage(p_user_id UUID)
RETURNS TABLE (
  total_operations BIGINT,
  total_cost_cents BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_operations,
    COALESCE(SUM(estimated_cost_cents), 0)::BIGINT as total_cost_cents
  FROM usage_logs
  WHERE user_id = p_user_id
    AND created_at >= DATE_TRUNC('month', CURRENT_TIMESTAMP)
    AND created_at < DATE_TRUNC('month', CURRENT_TIMESTAMP) + INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. Function to check if user can perform operation
CREATE OR REPLACE FUNCTION can_user_perform_operation(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan_type TEXT;
  v_operation_count BIGINT;
BEGIN
  -- Get user's plan type
  SELECT plan_type INTO v_plan_type
  FROM subscriptions
  WHERE user_id = p_user_id AND status = 'active';

  -- If no subscription found, assume free plan
  IF v_plan_type IS NULL THEN
    v_plan_type := 'free';
  END IF;

  -- Pro users have unlimited operations
  IF v_plan_type = 'pro' THEN
    RETURN TRUE;
  END IF;

  -- Free users: check monthly limit (10 operations)
  SELECT total_operations INTO v_operation_count
  FROM get_current_month_usage(p_user_id);

  RETURN v_operation_count < 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 6. Trigger to update subscriptions.updated_at
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 7. Initialize Free plan for existing users
INSERT INTO subscriptions (user_id, plan_type, status)
SELECT id, 'free', 'active'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM subscriptions)
ON CONFLICT (user_id) DO NOTHING;
