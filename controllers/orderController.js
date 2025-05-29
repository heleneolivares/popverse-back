import { connectDb } from '../config/db.js';

const isTest = process.env.NODE_ENV === 'test';
let db;

// Obtener todas las órdenes
export const getOrders = async (req, res) => {
    db = await connectDb();
    try {
        let orders;
        if (isTest) {
            orders = await db.all('SELECT * FROM orders');
        } else {
            const [rows] = await db.query('SELECT * FROM orders');
            orders = rows;
        }

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error al obtener órdenes:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Obtener una orden por ID
export const getOrder = async (req, res) => {
    const orderId = req.params.id;
    try {
        db = await connectDb();
        let orderDetails;
        if (isTest) {
            orderDetails = await db.all(
                'SELECT od.*, p.name, p.price, p.discount FROM order_details od JOIN products p ON od.product_id = p.id WHERE od.order_id = ?',
                [orderId]
            );
        } else {
            const [rows] = await db.query(
                'SELECT od.*, p.name, p.price, p.discount FROM order_details od JOIN products p ON od.product_id = p.id WHERE od.order_id = ?',
                [orderId]
            );
            orderDetails = rows;
        }

        if (!orderDetails || orderDetails.length === 0) {
            return res.status(404).json({ message: 'Detalles de la orden no encontrados' });
        }

        res.status(200).json(orderDetails);
    } catch (error) {
        console.error('Error al obtener orden:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Crear una nueva orden
export const createOrder = async (req, res) => {
    const { user_id, product_ids, total_price, status } = req.body;

    try {
        db = await connectDb();
        if (isTest) {
            await db.run(
                'INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)',
                [user_id, total_price, status]
            );
            // Aquí podrías manejar insertar detalles en tests si quieres
        } else {
            const [result] = await db.query(
                'INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)',
                [user_id, total_price, status]
            );
            const orderId = result.insertId;

            for (const product of product_ids) {
                const { product_id, quantity, price, discount = 0 } = product;
                const subtotal = quantity * price * (1 - discount / 100);
                await db.query(
                    'INSERT INTO order_details (order_id, product_id, quantity, subtotal) VALUES (?, ?, ?, ?)',
                    [orderId, product_id, quantity, subtotal]
                );
            }
        }

        res.status(201).json({ message: 'Orden creada correctamente' });
    } catch (error) {
        console.error('Error al crear orden:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Actualizar una orden
export const updateOrder = async (req, res) => {
    const orderId = req.params.id;
    const { total_price, status } = req.body;

    try {
        db = await connectDb();
        if (isTest) {
            await db.run(
                'UPDATE orders SET total = ?, status = ? WHERE id = ?',
                [total_price, status, orderId]
            );
        } else {
            await db.query(
                'UPDATE orders SET total = ?, status = ? WHERE id = ?',
                [total_price, status, orderId]
            );
        }

        res.status(200).json({ message: `Orden ${orderId} actualizada` });
    } catch (error) {
        console.error('Error al actualizar orden:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};
