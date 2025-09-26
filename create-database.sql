-- Run this SQL in pgAdmin to create the database
-- 1. Right-click on "PostgreSQL 17" in pgAdmin
-- 2. Select "Query Tool"
-- 3. Copy and paste this SQL
-- 4. Click Execute (F5)

-- Create the database
CREATE DATABASE digikite_dev
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'English_United States.1252'
    LC_CTYPE = 'English_United States.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

COMMENT ON DATABASE digikite_dev
    IS 'DigiKite Development Database';

-- Grant privileges
GRANT ALL ON DATABASE digikite_dev TO postgres;