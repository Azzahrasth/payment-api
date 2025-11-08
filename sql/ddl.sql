CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  password VARCHAR(255) NOT NULL,
  profile_image VARCHAR(255) DEFAULT 'http://localhost:3000/uploads/default-profile.png',
  balance DECIMAL(15,2) DEFAULT 0
);

CREATE TABLE banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  banner_name VARCHAR(100),
  banner_image VARCHAR(255),
  description TEXT
);

CREATE TABLE services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_code VARCHAR(50),
  service_name VARCHAR(100),
  service_icon VARCHAR(255),
  service_tariff DECIMAL(15,2)
);

CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(50),
  email VARCHAR(100),
  service_code VARCHAR(50),
  transaction_type ENUM('TOPUP','PAYMENT'),
  description VARCHAR(255),
  total_amount DECIMAL(15,2),
  created_on DATETIME DEFAULT CURRENT_TIMESTAMP
);
