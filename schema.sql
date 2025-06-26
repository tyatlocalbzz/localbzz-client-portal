-- PostgreSQL Database Schema for LocalBzz Client Portal
-- Generated from Airtable Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE client_status AS ENUM ('Pitching', 'Active', 'Inactive');
CREATE TYPE service_type AS ENUM ('Content', 'Social Management', 'Website', 'Email', 'Paid Ads', 'Social Events');
CREATE TYPE shoot_frequency AS ENUM ('Monthly', 'Quarterly', 'Per Project', 'Ad Hoc');
CREATE TYPE shoot_status AS ENUM ('Scheduled', 'Postponed', 'Completed', 'Cancelled');
CREATE TYPE deliverable_type AS ENUM ('Reel', 'Photo', 'Carousel', 'Other');
CREATE TYPE deliverable_status AS ENUM ('To Do', 'In Progress', 'Needs Review', 'Ready-To-Post', 'Delivered');
CREATE TYPE task_status AS ENUM ('To Do', 'In Progress', 'Blocked', 'Awaiting Review', 'Completed');
CREATE TYPE task_priority AS ENUM ('High', 'Medium', 'Low');
CREATE TYPE form_approval_status AS ENUM ('Pending Approval', 'Approved - Send Booking Email', 'Email Sent', 'Rejected');
CREATE TYPE portal_request_type AS ENUM ('Request', 'Insight');
CREATE TYPE portal_priority AS ENUM ('Normal', 'Urgent');
CREATE TYPE portal_topic AS ENUM ('Content', 'Strategy', 'Business Update', 'General');
CREATE TYPE portal_status AS ENUM ('New', 'Working', 'Done');
CREATE TYPE transcription_status AS ENUM ('Pending', 'Completed', 'Failed');

-- Core Tables
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    status client_status NOT NULL,
    primary_contact_name VARCHAR(255),
    primary_contact_email VARCHAR(255),
    primary_contact_phone VARCHAR(50),
    default_shoot_location TEXT,
    shoot_frequency shoot_frequency,
    default_reel_count INTEGER DEFAULT 0,
    default_photo_count INTEGER DEFAULT 0,
    default_carousel_count INTEGER DEFAULT 0,
    client_portal_subdomain VARCHAR(255) UNIQUE,
    notes TEXT,
    contract_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for client services
CREATE TABLE client_services (
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    service_type service_type NOT NULL,
    PRIMARY KEY (client_id, service_type)
);

-- Drive folder information
CREATE TABLE client_drive_folders (
    client_id UUID PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
    main_folder_id VARCHAR(255),
    content_folder_id VARCHAR(255),
    admin_folder_id VARCHAR(255),
    strategy_folder_id VARCHAR(255),
    ready_to_post_folder_id VARCHAR(255)
);

CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for team member roles
CREATE TABLE team_member_roles (
    team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    PRIMARY KEY (team_member_id, role)
);

CREATE TABLE shoots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    shoot_start TIMESTAMPTZ NOT NULL,
    duration INTERVAL,
    shoot_end TIMESTAMPTZ GENERATED ALWAYS AS (shoot_start + duration) STORED,
    status shoot_status NOT NULL,
    location TEXT,
    use_default_location BOOLEAN DEFAULT true,
    shoot_specific_location TEXT,
    notes TEXT,
    calendar_event_link TEXT,
    drive_folder_link TEXT,
    google_calendar_event_id VARCHAR(255),
    master_calendar VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for shoot team members
CREATE TABLE shoot_team_members (
    shoot_id UUID REFERENCES shoots(id) ON DELETE CASCADE,
    team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    is_primary_creator BOOLEAN DEFAULT false,
    PRIMARY KEY (shoot_id, team_member_id)
);

