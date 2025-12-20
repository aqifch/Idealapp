-- Create is_admin function if it doesn't exist
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = user_id 
    AND (raw_user_meta_data->>'role' = 'admin' OR raw_user_meta_data->>'role' = 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create notification_automations table
CREATE TABLE IF NOT EXISTS public.notification_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN (
    'order_placed', 'order_status_changed', 'order_confirmed', 
    'order_preparing', 'order_ready', 'order_completed', 
    'order_cancelled', 'product_added', 'product_updated', 
    'product_deleted', 'deal_started', 'deal_ended', 
    'product_low_stock', 'user_registered', 'user_login', 'custom_event'
  )),
  conditions JSONB DEFAULT '{}',
  template_id TEXT,
  notification_data JSONB NOT NULL DEFAULT '{}',
  target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'user', 'admin', 'segment', 'specific')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create notification_campaigns table
CREATE TABLE IF NOT EXISTS public.notification_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'promo' CHECK (type IN ('promo', 'announcement', 'seasonal', 'product_launch', 'deal_alert')),
  target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'segment', 'specific')),
  audience_segment JSONB DEFAULT '{}',
  schedule_type TEXT NOT NULL DEFAULT 'immediate' CHECK (schedule_type IN ('immediate', 'scheduled', 'recurring')),
  scheduled_at TIMESTAMPTZ,
  recurrence_pattern JSONB DEFAULT '{}',
  notification_data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'completed', 'cancelled')),
  sent_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create notification_templates table
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'order' CHECK (type IN ('order', 'promo', 'reward', 'delivery', 'system', 'marketing')),
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  image_url TEXT,
  action_url TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notification_automations_trigger_type ON public.notification_automations(trigger_type);
CREATE INDEX IF NOT EXISTS idx_notification_automations_is_active ON public.notification_automations(is_active);
CREATE INDEX IF NOT EXISTS idx_notification_automations_created_at ON public.notification_automations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_campaigns_status ON public.notification_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_notification_campaigns_schedule_type ON public.notification_campaigns(schedule_type);
CREATE INDEX IF NOT EXISTS idx_notification_campaigns_created_at ON public.notification_campaigns(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON public.notification_templates(type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_is_default ON public.notification_templates(is_default);
CREATE INDEX IF NOT EXISTS idx_notification_templates_created_at ON public.notification_templates(created_at DESC);

-- Create updated_at triggers
CREATE TRIGGER update_notification_automations_updated_at
  BEFORE UPDATE ON public.notification_automations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_campaigns_updated_at
  BEFORE UPDATE ON public.notification_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON public.notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Disable Row Level Security (like notifications table - allows anonymous access)
-- RLS is disabled to allow guest users to read data
-- ALTER TABLE public.notification_automations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.notification_campaigns ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_automations
-- Allow all reads (similar to notifications table)
DROP POLICY IF EXISTS "Automations are viewable by authenticated users" ON public.notification_automations;
CREATE POLICY "Automations are viewable by authenticated users" ON public.notification_automations
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Automations are creatable by authenticated users" ON public.notification_automations;
CREATE POLICY "Automations are creatable by authenticated users" ON public.notification_automations
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Automations are updatable by authenticated users" ON public.notification_automations;
CREATE POLICY "Automations are updatable by authenticated users" ON public.notification_automations
FOR UPDATE USING (auth.role() = 'authenticated' OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Automations are deletable by authenticated users" ON public.notification_automations;
CREATE POLICY "Automations are deletable by authenticated users" ON public.notification_automations
FOR DELETE USING (auth.role() = 'authenticated' OR is_admin(auth.uid()));

-- RLS Policies for notification_campaigns
-- Allow all reads (similar to notifications table)
DROP POLICY IF EXISTS "Campaigns are viewable by authenticated users" ON public.notification_campaigns;
CREATE POLICY "Campaigns are viewable by authenticated users" ON public.notification_campaigns
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Campaigns are creatable by authenticated users" ON public.notification_campaigns;
CREATE POLICY "Campaigns are creatable by authenticated users" ON public.notification_campaigns
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Campaigns are updatable by authenticated users" ON public.notification_campaigns;
CREATE POLICY "Campaigns are updatable by authenticated users" ON public.notification_campaigns
FOR UPDATE USING (auth.role() = 'authenticated' OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Campaigns are deletable by authenticated users" ON public.notification_campaigns;
CREATE POLICY "Campaigns are deletable by authenticated users" ON public.notification_campaigns
FOR DELETE USING (auth.role() = 'authenticated' OR is_admin(auth.uid()));

-- RLS Policies for notification_templates
-- Allow all reads (similar to notifications table)
DROP POLICY IF EXISTS "Templates are viewable by authenticated users" ON public.notification_templates;
CREATE POLICY "Templates are viewable by authenticated users" ON public.notification_templates
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Templates are creatable by authenticated users" ON public.notification_templates;
CREATE POLICY "Templates are creatable by authenticated users" ON public.notification_templates
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Templates are updatable by authenticated users" ON public.notification_templates;
CREATE POLICY "Templates are updatable by authenticated users" ON public.notification_templates
FOR UPDATE USING (auth.role() = 'authenticated' OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Templates are deletable by authenticated users" ON public.notification_templates;
CREATE POLICY "Templates are deletable by authenticated users" ON public.notification_templates
FOR DELETE USING (auth.role() = 'authenticated' OR is_admin(auth.uid()));

-- Grant permissions
GRANT ALL ON public.notification_automations TO authenticated;
GRANT ALL ON public.notification_automations TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_automations TO anon;

GRANT ALL ON public.notification_campaigns TO authenticated;
GRANT ALL ON public.notification_campaigns TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_campaigns TO anon;

GRANT ALL ON public.notification_templates TO authenticated;
GRANT ALL ON public.notification_templates TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_templates TO anon;

-- Add comments
COMMENT ON TABLE public.notification_automations IS 'Stores automated notification rules and triggers';
COMMENT ON TABLE public.notification_campaigns IS 'Stores marketing notification campaigns';
COMMENT ON TABLE public.notification_templates IS 'Stores reusable notification templates with variables';

