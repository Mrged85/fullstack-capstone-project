/*jshint esversion: 8 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pinoLogger = require('./logger');
const path = require('path');

const connectToDatabase = require('./models/db');

const app = express();

const port = 3060;

// ✅ CORS com todas as tuas possíveis origens
app.use(cors({
    origin: [
        'https://goncalodamas-3000.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai',
        'https://goncalodamas-3000.theiaopenshiftnext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai',
        'https://goncalodamas-3000.theiaopenshiftnext-1-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai',
        'http://localhost:3000'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
}));

// Conexão à base de dados
connectToDatabase()
    .then(() => {
        pinoLogger.info('Connected to DB');
    })
    .catch((e) => {
        pinoLogger.error('Failed to connect to DB', e);
        process.exit(1);
    });

app.use(express.json());

// Servir imagens estáticas
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use(express.static('public'));

// Logger de requisições
const pinoHttp = require('pino-http');
app.use(pinoHttp({ logger: pinoLogger }));

// Rotas
const giftRoutes = require('./routes/giftRoutes');
const authRoutes = require('./routes/authRoutes');
const searchRoutes = require('./routes/searchRoutes');

app.use('/api/gifts', giftRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);

// Tratamento de erros
app.use((err, req, res, next) => {
    pinoLogger.error(err);
    res.status(500).send('Internal Server Error');
});

// Rota de teste
app.get("/", (req, res) => {
    res.send("Inside the server");
});

// Logging manual das rotas
app.use((req, res, next) => {
    pinoLogger.info(`Request: ${req.method} ${req.url}`);
    next();
});

// Lançar o servidor
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    pinoLogger.info(`Server running on port ${port}`);
});