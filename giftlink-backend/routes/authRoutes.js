// Step 1 - Task 2: Import necessary packages
const express = require('express');
const bcryptjs = require('bcryptjs'); // Para hash de senhas
const jwt = require('jsonwebtoken'); // Para tokens de autenticação
const { body, validationResult } = require('express-validator'); // Para validação de input (vamos usar a seguir)
const connectToDatabase = require('../models/db'); // Para conectar à base de dados
const router = express.Router(); // Cria uma instância do router do Express
const dotenv = require('dotenv'); // Para carregar variáveis de ambiente
const pino = require('pino'); // Importa Pino logger

// Carrega as variáveis de ambiente do ficheiro .env
dotenv.config();

// Step 1 - Task 3: Create a Pino logger instance
const logger = pino();

// Step 1 - Task 4: Create JWT authentication using the secret key from the .env file
const JWT_SECRET = process.env.JWT_SECRET;

// Verifica se o JWT_SECRET está definido
if (!JWT_SECRET) {
    logger.error('JWT_SECRET is not defined in the .env file');
    process.exit(1); // Sai da aplicação se a secret não estiver definida
}

// Rota de registo de utilizador
router.post('/register',
    // Adicionar validação com express-validator (Opcional para agora, mas bom para o futuro)
    [
        body('email', 'Please enter a valid email').isEmail(),
        body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
        body('firstName', 'First name is required').not().isEmpty(),
        body('lastName', 'Last name is required').not().isEmpty()
    ],
    async (req, res) => {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('Validation errors during registration attempt', { errors: errors.array() });
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Task 1: Connect to `giftsdb` in MongoDB through `connectToDatabase` in `db.js`
        const db = await connectToDatabase();

        // Task 2: Access MongoDB collection
        const collection = db.collection("users");

        // Task 3: Check for existing email
        const existingEmail = await collection.findOne({ email: req.body.email });

        if (existingEmail) {
            logger.warn(`Registration attempt with existing email: ${req.body.email}`);
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Gera o salt e hash da senha
        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);

        // Task 4: Save user details in database
        const newUser = await collection.insertOne({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hash, // Guarda a senha hashada
            createdAt: new Date(),
        });

        // Task 5: Create JWT authentication with user._id as payload
        const payload = {
            user: {
                id: newUser.insertedId, // Usa newUser.insertedId para o ID do novo documento inserido
            },
        };

        const authtoken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Adicionado expiresIn por boa prática

        logger.info(`User registered successfully: ${req.body.email}`);
        res.json({ authtoken, email: req.body.email }); // Retorna o email também para consistência
    } catch (e) {
        logger.error(`Error during user registration: ${e.message}`);
        return res.status(500).send('Internal server error');
    }
});

module.exports = router;