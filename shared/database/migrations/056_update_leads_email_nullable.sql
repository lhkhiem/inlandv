-- Migration 056: Update leads table to allow empty email
-- Allows email to be empty string (form may not require email)

-- Make email nullable (allow NULL)
ALTER TABLE leads ALTER COLUMN email DROP NOT NULL;

-- Update existing empty emails to NULL for consistency
UPDATE leads SET email = NULL WHERE email = '';

-- Add comment
COMMENT ON COLUMN leads.email IS 'Email của khách hàng (có thể để trống)';

