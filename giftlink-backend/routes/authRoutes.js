const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator'); // Já está aqui, bom!
const connectToDatabase = require('../models/db');
const router = express.Router();
const dotenv = require('dotenv');
const pino = require('pino');

const logger = pino(); // Create a Pino logger instance

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Rota de Registo
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
            res.status(201).json({ authtoken, email: req.body.email, firstName: req.body.firstName, lastName: req.body.lastName });
        } catch (e) {
            logger.error('Error during user registration:', e);
            return res.status(500).send('Internal server error');
        }
    }
);

// MÓDULO DE LOGIN
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

            const theUser = await collection.findOne({ email });
            if (!theUser) {
                logger.warn(`Login attempt with non-existent email: ${email}`);
                return res.status(404).json({ error: 'User not found' });
            }

            let result = await bcryptjs.compare(password, theUser.password);
            if (!result) {
                logger.warn(`Login attempt with incorrect password for user: ${email}`);
                return res.status(400).json({ error: 'Wrong password' });
            }

            const userName = theUser.firstName;
            const userEmail = theUser.email;

            const payload = {
                user: {
                    id: theUser._id.toString(),
                },
            };

            const authtoken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
            logger.info(`User logged in successfully: ${userEmail}`);
            res.json({ authtoken, userName, userEmail });

        } catch (e) {
            logger.error('Error during user login:', e);
            res.status(500).send('Internal server error');
        }
    }
);

// NOVO ENDPOINT: /update
router.put(
    '/update',
    [
        // Validação para os campos que podem ser atualizados
        body('firstName').optional().notEmpty().withMessage('O nome próprio não pode estar vazio.'),
        body('lastName').optional().notEmpty().withMessage('O apelido não pode estar vazio.'),
        body('password').optional().isLength({ min: 6 }).withMessage('A password deve ter pelo menos 6 caracteres.'),
        // Adiciona validações para outros campos que permitas atualizar, se aplicável
    ],
    async (req, res) => {
        // Tarefa 2: Validar o input usando `validationResult` e retornar a mensagem apropriada se houver um erro.
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.error('Validation errors in update request', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            // Tarefa 3: Verificar se `email` está presente no cabeçalho e lançar uma mensagem de erro apropriada se não estiver presente.
            const email = req.headers.email; // O email do utilizador a atualizar vem no header

            if (!email) {
                logger.error('Email not found in the request headers for update');
                return res.status(400).json({ error: "Email not found in the request headers" });
            }

            // Tarefa 4: Conectar ao MongoDB
            const db = await connectToDatabase();
            const collection = db.collection("users");

            // Tarefa 5: Encontrar as credenciais do utilizador na base de dados
            let existingUser = await collection.findOne({ email });

            if (!existingUser) {
                logger.error(`User not found for update: ${email}`);
                return res.status(404).json({ error: "User not found" });
            }

            // Construir o objeto com os campos a serem atualizados
            const updateFields = {};
            if (req.body.firstName) updateFields.firstName = req.body.firstName;
            if (req.body.lastName) updateFields.lastName = req.body.lastName;
            if (req.body.password) {
                // Encriptar a nova password se for fornecida
                const salt = await bcryptjs.genSalt(10);
                updateFields.password = await bcryptjs.hash(req.body.password, salt);
            }
            // Garantir que createdAt existe (útil se o schema mudar) e atualizar updatedAt
            if (!existingUser.createdAt) {
                updateFields.createdAt = existingUser.createdAt || new Date();
            }
            updateFields.updatedAt = new Date(); // Definir/atualizar a data de atualização

            // Tarefa 6: Atualizar as credenciais do utilizador na base de dados
            const updatedDocument = await collection.findOneAndUpdate(
                { email }, // Filtro para encontrar o utilizador
                { $set: updateFields }, // Campos a serem atualizados
                { returnDocument: 'after' } // Retorna o documento após a atualização
            );

            // Verificar se a atualização foi bem-sucedida
            if (!updatedDocument.value) {
                logger.error(`Failed to update user: ${email}`);
                return res.status(500).json({ error: "Failed to update user" });
            }

            // Tarefa 7: Criar autenticação JWT com user._id como payload usando a chave secreta do ficheiro .env
            const payload = {
                user: {
                    id: updatedDocument.value._id.toString(), // Usar o ID do documento atualizado
                },
            };

            const authtoken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Token válido por 1 hora

            logger.info(`User profile updated successfully: ${email}`);
            // Retorna o novo token e os detalhes atualizados do utilizador
            res.json({
                authtoken,
                userName: updatedDocument.value.firstName, // Devolve o nome atualizado
                userEmail: updatedDocument.value.email // Devolve o email (que não é alterado por esta rota)
            });

        } catch (e) {
            logger.error('Error during user profile update:', e);
            return res.status(500).send('Internal server error');
        }
    }
);

module.exports = router;