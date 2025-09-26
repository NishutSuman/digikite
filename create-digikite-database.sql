-- Create DigiKite Database
-- Run this SQL in pgAdmin to create the database

-- Create the database
CREATE DATABASE digikite
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'English_United States.1252'
    LC_CTYPE = 'English_United States.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

COMMENT ON DATABASE digikite
    IS 'DigiKite Production Database';

-- Grant privileges
GRANT ALL ON DATABASE digikite TO postgres;