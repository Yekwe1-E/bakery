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

        return { success: true, message: 'Setup complete. Admin ready.' };
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