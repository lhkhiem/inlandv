-- Migration 045: Update Users Table - Add Missing Columns
-- Thêm các cột còn thiếu vào bảng users

-- Add first_name if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'first_name'
    ) THEN
        ALTER TABLE users ADD COLUMN first_name VARCHAR(100);
        RAISE NOTICE 'Added column first_name';
    END IF;
END $$;

-- Add last_name if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'last_name'
    ) THEN
        ALTER TABLE users ADD COLUMN last_name VARCHAR(100);
        RAISE NOTICE 'Added column last_name';
    END IF;
END $$;

-- Add phone if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'phone'
    ) THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(20);
        RAISE NOTICE 'Added column phone';
    END IF;
END $$;

-- Add avatar if not exists (as avatar_url)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'avatar'
    ) THEN
        -- Check if avatar_url exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'avatar_url'
        ) THEN
            -- Rename avatar_url to avatar
            ALTER TABLE users RENAME COLUMN avatar_url TO avatar;
            RAISE NOTICE 'Renamed avatar_url to avatar';
        ELSE
            -- Add new avatar column
            ALTER TABLE users ADD COLUMN avatar VARCHAR(500);
            RAISE NOTICE 'Added column avatar';
        END IF;
    END IF;
END $$;

-- Ensure status column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'status'
    ) THEN
        ALTER TABLE users ADD COLUMN status VARCHAR(50) DEFAULT 'active';
        RAISE NOTICE 'Added column status';
    END IF;
END $$;

-- Ensure created_at exists with proper type
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added column created_at';
    END IF;
END $$;

-- Ensure updated_at exists with proper type
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added column updated_at';
    END IF;
END $$;

-- Create indexes if not exist
CREATE INDEX IF NOT EXISTS idx_users_first_name ON users(first_name);
CREATE INDEX IF NOT EXISTS idx_users_last_name ON users(last_name);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

COMMENT ON COLUMN users.first_name IS 'Tên';
COMMENT ON COLUMN users.last_name IS 'Họ';
COMMENT ON COLUMN users.phone IS 'Số điện thoại';
COMMENT ON COLUMN users.avatar IS 'URL ảnh đại diện';
COMMENT ON COLUMN users.status IS 'Trạng thái: active, inactive';





















