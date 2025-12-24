-- Migration 054: Create job_applications table
-- Date: 2025-01-28

-- Create job_applications table if it doesn't exist
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  cv_url TEXT,
  cover_letter TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'interviewed', 'accepted', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_created_at ON job_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_email ON job_applications(email);

-- Comments
COMMENT ON TABLE job_applications IS 'Đơn ứng tuyển cho các vị trí tuyển dụng';
COMMENT ON COLUMN job_applications.status IS 'Trạng thái: pending, reviewing, interviewed, accepted, rejected';
COMMENT ON COLUMN job_applications.notes IS 'Ghi chú nội bộ về ứng viên';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


