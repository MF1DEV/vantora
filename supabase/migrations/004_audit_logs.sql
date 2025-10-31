-- Create audit_logs table for security event tracking
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own audit logs
CREATE POLICY "Users can view own audit logs"
  ON audit_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs"
  ON audit_logs
  FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE audit_logs IS 'Security audit log for tracking user actions and security events';
COMMENT ON COLUMN audit_logs.event_type IS 'Type of event: login, logout, password_change, profile_update, link_create, link_delete, account_delete, failed_login, suspicious_activity';
COMMENT ON COLUMN audit_logs.event_data IS 'Additional event-specific data in JSON format';
