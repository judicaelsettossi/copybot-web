-- database/init.sql
CREATE TABLE IF NOT EXISTS wallets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    address VARCHAR(64) NOT NULL UNIQUE,
    label VARCHAR(100) DEFAULT NULL,
    status ENUM('active', 'inactive', 'error') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_activity TIMESTAMP NULL,
    transactions_count INT DEFAULT 0,
    metadata JSON DEFAULT NULL,

    INDEX idx_address (address),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Table pour les logs
CREATE TABLE IF NOT EXISTS wallet_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wallet_id INT NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    data JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
    INDEX idx_wallet_id (wallet_id),
    INDEX idx_created_at (created_at)
);
