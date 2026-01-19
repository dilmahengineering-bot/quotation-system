-- User Password Fix SQL
-- Run this in pgAdmin Query Tool or psql

-- Delete existing users
DELETE FROM users;

-- Insert admin user (password: admin123)
INSERT INTO users (username, password_hash, full_name, email, role) VALUES ('admin', '$2a$10$PcYWLHn3Sb4NirgFF/atyOo117yd1vqQ2jN3Rq9zzJ3hi3sERo84G', 'System Administrator', 'admin@company.com', 'admin');

-- Insert regular user (password: user123)
INSERT INTO users (username, password_hash, full_name, email, role) VALUES ('user', '$2a$10$DI5kYkb2I9jCr4eBruuJxeDmk/yypDzQusA69vzjf6DRx33JMT//W', 'Regular User', 'user@company.com', 'user');

-- Verify users
SELECT username, full_name, role, is_active FROM users;
