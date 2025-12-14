-- Migration: Add bank fields and employment status values
-- Date: 2025-01-14

-- Add bank_name and bank_account columns to employees table
ALTER TABLE employees
ADD COLUMN bank_name VARCHAR(100) DEFAULT NULL,
ADD COLUMN bank_account VARCHAR(50) DEFAULT NULL;

-- Modify employment_status enum in employment_histories table to include 'resigned' and 'terminated'
-- Note: Preserving all original values (active, probation, suspended, inactive) and adding new ones
ALTER TABLE employment_histories
MODIFY COLUMN employment_status ENUM('active', 'probation', 'suspended', 'inactive', 'resigned', 'terminated') DEFAULT 'active';
