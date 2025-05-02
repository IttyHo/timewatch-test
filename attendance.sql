CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_type ENUM('in', 'out') NOT NULL,
    report_date DATE NOT NULL,
    report_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_report_date_time ON attendance (report_date, report_time);