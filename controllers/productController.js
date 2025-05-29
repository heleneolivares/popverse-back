import { connectDb } from '../config/db.js';

const isTest = process.env.NODE_ENV === 'test';
let db;

// Obtener todos los productos
export const getProducts = async (req, res) => {
    db = await connectDb();
    try {
        let products;
        if (isTest) {
            products = await db.all('SELECT * FROM products');
        } else {
            const [rows] = await db.query('SELECT * FROM products'); // MySQL
            products = rows;
        }

        res.status(200).json(products);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Obtener un producto por ID
export const getProduct = async (req, res) => {
    const productId = req.params.id;

    try {
        db = await connectDb();
        let product;
        if (isTest) {
            product = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
        } else {
            const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
            product = rows[0];
        }

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Obtener imágenes extra
export const getProductExtra = async (req, res) => {
    const productId = req.params.id;

    try {
        db = await connectDb();
        let extra;
        if (isTest) {
            extra = await db.get('SELECT * FROM extras WHERE product_id = ?', [productId]);
        } else {
            const [rows] = await db.query('SELECT * FROM extras WHERE product_id = ?', [productId]);
            extra = rows[0];
        }

        if (!extra) {
            return res.status(404).json({ message: 'Extra no encontrado' });
        }

        res.status(200).json(extra);
    } catch (error) {
        console.error('Error al obtener extra:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Crear producto
export const createProduct = async (req, res) => {
    const { name, description, price } = req.body;

    try {
        db = await connectDb();
        if (isTest) {
            await db.run(
                'INSERT INTO products (name, description, price) VALUES (?, ?, ?)',
                [name, description, price]
            );
        } else {
            await db.query(
                'INSERT INTO products (name, description, price) VALUES (?, ?, ?)',
                [name, description, price]
            );
        }

        res.status(201).json({ message: 'Producto creado' });
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Actualizar producto
export const updateProduct = async (req, res) => {
    const productId = req.params.id;
    const { name, description, price } = req.body;

    try {
        db = await connectDb();
        if (isTest) {
            await db.run(
                'UPDATE products SET name = ?, description = ?, price = ? WHERE id = ?',
                [name, description, price, productId]
            );
        } else {
            await db.query(
                'UPDATE products SET name = ?, description = ?, price = ? WHERE id = ?',
                [name, description, price, productId]
            );
        }

        res.status(200).json({ message: `Producto ${productId} actualizado` });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Eliminar producto
export const deleteProduct = async (req, res) => {
    const productId = req.params.id;

    try {
        db = await connectDb();
        if (isTest) {
            await db.run('DELETE FROM products WHERE id = ?', [productId]);
        } else {
            await db.query('DELETE FROM products WHERE id = ?', [productId]);
        }

        res.status(200).json({ message: `Producto ${productId} eliminado` });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};
