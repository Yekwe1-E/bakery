const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

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

        res.status(201).json({
            message: 'Order placed successfully',
            orderId,
            total
        });

    } catch (error) {
        await connection.rollback();
        console.error('Order error:', error);
        res.status(500).json({ message: 'Error creating order' });
    } finally {
        connection.release();
    }
});

// Get user orders
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

module.exports = router;