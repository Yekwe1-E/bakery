const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const pool = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Admin credentials ──
const ADMIN_NAME     = 'Emmanuel Yekwe';
const ADMIN_EMAIL    = 'emmanuelwilson630@gmail.com';
const ADMIN_PASSWORD = 'Doubra18me';

// ── Safe migration: works on ALL MySQL versions ──
async function runMigrations() {
    try {
        // Check if role column already exists (compatible with all MySQL versions)
        const [cols] = await pool.execute(`
            SELECT COUNT(*) as count
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME   = 'users'
              AND COLUMN_NAME  = 'role'
        `);

        if (cols[0].count === 0) {
            await pool.execute(`
                ALTER TABLE users
                ADD COLUMN role ENUM('user','admin') NOT NULL DEFAULT 'user'
            `);
            console.log('✅ Migration: role column added');
        } else {
            console.log('ℹ️  Migration: role column already exists');
        }

        // Create admin if not exists
        const [existing] = await pool.execute(
            'SELECT id FROM users WHERE email = ?', [ADMIN_EMAIL]
        );

        if (existing.length === 0) {
            const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);
            await pool.execute(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                [ADMIN_NAME, ADMIN_EMAIL, hashed, 'admin']
            );
            console.log('✅ Admin user created:', ADMIN_EMAIL);
        } else {
            // Ensure the existing user has admin role
            await pool.execute(
                'UPDATE users SET role = ? WHERE email = ?',
                ['admin', ADMIN_EMAIL]
            );
            console.log('ℹ️  Admin user already exists — role enforced.');
        }

        // 3. Seed 20 New Products
        const newProducts = [
            ['Strawberry Shortcake', 'Light sponge cake with fresh strawberries and cream', 9500.00, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400', 1, 10],
            ['Lemon Drizzle Cake', 'Tangy lemon cake with sugar glaze', 7000.00, 'https://images.unsplash.com/photo-1519869325930-281384150729?w=400', 1, 12],
            ['Carrot Cake', 'Moist carrot cake with cream cheese frosting', 8000.00, 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400', 1, 8],
            ['Cheesecake', 'Creamy New York style cheesecake', 10500.00, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400', 1, 5],
            ['Black Forest Cake', 'Chocolate cake with cherries and whipped cream', 9000.00, 'https://images.unsplash.com/photo-1606313564200-e75d4e51062b?w=400', 1, 7],
            ['Whole Wheat Bread', 'Hearty 100% whole wheat bread', 1800.00, 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400', 2, 20],
            ['Baguette', 'Classic crusty French baguette', 1500.00, 'https://images.unsplash.com/photo-1485050022473-b3c66f577f8d?w=400', 2, 25],
            ['Ciabatta', 'Italian olive oil bread with airy texture', 2200.00, 'https://images.unsplash.com/photo-1598144819059-40842db1304b?w=400', 2, 15],
            ['Challah Bread', 'Traditional braided egg bread', 3000.00, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', 2, 10],
            ['Rye Bread', 'Dense and flavorful rye bread', 2500.00, 'https://images.unsplash.com/photo-1586414619472-762fdcd5101a?w=400', 2, 12],
            ['Pain au Chocolat', 'Buttery pastry with dark chocolate center', 1800.00, 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=400', 3, 30],
            ['Almond Croissant', 'Croissant filled with sweet almond cream', 2000.00, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', 3, 20],
            ['Cinnamon Roll', 'Soft roll with cinnamon and sugar glaze', 1500.00, 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=400', 3, 25],
            ['Fruit Tart', 'Crisp pastry shell with custard and fresh fruit', 3500.00, 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=400', 3, 10],
            ['Eclair', 'Choux pastry filled with cream and topped with chocolate', 2200.00, 'https://images.unsplash.com/photo-1621236304847-ef851b209e7a?w=400', 3, 15],
            ['Sausage Roll', 'Savory sausage meat wrapped in flaky pastry', 1200.00, 'https://images.unsplash.com/photo-1601050633647-81a3d9356396?w=400', 4, 40],
            ['Scotch Egg', 'Hard-boiled egg wrapped in sausage meat and breadcrumbs', 1000.00, 'https://images.unsplash.com/photo-1535920527002-b35e96722eb9?w=400', 4, 30],
            ['Puff Puff (Bag)', 'Deep-fried dough balls, light and airy', 1500.00, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400', 4, 50],
            ['Chin Chin (Large)', 'Crunchy fried dough snacks', 2500.00, 'https://images.unsplash.com/photo-1571506504933-40e10cc04af1?w=400', 4, 35],
            ['Cupcake Assortment', 'Box of 6 mixed flavor cupcakes', 6000.00, 'https://images.unsplash.com/photo-1519340333755-56e9c1d04579?w=400', 1, 15]
        ];

        for (const p of newProducts) {
            const [exists] = await pool.execute('SELECT id FROM products WHERE name = ?', [p[0]]);
            if (exists.length === 0) {
                await pool.execute(
                    'INSERT INTO products (name, description, price, image, category_id, stock) VALUES (?, ?, ?, ?, ?, ?)',
                    p
                );
            }
        }
        console.log('✅ Migration: Products seeded');

        return { success: true, message: 'Setup complete. Admin and 20+ products ready.' };
    } catch (err) {
        console.error('❌ Migration error:', err.message);
        return { success: false, message: err.message };
    }
}

// Middleware
app.use(cors());
app.use(express.json());

// ── Manual setup endpoint — visit this URL in browser if login fails ──
app.get('/api/setup', async (req, res) => {
    const result = await runMigrations();
    res.json(result);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Serve static files from root folder
app.use(express.static(path.join(__dirname, '..')));

// Handle all other routes by serving index.html (SPA behavior)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    await runMigrations();
});