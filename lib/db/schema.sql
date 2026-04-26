-- AI-Postmortem Database Schema (Simplified)
-- PostgreSQL 16
-- Only essential tables for Slack incidents and AI postmortems

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Incidents Table (from Slack)
CREATE TABLE IF NOT EXISTS incidents (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    severity VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    affected_services TEXT[] DEFAULT '{}',
    users_impacted INTEGER DEFAULT 0,
    slack_channel VARCHAR(255),
    assigned_to VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_start_time ON incidents(start_time);

-- Slack Messages Table (conversation history for AI processing)
CREATE TABLE IF NOT EXISTS slack_messages (
    id SERIAL PRIMARY KEY,
    incident_id VARCHAR(255) NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    timestamp VARCHAR(100) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_slack_messages_incident ON slack_messages(incident_id);

-- Postmortems Table (AI-generated reports)
CREATE TABLE IF NOT EXISTS postmortems (
    id VARCHAR(255) PRIMARY KEY,
    incident_id VARCHAR(255) NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,

    -- Incident metadata
    incident_title VARCHAR(500) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    duration_minutes INTEGER NOT NULL,
    users_impacted INTEGER NOT NULL,
    services_affected TEXT[] DEFAULT '{}',
    estimated_revenue_loss VARCHAR(100),

    -- AI-generated content
    executive_summary TEXT NOT NULL,
    root_cause_summary TEXT NOT NULL,
    root_cause_technical_details TEXT,
    root_cause_code_example TEXT,

    -- Analysis arrays (stored as JSONB for flexibility)
    contributing_factors JSONB DEFAULT '[]',
    what_went_well JSONB DEFAULT '[]',
    what_went_poorly JSONB DEFAULT '[]',
    remediation_steps JSONB DEFAULT '[]',
    timeline JSONB DEFAULT '[]',
    prevention_measures JSONB DEFAULT '[]',
    action_items JSONB DEFAULT '[]',

    generated_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_postmortems_incident ON postmortems(incident_id);
CREATE INDEX IF NOT EXISTS idx_postmortems_created ON postmortems(created_at);
CREATE INDEX IF NOT EXISTS idx_postmortems_severity ON postmortems(severity);
