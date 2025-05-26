const express = require('express');
// const app = express(); // <-- REMOVIDA: esta linha é redundante aqui
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator'); // Importado e agora será usado
const connectToDatabase = require('../models/db');
const router = express.Router();
const dotenv = require('dotenv');
const pino = require('pino');  // Import Pino logger

const logger = pino();  // Create a Pino logger instance

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

router.post(
    '/register',
    [ // <-- Middleware de validação adicionado aqui
        body('email').isEmail().withMessage('Por favor, insira um email válido.'),
        body('password').isLength({ min: 6 }).withMessage('A password deve ter pelo menos 6 caracteres.'),
        body('firstName').notEmpty().withMessage('O nome próprio não pode estar vazio.'),
        body('lastName').notEmpty().withMessage('O apelido não pode estar vazio.')
    ],
    async (req, res) => {
        // Verifica se há erros de validação
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.warn('Validation errors during registration attempt', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const db = await connectToDatabase();
            const collection = db.collection("users");

            // Task 3: Check for existing email
            const existingEmail = await collection.findOne({ email: req.body.email });
            if (existingEmail) {
                logger.warn(`Registration attempt with existing email: ${req.body.email}`);
                return res.status(400).json({ error: "Este email já está registado. Por favor, use outro." });
            }

            const salt = await bcryptjs.genSalt(10);
            const hash = await bcryptjs.hash(req.body.password, salt);

            // Task 4: Save user details in database
            const newUser = await collection.insertOne({
                email: req.body.email,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                password: hash,
                createdAt: new Date(),
            });

            const payload = {
                user: {
                    id: newUser.insertedId,
                },
            };

            const authtoken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Adicionado expiresIn por segurança
            logger.info('User registered successfully');
            res.status(201).json({ authtoken, email: req.body.email }); // Retorna o email e status 201 (Created)
        } catch (e) {
            logger.error('Error during user registration:', e); // Agora loga o erro 'e'
            return res.status(500).send('Internal server error');
        }
    }
);

// MÓDULO DE LOGIN (Adicional, para completares a funcionalidade)
router.post(
    '/login',
    [ // Validação para o login
        body('email').isEmail().withMessage('Por favor, insira um email válido.'),
        body('password').notEmpty().withMessage('A password é obrigatória.')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.warn('Validation errors during login attempt', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const db = await connectToDatabase();
            const collection = db.collection("users");

            const { email, password } = req.body;

            // 1. Procurar o utilizador pelo email
            const user = await collection.findOne({ email });
            if (!user) {
                logger.warn(`Login attempt with non-existent email: ${email}`);
                return res.status(400).json({ error: 'Credenciais inválidas.' });
            }

            // 2. Comparar a password fornecida com a password hash na DB
            const isMatch = await bcryptjs.compare(password, user.password);
            if (!isMatch) {
                logger.warn(`Login attempt with incorrect password for user: ${email}`);
                return res.status(400).json({ error: 'Credenciais inválidas.' });
            }

            // 3. Gerar JWT
            const payload = {
                user: {
                    id: user._id, // Usar _id do MongoDB
                },
            };

            const authtoken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
            logger.info(`User logged in successfully: ${email}`);
            res.json({ authtoken, email: user.email });

        } catch (e) {
            logger.error('Error during user login:', e);
            res.status(500).send('Internal server error');
        }
    }
);

module.exports = router;