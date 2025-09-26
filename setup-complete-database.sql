-- Complete Database Setup Script for DigiKite
-- Run this in pgAdmin Query Tool

-- Step 1: Create the database (if it doesn't exist)
-- Note: You might need to run this part first, then connect to digikite_dev to run the rest

-- CREATE DATABASE digikite_dev
--     WITH
--     OWNER = postgres
--     ENCODING = 'UTF8'
--     LC_COLLATE = 'English_United States.1252'
--     LC_CTYPE = 'English_United States.1252'
--     TABLESPACE = pg_default
--     CONNECTION LIMIT = -1;

-- COMMENT ON DATABASE digikite_dev IS 'DigiKite Development Database';
-- GRANT ALL ON DATABASE digikite_dev TO postgres;

-- ================================================================
-- Step 2: Create tables (run this after connecting to digikite_dev)
-- ================================================================

-- Create custom enum types
DO $$ BEGIN
    CREATE TYPE "AuthProvider" AS ENUM ('EMAIL', 'GOOGLE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT,
    "provider" "AuthProvider" NOT NULL DEFAULT 'EMAIL',
    "googleId" TEXT,
    "avatar" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "verificationCode" TEXT,
    "verificationCodeExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "User_googleId_key" ON "User"("googleId");
CREATE UNIQUE INDEX IF NOT EXISTS "User_verificationToken_key" ON "User"("verificationToken");

-- Add trigger to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_updated_at
    BEFORE UPDATE ON "User"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert a test user (optional - for testing purposes)
INSERT INTO "User" (
    "id",
    "email",
    "name",
    "password",
    "provider",
    "emailVerified"
) VALUES (
    'test_user_1',
    'test@example.com',
    'Test User',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewRuE/jy6uyRa.w.', -- password: 'password123'
    'EMAIL',
    true
) ON CONFLICT ("email") DO NOTHING;

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'Database setup complete! Tables created successfully.';
END $$;

-- Show all tables
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;