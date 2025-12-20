-- Disable RLS on notification tables (like notifications table)
-- This allows anonymous access and fixes Chrome loading issues

-- Disable RLS (same as notifications table - no RLS)
ALTER TABLE public.notification_automations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies (not needed if RLS is disabled)
DROP POLICY IF EXISTS "Automations are viewable by authenticated users" ON public.notification_automations;
DROP POLICY IF EXISTS "Automations are creatable by authenticated users" ON public.notification_automations;
DROP POLICY IF EXISTS "Automations are updatable by authenticated users" ON public.notification_automations;
DROP POLICY IF EXISTS "Automations are deletable by authenticated users" ON public.notification_automations;
DROP POLICY IF EXISTS "Automations are viewable by all" ON public.notification_automations;
DROP POLICY IF EXISTS "Automations are creatable by all" ON public.notification_automations;
DROP POLICY IF EXISTS "Automations are updatable by all" ON public.notification_automations;
DROP POLICY IF EXISTS "Automations are deletable by all" ON public.notification_automations;

DROP POLICY IF EXISTS "Campaigns are viewable by authenticated users" ON public.notification_campaigns;
DROP POLICY IF EXISTS "Campaigns are creatable by authenticated users" ON public.notification_campaigns;
DROP POLICY IF EXISTS "Campaigns are updatable by authenticated users" ON public.notification_campaigns;
DROP POLICY IF EXISTS "Campaigns are deletable by authenticated users" ON public.notification_campaigns;
DROP POLICY IF EXISTS "Campaigns are viewable by all" ON public.notification_campaigns;
DROP POLICY IF EXISTS "Campaigns are creatable by all" ON public.notification_campaigns;
DROP POLICY IF EXISTS "Campaigns are updatable by all" ON public.notification_campaigns;
DROP POLICY IF EXISTS "Campaigns are deletable by all" ON public.notification_campaigns;

DROP POLICY IF EXISTS "Templates are viewable by authenticated users" ON public.notification_templates;
DROP POLICY IF EXISTS "Templates are creatable by authenticated users" ON public.notification_templates;
DROP POLICY IF EXISTS "Templates are updatable by authenticated users" ON public.notification_templates;
DROP POLICY IF EXISTS "Templates are deletable by authenticated users" ON public.notification_templates;
DROP POLICY IF EXISTS "Templates are viewable by all" ON public.notification_templates;
DROP POLICY IF EXISTS "Templates are creatable by all" ON public.notification_templates;
DROP POLICY IF EXISTS "Templates are updatable by all" ON public.notification_templates;
DROP POLICY IF EXISTS "Templates are deletable by all" ON public.notification_templates;

-- Ensure permissions are granted to anon role (like notifications table)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_automations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_campaigns TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_templates TO anon;




