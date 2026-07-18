-- Seeds the 5 hardcoded products on startup.
-- Guarded with a NOT EXISTS check so repeated app restarts don't insert duplicates.

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
