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

// ── Auto-migration: runs on every startup, safe to run multiple times ──
async function runMigrations() {
    try {
        // 1. Add role column if it doesn't exist
        await pool.execute(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS role ENUM('user','admin') NOT NULL DEFAULT 'user'
        `);
        console.log('✅ Migration: role column ready');

        // 2. Create admin user if not exists
        const ADMIN_NAME     = 'Emmanuel Yekwe';
        const ADMIN_EMAIL    = 'emmnuelwilsoon630@gmail.com';
        const ADMIN_PASSWORD = 'Doubra18me';

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
            console.log('ℹ️  Admin user already exists, skipping.');
        }
    } catch (err) {
        console.error('⚠️  Migration warning:', err.message);
    }
}

// Middleware
app.use(cors());
app.use(express.json());

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