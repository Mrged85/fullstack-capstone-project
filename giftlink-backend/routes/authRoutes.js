const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const connectToDatabase = require('../models/db');
const router = express.Router();
const dotenv = require('dotenv');
const pino = require('pino');

const logger = pino(); // Create a Pino logger instance

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Rota de Registo (mantida igual à tua versão otimizada)
router.post(
    '/register',
    [
        body('email').isEmail().withMessage('Por favor, insira um email válido.'),
        body('password').isLength({ min: 6 }).withMessage('A password deve ter pelo menos 6 caracteres.'),
        body('firstName').notEmpty().withMessage('O nome próprio não pode estar vazio.'),
        body('lastName').notEmpty().withMessage('O apelido não pode estar vazio.')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.warn('Validation errors during registration attempt', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const db = await connectToDatabase();
            const collection = db.collection("users");

            const existingEmail = await collection.findOne({ email: req.body.email });
            if (existingEmail) {
                logger.warn(`Registration attempt with existing email: ${req.body.email}`);
                return res.status(400).json({ error: "Este email já está registado. Por favor, use outro." });
            }

            const salt = await bcryptjs.genSalt(10);
            const hash = await bcryptjs.hash(req.body.password, salt);

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

            const authtoken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
            logger.info('User registered successfully');
            // Retorna também firstName e lastName para o frontend, conforme o que o frontend espera na sessionStorage
            res.status(201).json({ authtoken, email: req.body.email, firstName: req.body.firstName, lastName: req.body.lastName });
        } catch (e) {
            logger.error('Error during user registration:', e);
            return res.status(500).send('Internal server error');
        }
    }
);

// MÓDULO DE LOGIN - Step 1: Implement the /login Endpoint (Corrigido)
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
            // Task 1: Connect to `giftsdb` in MongoDB through `connectToDatabase` in `db.js`.
            const db = await connectToDatabase();
            // Task 2: Access MongoDB `users` collection
            const collection = db.collection("users");

            const { email, password } = req.body;

            // Task 3: Check for user credentials in database
            // Task 7: Send appropriate message if user not found (ajustado para status 404 e mensagem do hint)
            const theUser = await collection.findOne({ email });
            if (!theUser) {
                logger.warn(`Login attempt with non-existent email: ${email}`);
                return res.status(404).json({ error: 'User not found' }); // Mensagem do hint
            }

            // Task 4: Check if the password matches the encrypted password and send appropriate message on mismatch
            let result = await bcryptjs.compare(password, theUser.password);
            if (!result) {
                logger.warn(`Login attempt with incorrect password for user: ${email}`);
                return res.status(400).json({ error: 'Wrong password' }); // Mensagem do hint
            }

            // Task 5: Fetch user details from database
            const userName = theUser.firstName; // Obter o nome do utilizador para enviar ao frontend
            const userEmail = theUser.email;

            // Task 6: Create JWT authentication if passwords match with user._id as payload
            const payload = {
                user: {
                    id: theUser._id.toString(), // Converter ObjectId para string, conforme o hint
                },
            };

            const authtoken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
            logger.info(`User logged in successfully: ${userEmail}`);
            // Enviar authtoken, userName e userEmail para o frontend
            res.json({ authtoken, userName, userEmail });

        } catch (e) {
            logger.error('Error during user login:', e);
            res.status(500).send('Internal server error');
        }
    }
);

module.exports = router;