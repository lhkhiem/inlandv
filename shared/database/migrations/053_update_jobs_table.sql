-- Migration 053: Update jobs table to full schema
-- Date: 2025-01-28

-- Add missing columns to jobs table
DO $$ 
BEGIN
  -- Add quantity column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'quantity') THEN
    ALTER TABLE jobs ADD COLUMN quantity INTEGER DEFAULT 1;
  END IF;

  -- Add deadline column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'deadline') THEN
    ALTER TABLE jobs ADD COLUMN deadline DATE;
  END IF;

  -- Add description_overview column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'description_overview') THEN
    ALTER TABLE jobs ADD COLUMN description_overview TEXT;
  END IF;

  -- Add description_responsibilities column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'description_responsibilities') THEN
    ALTER TABLE jobs ADD COLUMN description_responsibilities TEXT;
  END IF;

  -- Add description_requirements column (rename from requirements if exists)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'requirements') THEN
    -- Migrate data from requirements to description_requirements
    UPDATE jobs SET description_requirements = requirements WHERE description_requirements IS NULL AND requirements IS NOT NULL;
    -- Drop old requirements column after migration
    ALTER TABLE jobs DROP COLUMN requirements;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'description_requirements') THEN
    ALTER TABLE jobs ADD COLUMN description_requirements TEXT;
  END IF;

  -- Add description_benefits column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'description_benefits') THEN
    ALTER TABLE jobs ADD COLUMN description_benefits TEXT;
  END IF;

  -- Add status column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'status') THEN
    ALTER TABLE jobs ADD COLUMN status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft'));
  END IF;

  -- Add view_count column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'view_count') THEN
    ALTER TABLE jobs ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;

  -- Add updated_at column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'updated_at') THEN
    ALTER TABLE jobs ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add created_by column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'created_by') THEN
    ALTER TABLE jobs ADD COLUMN created_by UUID REFERENCES users(id) ON DELETE SET NULL;
  END IF;

  -- Migrate description to description_overview if needed
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'description') THEN
    UPDATE jobs SET description_overview = description WHERE description_overview IS NULL AND description IS NOT NULL;
    -- Keep description column for backward compatibility, or drop it
    -- ALTER TABLE jobs DROP COLUMN description;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_jobs_deadline ON jobs(deadline) WHERE deadline >= CURRENT_DATE;
CREATE INDEX IF NOT EXISTS idx_jobs_created_by ON jobs(created_by);

-- Add comments
COMMENT ON COLUMN jobs.quantity IS 'Số lượng vị trí cần tuyển';
COMMENT ON COLUMN jobs.deadline IS 'Hạn nộp hồ sơ, NULL = không giới hạn';
COMMENT ON COLUMN jobs.description_overview IS 'Tổng quan về vị trí';
COMMENT ON COLUMN jobs.description_responsibilities IS 'Trách nhiệm công việc';
COMMENT ON COLUMN jobs.description_requirements IS 'Yêu cầu ứng viên';
COMMENT ON COLUMN jobs.description_benefits IS 'Quyền lợi';
COMMENT ON COLUMN jobs.status IS 'Trạng thái: active, closed, draft';

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


