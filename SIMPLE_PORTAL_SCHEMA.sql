-- Simplified Client Portal Schema
-- Single page form with text entry, voice entry, urgent checkbox, and submission

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Simplified Enums
CREATE TYPE portal_status AS ENUM ('New', 'In Progress', 'Completed');
CREATE TYPE transcription_status AS ENUM ('Pending', 'Completed', 'Failed', 'Not Applicable');

-- Simplified Clients table (minimal info needed for portal)
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(255) UNIQUE NOT NULL,
    contact_email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Simplified Portal Submissions table
CREATE TABLE portal_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    text_content TEXT,
    voice_file_url TEXT,
    voice_transcription TEXT,
    is_urgent BOOLEAN DEFAULT false,
    status portal_status DEFAULT 'New',
    transcription_status transcription_status DEFAULT 'Not Applicable',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_portal_submissions_client_id ON portal_submissions(client_id);
CREATE INDEX idx_portal_submissions_status ON portal_submissions(status);
CREATE INDEX idx_portal_submissions_urgent ON portal_submissions(is_urgent);
CREATE INDEX idx_portal_submissions_submitted_at ON portal_submissions(submitted_at);
CREATE INDEX idx_clients_subdomain ON clients(subdomain);

-- Constraints
ALTER TABLE clients
    ADD CONSTRAINT valid_subdomain CHECK (subdomain ~* '^[a-z0-9-]+$'),
    ADD CONSTRAINT valid_email CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE portal_submissions
    ADD CONSTRAINT has_content CHECK (text_content IS NOT NULL OR voice_file_url IS NOT NULL);

-- Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portal_submissions_updated_at
    BEFORE UPDATE ON portal_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Views for common queries
CREATE VIEW client_submissions AS
SELECT 
    c.name as client_name,
    c.subdomain,
    ps.id as submission_id,
    ps.text_content,
    ps.voice_file_url,
    ps.voice_transcription,
    ps.is_urgent,
    ps.status,
    ps.submitted_at
FROM portal_submissions ps
JOIN clients c ON ps.client_id = c.id
ORDER BY ps.submitted_at DESC;

CREATE VIEW urgent_submissions AS
SELECT 
    c.name as client_name,
    c.subdomain,
    ps.id as submission_id,
    ps.text_content,
    ps.voice_file_url,
    ps.voice_transcription,
    ps.status,
    ps.submitted_at
FROM portal_submissions ps
JOIN clients c ON ps.client_id = c.id
WHERE ps.is_urgent = true
AND ps.status != 'Completed'
ORDER BY ps.submitted_at DESC; 