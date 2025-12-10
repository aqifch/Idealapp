-- Verification script to check if required tables exist
-- Run this to verify tables are created correctly

-- Check if notifications table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'notifications'
  ) THEN
    RAISE EXCEPTION 'notifications table does not exist. Please run migration 20250109000001_create_notifications_table.sql';
  END IF;
  
  RAISE NOTICE '✅ notifications table exists';
END $$;

-- Check if kv_store_b09ae082 table exists (optional, for settings)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'kv_store_b09ae082'
  ) THEN
    RAISE NOTICE '⚠️ kv_store_b09ae082 table does not exist (optional for settings)';
  ELSE
    RAISE NOTICE '✅ kv_store_b09ae082 table exists';
  END IF;
END $$;

-- Show table structures
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name IN ('notifications', 'kv_store_b09ae082')
ORDER BY table_name, ordinal_position;

