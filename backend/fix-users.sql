-- Simple SQL script to fix user passwords
-- Run this with: psql -U postgres -d quotation_db -f fix-users.sql

-- Delete existing users
DELETE FROM users;

-- Insert admin user with password: admin123
-- Hash generated with bcrypt, rounds=10
INSERT INTO users (username, password_hash, full_name, email, role) VALUES
('admin', '$2a$10$dZh8NM2DYTmpDG/gw2yN3er.KLtDP9.4ytMy3V6uINr3oWs.jOZ1K', 'System Administrator', 'admin@company.com', 'admin');

-- Insert user with password: user123  
-- Hash generated with bcrypt, rounds=10
INSERT INTO users (username, password_hash, full_name, email, role) VALUES
('user', '$2a$10$C4MiM3NJ8HyCnjgtvcWNz.bDVggtvww9INKlbg7ejANuNOp/AtEdS', 'Regular User', 'user@company.com', 'user');

-- Show inserted users
SELECT username, full_name, role, is_active FROM users;
