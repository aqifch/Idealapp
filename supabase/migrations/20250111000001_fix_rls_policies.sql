-- Fix RLS Policies to allow all reads (like notifications table)
-- This ensures data loads in all browsers

-- Drop existing policies and create permissive ones
DROP POLICY IF EXISTS "Automations are viewable by authenticated users" ON public.notification_automations;
DROP POLICY IF EXISTS "Automations are creatable by authenticated users" ON public.notification_automations;
DROP POLICY IF EXISTS "Automations are updatable by authenticated users" ON public.notification_automations;
DROP POLICY IF EXISTS "Automations are deletable by authenticated users" ON public.notification_automations;

DROP POLICY IF EXISTS "Campaigns are viewable by authenticated users" ON public.notification_campaigns;
DROP POLICY IF EXISTS "Campaigns are creatable by authenticated users" ON public.notification_campaigns;
DROP POLICY IF EXISTS "Campaigns are updatable by authenticated users" ON public.notification_campaigns;
DROP POLICY IF EXISTS "Campaigns are deletable by authenticated users" ON public.notification_campaigns;

DROP POLICY IF EXISTS "Templates are viewable by authenticated users" ON public.notification_templates;
DROP POLICY IF EXISTS "Templates are creatable by authenticated users" ON public.notification_templates;
DROP POLICY IF EXISTS "Templates are updatable by authenticated users" ON public.notification_templates;
DROP POLICY IF EXISTS "Templates are deletable by authenticated users" ON public.notification_templates;

-- Create permissive policies (allow all reads, like notifications table)
CREATE POLICY "Automations are viewable by all" ON public.notification_automations
FOR SELECT USING (true);

CREATE POLICY "Automations are creatable by all" ON public.notification_automations
FOR INSERT WITH CHECK (true);

CREATE POLICY "Automations are updatable by all" ON public.notification_automations
FOR UPDATE USING (true);

CREATE POLICY "Automations are deletable by all" ON public.notification_automations
FOR DELETE USING (true);

CREATE POLICY "Campaigns are viewable by all" ON public.notification_campaigns
FOR SELECT USING (true);

CREATE POLICY "Campaigns are creatable by all" ON public.notification_campaigns
FOR INSERT WITH CHECK (true);

CREATE POLICY "Campaigns are updatable by all" ON public.notification_campaigns
FOR UPDATE USING (true);

CREATE POLICY "Campaigns are deletable by all" ON public.notification_campaigns
FOR DELETE USING (true);

CREATE POLICY "Templates are viewable by all" ON public.notification_templates
FOR SELECT USING (true);

CREATE POLICY "Templates are creatable by all" ON public.notification_templates
FOR INSERT WITH CHECK (true);

CREATE POLICY "Templates are updatable by all" ON public.notification_templates
FOR UPDATE USING (true);

CREATE POLICY "Templates are deletable by all" ON public.notification_templates
FOR DELETE USING (true);




