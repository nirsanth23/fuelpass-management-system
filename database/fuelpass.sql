CREATE DATABASE IF NOT EXISTS fuelpass;
USE fuelpass;

CREATE TABLE IF NOT EXISTS users (
	id INT AUTO_INCREMENT PRIMARY KEY,
	nic VARCHAR(20) UNIQUE,
	first_name VARCHAR(50),
	last_name VARCHAR(50),
	address TEXT,
	phone_number VARCHAR(20),
	email VARCHAR(255) NOT NULL UNIQUE,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles (
	id INT AUTO_INCREMENT PRIMARY KEY,
	user_id INT NOT NULL,
	vehicle_number VARCHAR(20) NOT NULL UNIQUE,
	chassis_no VARCHAR(50) NOT NULL,
	vehicle_type VARCHAR(50) NOT NULL,
	fuel_type VARCHAR(50) NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_otps (
	id INT AUTO_INCREMENT PRIMARY KEY,
	email VARCHAR(255) NOT NULL,
	otp CHAR(4) NOT NULL,
	expires_at DATETIME NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	INDEX idx_email_created (email, created_at),
	INDEX idx_email_otp (email, otp)
);

CREATE TABLE IF NOT EXISTS admin_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    station_username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    status ENUM('pending', 'resolved') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
