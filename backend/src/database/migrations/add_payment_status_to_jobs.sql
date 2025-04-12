ALTER TABLE jobs
ADD COLUMN payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
ADD COLUMN payment_id VARCHAR(255) DEFAULT NULL,
ADD COLUMN payment_date DATETIME DEFAULT NULL; 