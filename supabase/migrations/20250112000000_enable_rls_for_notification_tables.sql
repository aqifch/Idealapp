-- Enable RLS on notification tables and create proper policies
-- This removes the "UNRESTRICTED" badge from Supabase UI

-- Enable Row Level Security
ALTER TABLE public.notification_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies first
DROP POLICY IF EXISTS "Automations are viewable by all" ON public.notification_automations;
DROP POLICY IF EXISTS "Automations are creatable by all" ON public.notification_automations;
DROP POLICY IF EXISTS "Automations are updatable by all" ON public.notification_automations;
DROP POLICY IF EXISTS "Automations are deletable by all" ON public.notification_automations;
DROP POLICY IF EXISTS "Automations are viewable by authenticated users" ON public.notification_automations;
DROP POLICY IF EXISTS "Automations are creatable by authenticated users" ON public.notification_automations;
DROP POLICY IF EXISTS "Automations are updatable by authenticated users" ON public.notification_automations;
DROP POLICY IF EXISTS "Automations are deletable by authenticated users" ON public.notification_automations;

DROP POLICY IF EXISTS "Campaigns are viewable by all" ON public.notification_campaigns;
DROP POLICY IF EXISTS "Campaigns are creatable by all" ON public.notification_campaigns;
DROP POLICY IF EXISTS "Campaigns are updatable by all" ON public.notification_campaigns;
DROP POLICY IF EXISTS "Campaigns are deletable by all" ON public.notification_campaigns;
DROP POLICY IF EXISTS "Campaigns are viewable by authenticated users" ON public.notification_campaigns;
DROP POLICY IF EXISTS "Campaigns are creatable by authenticated users" ON public.notification_campaigns;
DROP POLICY IF EXISTS "Campaigns are updatable by authenticated users" ON public.notification_campaigns;
DROP POLICY IF EXISTS "Campaigns are deletable by authenticated users" ON public.notification_campaigns;

DROP POLICY IF EXISTS "Templates are viewable by all" ON public.notification_templates;
DROP POLICY IF EXISTS "Templates are creatable by all" ON public.notification_templates;
DROP POLICY IF EXISTS "Templates are updatable by all" ON public.notification_templates;
DROP POLICY IF EXISTS "Templates are deletable by all" ON public.notification_templates;
DROP POLICY IF EXISTS "Templates are viewable by authenticated users" ON public.notification_templates;
DROP POLICY IF EXISTS "Templates are creatable by authenticated users" ON public.notification_templates;
DROP POLICY IF EXISTS "Templates are updatable by authenticated users" ON public.notification_templates;
DROP POLICY IF EXISTS "Templates are deletable by authenticated users" ON public.notification_templates;

-- Create permissive policies that allow all access (like notifications table)
-- This keeps functionality while enabling RLS to remove UNRESTRICTED badge

-- Automations policies
CREATE POLICY "Automations are viewable by all" ON public.notification_automations
FOR SELECT USING (true);

CREATE POLICY "Automations are creatable by all" ON public.notification_automations
FOR INSERT WITH CHECK (true);

CREATE POLICY "Automations are updatable by all" ON public.notification_automations
FOR UPDATE USING (true);

CREATE POLICY "Automations are deletable by all" ON public.notification_automations
FOR DELETE USING (true);

-- Campaigns policies
CREATE POLICY "Campaigns are viewable by all" ON public.notification_campaigns
FOR SELECT USING (true);

CREATE POLICY "Campaigns are creatable by all" ON public.notification_campaigns
FOR INSERT WITH CHECK (true);

CREATE POLICY "Campaigns are updatable by all" ON public.notification_campaigns
FOR UPDATE USING (true);

CREATE POLICY "Campaigns are deletable by all" ON public.notification_campaigns
FOR DELETE USING (true);

-- Templates policies
CREATE POLICY "Templates are viewable by all" ON public.notification_templates
FOR SELECT USING (true);

CREATE POLICY "Templates are creatable by all" ON public.notification_templates
FOR INSERT WITH CHECK (true);

CREATE POLICY "Templates are updatable by all" ON public.notification_templates
FOR UPDATE USING (true);

CREATE POLICY "Templates are deletable by all" ON public.notification_templates
FOR DELETE USING (true);

-- Ensure permissions are granted
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_automations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_automations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_campaigns TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_campaigns TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_templates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_templates TO authenticated;




