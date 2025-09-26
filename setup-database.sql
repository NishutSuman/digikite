-- DigiKite Database Setup Script
-- Run this in pgAdmin or psql to create the database

-- Create the database
CREATE DATABASE digikite_dev;

-- Connect to the database (run this separately in pgAdmin)
-- \c digikite_dev;

-- Create user (optional, if you want a dedicated user)
-- CREATE USER digikite_user WITH PASSWORD 'digikite_password';
-- GRANT ALL PRIVILEGES ON DATABASE digikite_dev TO digikite_user;

-- The tables will be created automatically by Prisma migrations