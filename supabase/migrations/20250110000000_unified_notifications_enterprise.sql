-- Unified Notification Center Enterprise Features Migration
-- Adds analytics, segments, AB tests, and activity log tables

-- Add analytics columns to notifications table
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS sent_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS opened_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS clicked_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ab_test_id UUID,
ADD COLUMN IF NOT EXISTS variant_id UUID,
ADD COLUMN IF NOT EXISTS segment_id UUID,
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Create notification_analytics table
CREATE TABLE IF NOT EXISTS public.notification_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES public.notifications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('sent', 'opened', 'clicked')),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_analytics_notification_id ON public.notification_analytics(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_analytics_user_id ON public.notification_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_analytics_action ON public.notification_analytics(action);
CREATE INDEX IF NOT EXISTS idx_notification_analytics_created_at ON public.notification_analytics(created_at DESC);

-- Create notification_segments table
CREATE TABLE IF NOT EXISTS public.notification_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  filters JSONB NOT NULL,
  user_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_segments_created_by ON public.notification_segments(created_by);
CREATE INDEX IF NOT EXISTS idx_notification_segments_created_at ON public.notification_segments(created_at DESC);

-- Create ab_tests table
CREATE TABLE IF NOT EXISTS public.ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  variants JSONB NOT NULL,
  split_ratio INTEGER DEFAULT 50 CHECK (split_ratio >= 10 AND split_ratio <= 90),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'completed')),
  winner_id UUID,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ab_tests_status ON public.ab_tests(status);
CREATE INDEX IF NOT EXISTS idx_ab_tests_created_by ON public.ab_tests(created_by);
CREATE INDEX IF NOT EXISTS idx_ab_tests_created_at ON public.ab_tests(created_at DESC);

-- Create activity_log table
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('notification', 'campaign', 'automation', 'template', 'segment')),
  entity_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT,
  details JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_entity_type ON public.activity_log(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity_id ON public.activity_log(entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_timestamp ON public.activity_log(timestamp DESC);

-- Enable RLS on new tables
ALTER TABLE public.notification_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_analytics
DROP POLICY IF EXISTS "Analytics are viewable by authenticated users" ON public.notification_analytics;
CREATE POLICY "Analytics are viewable by authenticated users" ON public.notification_analytics
FOR SELECT USING (auth.role() = 'authenticated' OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Analytics are creatable by authenticated users" ON public.notification_analytics;
CREATE POLICY "Analytics are creatable by authenticated users" ON public.notification_analytics
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for notification_segments
DROP POLICY IF EXISTS "Segments are viewable by authenticated users" ON public.notification_segments;
CREATE POLICY "Segments are viewable by authenticated users" ON public.notification_segments
FOR SELECT USING (auth.role() = 'authenticated' OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Segments are creatable by authenticated users" ON public.notification_segments;
CREATE POLICY "Segments are creatable by authenticated users" ON public.notification_segments
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Segments are updatable by creators or admins" ON public.notification_segments;
CREATE POLICY "Segments are updatable by creators or admins" ON public.notification_segments
FOR UPDATE USING ((created_by = auth.uid()) OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Segments are deletable by creators or admins" ON public.notification_segments;
CREATE POLICY "Segments are deletable by creators or admins" ON public.notification_segments
FOR DELETE USING ((created_by = auth.uid()) OR is_admin(auth.uid()));

-- RLS Policies for ab_tests
DROP POLICY IF EXISTS "AB tests are viewable by authenticated users" ON public.ab_tests;
CREATE POLICY "AB tests are viewable by authenticated users" ON public.ab_tests
FOR SELECT USING (auth.role() = 'authenticated' OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "AB tests are creatable by authenticated users" ON public.ab_tests;
CREATE POLICY "AB tests are creatable by authenticated users" ON public.ab_tests
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "AB tests are updatable by creators or admins" ON public.ab_tests;
CREATE POLICY "AB tests are updatable by creators or admins" ON public.ab_tests
FOR UPDATE USING ((created_by = auth.uid()) OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "AB tests are deletable by creators or admins" ON public.ab_tests;
CREATE POLICY "AB tests are deletable by creators or admins" ON public.ab_tests
FOR DELETE USING ((created_by = auth.uid()) OR is_admin(auth.uid()));

-- RLS Policies for activity_log
DROP POLICY IF EXISTS "Activity log is viewable by authenticated users" ON public.activity_log;
CREATE POLICY "Activity log is viewable by authenticated users" ON public.activity_log
FOR SELECT USING (auth.role() = 'authenticated' OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Activity log is creatable by authenticated users" ON public.activity_log;
CREATE POLICY "Activity log is creatable by authenticated users" ON public.activity_log
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON public.notification_analytics TO authenticated;
GRANT ALL ON public.notification_segments TO authenticated;
GRANT ALL ON public.ab_tests TO authenticated;
GRANT ALL ON public.activity_log TO authenticated;




