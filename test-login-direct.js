const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function testLogin() {
    const pool = await mysql.createPool({
        host:     process.env.DB_HOST,
        user:     process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        const email = 'emmanuelwilson630@gmail.com';
        const password = 'Doubra18me';
        console.log('Fetching user...');
        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        
        let out = { users_length: users.length };
        
        if (users.length > 0) {
            const user = users[0];
            out.user = user;
            out.isMatchError = null;
            try {
                out.isMatch = await bcrypt.compare(password, user.password || '');
            } catch (e) {
                out.isMatchError = e.message;
            }
        }
        
        fs.writeFileSync('test-output.json', JSON.stringify(out, null, 2));
        console.log('Done.');
    } catch(err) {
        fs.writeFileSync('test-output.json', JSON.stringify({ error: err.stack }, null, 2));
    } finally {
        await pool.end();
    }
}

testLogin();
