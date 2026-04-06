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
('Danish Pastry', 'Fruit-filled Danish pastry', 1500.00, 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=400', 3, 18),
('Strawberry Shortcake', 'Light sponge cake with fresh strawberries and cream', 9500.00, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400', 1, 10),
('Lemon Drizzle Cake', 'Tangy lemon cake with sugar glaze', 7000.00, 'https://images.unsplash.com/photo-1519869325930-281384150729?w=400', 1, 12),
('Carrot Cake', 'Moist carrot cake with cream cheese frosting', 8000.00, 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400', 1, 8),
('Cheesecake', 'Creamy New York style cheesecake', 10500.00, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400', 1, 5),
('Black Forest Cake', 'Chocolate cake with cherries and whipped cream', 9000.00, 'https://images.unsplash.com/photo-1606313564200-e75d4e51062b?w=400', 1, 7),
('Whole Wheat Bread', 'Hearty 100% whole wheat bread', 1800.00, 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400', 2, 20),
('Baguette', 'Classic crusty French baguette', 1500.00, 'https://images.unsplash.com/photo-1485050022473-b3c66f577f8d?w=400', 2, 25),
('Ciabatta', 'Italian olive oil bread with airy texture', 2200.00, 'https://images.unsplash.com/photo-1598144819059-40842db1304b?w=400', 2, 15),
('Challah Bread', 'Traditional braided egg bread', 3000.00, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', 2, 10),
('Rye Bread', 'Dense and flavorful rye bread', 2500.00, 'https://images.unsplash.com/photo-1586414619472-762fdcd5101a?w=400', 2, 12),
('Pain au Chocolat', 'Buttery pastry with dark chocolate center', 1800.00, 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=400', 3, 30),
('Almond Croissant', 'Croissant filled with sweet almond cream', 2000.00, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', 3, 20),
('Cinnamon Roll', 'Soft roll with cinnamon and sugar glaze', 1500.00, 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=400', 3, 25),
('Fruit Tart', 'Crisp pastry shell with custard and fresh fruit', 3500.00, 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=400', 3, 10),
('Eclair', 'Choux pastry filled with cream and topped with chocolate', 2200.00, 'https://images.unsplash.com/photo-1621236304847-ef851b209e7a?w=400', 3, 15),
('Sausage Roll', 'Savory sausage meat wrapped in flaky pastry', 1200.00, 'https://images.unsplash.com/photo-1601050633647-81a3d9356396?w=400', 4, 40),
('Scotch Egg', 'Hard-boiled egg wrapped in sausage meat and breadcrumbs', 1000.00, 'https://images.unsplash.com/photo-1535920527002-b35e96722eb9?w=400', 4, 30),
('Puff Puff (Bag)', 'Deep-fried dough balls, light and airy', 1500.00, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400', 4, 50),
('Chin Chin (Large)', 'Crunchy fried dough snacks', 2500.00, 'https://images.unsplash.com/photo-1571506504933-40e10cc04af1?w=400', 4, 35),
('Cupcake Assortment', 'Box of 6 mixed flavor cupcakes', 6000.00, 'https://images.unsplash.com/photo-1519340333755-56e9c1d04579?w=400', 1, 15);