CREATE TABLE deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shoot_id UUID REFERENCES shoots(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    deliverable_type deliverable_type NOT NULL,
    status deliverable_status NOT NULL,
    due_date TIMESTAMPTZ,
    file_link TEXT,
    caption TEXT,
    posting_instructions TEXT,
    shared_with_client_date TIMESTAMPTZ,
    master_calendar VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for deliverable assignments
CREATE TABLE deliverable_assignments (
    deliverable_id UUID REFERENCES deliverables(id) ON DELETE CASCADE,
    team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    is_initial_assignee BOOLEAN DEFAULT false,
    PRIMARY KEY (deliverable_id, team_member_id)
);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    due_date DATE,
    status task_status NOT NULL,
    priority task_priority,
    description TEXT,
    time_started_in_progress TIMESTAMPTZ,
    time_completed TIMESTAMPTZ,
    time_spent_minutes INTEGER GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (time_completed - time_started_in_progress))/60) STORED,
    work_started_by UUID REFERENCES team_members(id),
    work_completed_by UUID REFERENCES team_members(id),
    task_assigned_by UUID REFERENCES team_members(id),
    client_id UUID REFERENCES clients(id),
    shoot_id UUID REFERENCES shoots(id),
    deliverable_id UUID REFERENCES deliverables(id),
    master_calendar VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for task assignments
CREATE TABLE task_assignments (
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, team_member_id)
);

CREATE TABLE form_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    form_name VARCHAR(255) NOT NULL,
    business_name VARCHAR(255),
    business_url TEXT,
    marketing_goals TEXT,
    referral_source VARCHAR(255),
    assignee_id UUID REFERENCES team_members(id),
    approval_status form_approval_status NOT NULL,
    booking_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE client_portal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    request_type portal_request_type NOT NULL,
    priority portal_priority NOT NULL,
    topic portal_topic NOT NULL,
    status portal_status NOT NULL,
    transcription_status transcription_status,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attachments table for various entities
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL, -- 'client_contract', 'client_logo', 'task_attachment', 'portal_voice_memo'
    entity_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_shoots_start_date ON shoots(shoot_start);
CREATE INDEX idx_deliverables_due_date ON deliverables(due_date);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_form_submissions_approval_status ON form_submissions(approval_status);
CREATE INDEX idx_client_portal_requests_status ON client_portal_requests(status);
CREATE INDEX idx_attachments_entity ON attachments(entity_type, entity_id);

-- Constraints
ALTER TABLE clients
    ADD CONSTRAINT valid_email CHECK (primary_contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE shoots
    ADD CONSTRAINT valid_duration CHECK (duration > INTERVAL '0');

ALTER TABLE deliverables
    ADD CONSTRAINT valid_due_date CHECK (due_date > created_at);

-- Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to all tables with updated_at
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shoots_updated_at
    BEFORE UPDATE ON shoots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliverables_updated_at
    BEFORE UPDATE ON deliverables
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_submissions_updated_at
    BEFORE UPDATE ON form_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_portal_requests_updated_at
    BEFORE UPDATE ON client_portal_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Views
CREATE VIEW active_client_deliverables AS
SELECT 
    c.name as client_name,
    d.deliverable_type,
    d.status,
    d.due_date,
    tm.name as assigned_to
FROM deliverables d
JOIN clients c ON d.client_id = c.id
LEFT JOIN deliverable_assignments da ON d.id = da.deliverable_id
LEFT JOIN team_members tm ON da.team_member_id = tm.id
WHERE d.status != 'Delivered';

CREATE VIEW upcoming_shoots AS
SELECT 
    s.shoot_start,
    c.name as client_name,
    s.location,
    s.status,
    array_agg(tm.name) as team_members
FROM shoots s
JOIN clients c ON s.client_id = c.id
LEFT JOIN shoot_team_members stm ON s.id = stm.shoot_id
LEFT JOIN team_members tm ON stm.team_member_id = tm.id
WHERE s.shoot_start > NOW()
GROUP BY s.id, c.name, s.location, s.status;

CREATE VIEW team_member_workload AS
SELECT 
    tm.name as team_member,
    COUNT(DISTINCT t.id) as active_tasks,
    COUNT(DISTINCT d.id) as active_deliverables,
    COUNT(DISTINCT s.id) as upcoming_shoots
FROM team_members tm
LEFT JOIN task_assignments ta ON tm.id = ta.team_member_id
LEFT JOIN tasks t ON ta.task_id = t.id AND t.status NOT IN ('Completed')
LEFT JOIN deliverable_assignments da ON tm.id = da.team_member_id
LEFT JOIN deliverables d ON da.deliverable_id = d.id AND d.status NOT IN ('Delivered')
LEFT JOIN shoot_team_members stm ON tm.id = stm.team_member_id
LEFT JOIN shoots s ON stm.shoot_id = s.id AND s.shoot_start > NOW()
GROUP BY tm.id, tm.name; 