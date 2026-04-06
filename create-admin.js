/**
 * create-admin.js
 * Run this script ONCE after deploying to create the admin account.
 * Usage: node create-admin.js
 *
 * You can change ADMIN_EMAIL and ADMIN_PASSWORD before running.
 */

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const ADMIN_NAME     = 'Emmanuel Yekwe';
const ADMIN_EMAIL    = 'emmnuelwilsoon630@gmail.com'; // ← change if desired
const ADMIN_PASSWORD = 'Doubra18me';             // ← CHANGE THIS before running!

async function createAdmin() {
    const pool = await mysql.createPool({
        host:     process.env.DB_HOST     || 'localhost',
        user:     process.env.DB_USER     || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME     || 'bakery_db',
    });

    try {
        // Check if admin already exists
        const [existing] = await pool.execute(
            'SELECT id FROM users WHERE email = ?',
            [ADMIN_EMAIL]
        );

        if (existing.length > 0) {
            console.log('⚠️  Admin user already exists with email:', ADMIN_EMAIL);
            await pool.end();
            return;
        }

        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

        await pool.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [ADMIN_NAME, ADMIN_EMAIL, hashedPassword, 'admin']
        );

        console.log('✅ Admin user created successfully!');
        console.log('   Email   :', ADMIN_EMAIL);
        console.log('   Password:', ADMIN_PASSWORD);
        console.log('   Role    : admin');
        console.log('\n⚠️  Please change the password after first login!');
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
    } finally {
        await pool.end();
    }
}

createAdmin();
