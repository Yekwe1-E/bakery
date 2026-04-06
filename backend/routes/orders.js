const express = require('express');
const { body, validationResult } = require('express-validator');
const axios = require('axios');
const pool = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Create order (protected route)
router.post('/', authMiddleware, [
    body('items').isArray({ min: 1 }).withMessage('At least one item required'),
    body('customer_name').trim().isLength({ min: 2 }),
    body('address').trim().isLength({ min: 5 }),
    body('phone').trim().isLength({ min: 10 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { items, customer_name, address, phone } = req.body;
    const userId = req.user.userId;

    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        // Calculate total
        let total = 0;
        for (const item of items) {
            const [products] = await connection.execute(
                'SELECT price FROM products WHERE id = ?', 
                [item.product_id]
            );
            if (products.length === 0) throw new Error(`Product ${item.product_id} not found`);
            total += products[0].price * item.quantity;
        }

        // Create order
        const [orderResult] = await connection.execute(
            'INSERT INTO orders (user_id, total, customer_name, address, phone) VALUES (?, ?, ?, ?, ?)',
            [userId, total, customer_name, address, phone]
        );

        const orderId = orderResult.insertId;

        // Add order items
        for (const item of items) {
            const [products] = await connection.execute(
                'SELECT price FROM products WHERE id = ?', 
                [item.product_id]
            );
            
            await connection.execute(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, products[0].price]
            );

            // Update stock
            await connection.execute(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
        }

        await connection.commit();

        // Get user email for Paystack
        const [user] = await pool.execute('SELECT email FROM users WHERE id = ?', [userId]);

        res.status(201).json({
            message: 'Order placed successfully',
            orderId,
            total,
            amountKobo: Math.round(total * 100),
            email: user[0].email,
            publicKey: process.env.PAYSTACK_PUBLIC_KEY
        });

    } catch (error) {
        await connection.rollback();
        console.error('Order error:', error);
        res.status(500).json({ message: 'Error creating order' });
    } finally {
        connection.release();
    }
});

// Get user orders (authenticated users)
router.get('/my-orders', authMiddleware, async (req, res) => {
    try {
        const [orders] = await pool.execute(`
            SELECT o.*, 
                   COUNT(oi.id) as item_count
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `, [req.user.userId]);

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// Verify Paystack payment
router.get('/verify/:reference', authMiddleware, async (req, res) => {
    const { reference } = req.params;

    // Demo Mode: Handle mock references if real keys are missing
    if (reference.startsWith('MOCK_REF_') && (!process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY.includes('xxxxxxxx'))) {
        try {
            const orderId = reference.split('_')[2];
            
            // Update order status to paid
            await pool.execute(
                'UPDATE orders SET status = "paid" WHERE id = ?',
                [orderId]
            );

            return res.json({ 
                message: 'Demo payment verified successfully (MOCK)', 
                status: 'success',
                demo: true 
            });
        } catch (error) {
            console.error('Demo verification error:', error);
            return res.status(500).json({ message: 'Error processing demo payment' });
        }
    }

    try {
        const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
                }
            }
        );

        if (response.data.status && response.data.data.status === 'success') {
            const orderId = response.data.data.metadata.order_id;
            
            // Update order status
            await pool.execute(
                'UPDATE orders SET status = "paid" WHERE id = ?',
                [orderId]
            );

            res.json({ message: 'Payment verified successfully', status: 'success' });
        } else {
            res.status(400).json({ message: 'Payment verification failed', status: 'failed' });
        }
    } catch (error) {
        console.error('Paystack verification error:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Error verifying payment' });
    }
});

// Admin: Get all orders
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const [orders] = await pool.execute(`
            SELECT o.*, u.name as user_name, u.email as user_email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `);
        res.json(orders);
    } catch (error) {
        console.error('Fetch all orders error:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// Admin: Update order status
router.put('/:id/status', authMiddleware, adminMiddleware, [
    body('status').isIn(['pending', 'paid', 'confirmed', 'delivered', 'cancelled', 'refunded'])
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    try {
        const [result] = await pool.execute(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ message: 'Order status updated successfully' });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ message: 'Error updating order status' });
    }
});

module.exports = router;