-- Migration 002: Add Indexes
-- Adds performance indexes

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_location ON projects(location);

-- Listings indexes
CREATE INDEX IF NOT EXISTS idx_listings_project_id ON listings(project_id);
CREATE INDEX IF NOT EXISTS idx_listings_type ON listings(type);

-- Posts indexes
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);

-- Leads indexes
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

-- Jobs indexes
CREATE INDEX IF NOT EXISTS idx_jobs_slug ON jobs(slug);

