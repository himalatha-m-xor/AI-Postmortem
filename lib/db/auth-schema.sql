-- Authentication & Automatic Detection Schema
-- Production-ready tables for multi-user auth and incident tracking

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Sessions table (for simple session management)
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    ip_address VARCHAR(45)
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- Auto-cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Audit log for tracking who did what
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(255),
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Update incidents table for auto-detection
ALTER TABLE incidents 
    ADD COLUMN IF NOT EXISTS detected_by VARCHAR(255),
    ADD COLUMN IF NOT EXISTS detection_method VARCHAR(100),
    ADD COLUMN IF NOT EXISTS slack_thread_ts VARCHAR(100),
    ADD COLUMN IF NOT EXISTS auto_resolved BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_incidents_detection_method ON incidents(detection_method);
CREATE INDEX IF NOT EXISTS idx_incidents_slack_thread ON incidents(slack_thread_ts);

-- Slack messages enhancement for auto-detection
ALTER TABLE slack_messages
    ADD COLUMN IF NOT EXISTS slack_ts VARCHAR(100),
    ADD COLUMN IF NOT EXISTS user_id VARCHAR(100),
    ADD COLUMN IF NOT EXISTS raw_event JSONB;

CREATE INDEX IF NOT EXISTS idx_slack_messages_ts ON slack_messages(slack_ts);

-- Comments table for postmortem collaboration
CREATE TABLE IF NOT EXISTS postmortem_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    postmortem_id VARCHAR(255) NOT NULL REFERENCES postmortems(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_postmortem_comments_postmortem ON postmortem_comments(postmortem_id);
CREATE INDEX IF NOT EXISTS idx_postmortem_comments_user ON postmortem_comments(user_id);
