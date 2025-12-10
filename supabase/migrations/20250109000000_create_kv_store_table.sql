-- Create kv_store_b09ae082 table for key-value storage
-- This table is used by the server function for storing notifications and settings

CREATE TABLE IF NOT EXISTS public.kv_store_b09ae082 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

-- Add comment to table
COMMENT ON TABLE public.kv_store_b09ae082 IS 'Key-value store for server function data (notifications, settings, etc.)';

-- Create index on value for better query performance (optional, but helpful for JSONB queries)
CREATE INDEX IF NOT EXISTS idx_kv_store_value ON public.kv_store_b09ae082 USING gin (value);

-- Grant necessary permissions
GRANT ALL ON public.kv_store_b09ae082 TO authenticated;
GRANT ALL ON public.kv_store_b09ae082 TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kv_store_b09ae082 TO anon;

