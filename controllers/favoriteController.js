import { connectDb } from '../config/db.js';

const isTest = process.env.NODE_ENV === 'test';
let db;

// Obtener productos favoritos del usuario
export const getFavorites = async (req, res) => {
    db = await connectDb();
    const userId = req.user.id;

    try {
        let favorites;
        if (isTest) {
            favorites = await db.all('SELECT * FROM favorites WHERE user_id = ?', [userId]);
        } else {
            const [rows] = await db.query(
                'SELECT * FROM products WHERE id IN (SELECT product_id FROM favorites WHERE user_id = ?)',
                [userId]
            );
            favorites = rows;
        }

        res.status(200).json({ message: 'Favoritos del usuario', favorites });
    } catch (error) {
        console.error('Error al obtener favoritos:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Agregar un producto a favoritos
export const addFavorite = async (req, res) => {
    const { product_id } = req.body;
    const userId = req.user.id;

    try {
        if (isTest) {
            await db.run(
                'INSERT INTO favorites (user_id, product_id) VALUES (?, ?)',
                [userId, product_id]
            );
        } else {
            await db.query(
                'INSERT INTO favorites (user_id, product_id) VALUES (?, ?)',
                [userId, product_id]
            );
        }

        res.status(201).json({ message: 'Producto agregado a favoritos' });
    } catch (error) {
        console.error('Error al agregar producto a favoritos:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Eliminar un producto de favoritos
export const removeFavorite = async (req, res) => {
    const productId = req.params.product_id;
    const userId = req.user.id;

    try {
        if (isTest) {
            await db.run(
                'DELETE FROM favorites WHERE user_id = ? AND product_id = ?',
                [userId, productId]
            );
        } else {
            await db.query(
                'DELETE FROM favorites WHERE user_id = ? AND product_id = ?',
                [userId, productId]
            );
        }

        res.status(200).json({ message: `Producto ${productId} eliminado de favoritos` });
    } catch (error) {
        console.error('Error al eliminar producto de favoritos:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};
