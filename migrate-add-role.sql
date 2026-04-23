-- ============================================================
-- MIGRATION: Add 'role' column to existing users table
-- Run this ONCE on your live database.
-- ============================================================

ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') NOT NULL DEFAULT 'user';

-- Verify it worked (optional - check the table structure):
-- DESCRIBE users;
