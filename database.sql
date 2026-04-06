-- Database will be set via connection configuration

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NOTE: After running this SQL, run `node create-admin.js` to create the admin account.

-- Categories Table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- Products Table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(255),
    category_id INT,
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Orders Table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    customer_name VARCHAR(100),
    address TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order Items Table
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Insert Sample Categories
INSERT INTO categories (name, description) VALUES 
('Cakes', 'Freshly baked cakes for all occasions'),
('Bread', 'Artisan breads baked daily'),
('Pastries', 'Delicious pastries and croissants'),
('Snacks', 'Sweet and savory snacks');

-- Insert Sample Products
INSERT INTO products (name, description, price, image, category_id, stock) VALUES
('Chocolate Fudge Cake', 'Rich chocolate cake with fudge frosting', 8500.00, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', 1, 10),
('Vanilla Bean Cake', 'Classic vanilla cake with buttercream', 7500.00, 'https://images.unsplash.com/photo-1519340333755-56e9c1d04579?w=400', 1, 8),
('Sourdough Bread', 'Traditional sourdough with crispy crust', 2500.00, 'https://images.unsplash.com/photo-1585476263060-b7c6c3b8e5f7?w=400', 2, 15),
('Croissant', 'Buttery flaky French croissant', 1200.00, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', 3, 20),
('Meat Pie', 'Savory meat pie with golden crust', 800.00, 'https://images.unsplash.com/photo-1535920527002-b35e96722eb9?w=400', 4, 25),
('Red Velvet Cake', 'Classic red velvet with cream cheese frosting', 9000.00, 'https://images.unsplash.com/photo-1614707267537-b85aaf00c31b?w=400', 1, 6),
('Banana Bread', 'Moist banana bread with walnuts', 2000.00, 'https://images.unsplash.com/photo-1606103920295-9a091573f160?w=400', 2, 12),
('Danish Pastry', 'Fruit-filled Danish pastry', 1500.00, 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=400', 3, 18);