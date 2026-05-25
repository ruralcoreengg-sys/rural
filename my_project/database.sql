-- ============================================================
-- Precision CAD Solutions - Database Setup
-- Run this SQL in phpMyAdmin or MySQL console
-- ============================================================

-- Create database
CREATE DATABASE IF NOT EXISTS rurale_db;
USE rurale_db;

-- Create enquiries table
CREATE TABLE IF NOT EXISTS enquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    company VARCHAR(100) DEFAULT NULL,
    service VARCHAR(100) DEFAULT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Verify table was created
DESCRIBE enquiries;
