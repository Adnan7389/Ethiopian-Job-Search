-- First, modify the status column to allow 'pending' as a value
ALTER TABLE jobs 
MODIFY COLUMN status ENUM('open', 'closed', 'paused', 'pending') DEFAULT 'pending'; 