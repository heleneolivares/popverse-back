import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDb } from '../config/db.js';

const isTest = process.env.NODE_ENV === 'test';
let db;

// Registrar un nuevo usuario
export const register = async (req, res) => {
    const { name, email, password } = req.body;
    db = await connectDb();

    try {
        let user;

        if (isTest) {
            user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        } else {
            const [result] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            user = result[0];
        }

        if (user) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        if (isTest) {
            await db.run(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                [name, email, hashedPassword]
            );
        } else {
            await db.query(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                [name, email, hashedPassword]
            );
        }

        res.status(201).json({ message: 'Usuario registrado correctamente' });
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Login de usuario
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!db) {
            db = await connectDb();
        }

        let user;

        if (isTest) {
            user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        } else {
            const [result] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            user = result[0];
        }

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ token });
    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Perfil del usuario autenticado
export const profile = async (req, res) => {
    const userId = req.user.id;

    try {
        let user;

        if (isTest) {
            user = await db.get(
                'SELECT id, name, email, role FROM users WHERE id = ?',
                [userId]
            );
        } else {
            const [result] = await db.query(
                'SELECT id, name, email, role FROM users WHERE id = ?',
                [userId]
            );
            user = result[0];
        }

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};
