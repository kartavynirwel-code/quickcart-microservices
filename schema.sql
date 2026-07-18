-- QuickCart MySQL init script.
-- Run this manually against your MySQL instance before starting the services
-- (or let Hibernate/SQLAlchemy auto-create the tables on first run — both apps
-- are also configured to create tables automatically for local dev convenience).
--
-- Both services are configured by default to point at the same database/schema
-- (DB_NAME env var, defaults to "quickcart"). Adjust below if you'd rather split
-- them into two separate schemas.

CREATE DATABASE IF NOT EXISTS quickcart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE quickcart;

-- Used by product-order-service
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- Used by product-order-service
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    items VARCHAR(2000) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    timestamp DATETIME NOT NULL
);

-- Used by payment-service
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    result VARCHAR(20) NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Seed the 5 hardcoded products (also handled by product-order-service's data.sql
-- on startup — this is here in case you want to seed the DB manually first).
INSERT INTO products (name, price)
SELECT * FROM (SELECT 'Wireless Mouse' AS name, 19.99 AS price) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Wireless Mouse');

INSERT INTO products (name, price)
SELECT * FROM (SELECT 'Mechanical Keyboard' AS name, 59.99 AS price) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Mechanical Keyboard');

INSERT INTO products (name, price)
SELECT * FROM (SELECT 'USB-C Hub' AS name, 24.50 AS price) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'USB-C Hub');

INSERT INTO products (name, price)
SELECT * FROM (SELECT '27-inch Monitor' AS name, 189.00 AS price) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = '27-inch Monitor');

INSERT INTO products (name, price)
SELECT * FROM (SELECT 'Laptop Stand' AS name, 34.75 AS price) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Laptop Stand');
