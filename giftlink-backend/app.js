require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pinoLogger = require('./logger');
const path = require('path'); // <-- Adiciona esta importação para 'path'

const connectToDatabase = require('./models/db');
// const {loadData} = require("./util/import-mongo/index"); // Comentei esta linha, a menos que a estejas a usar para algo específico neste app.js


const app = express();

// Configuração do CORS: Temporariamente, permitindo qualquer origem para diagnóstico.
// ***** IMPORTANTE: ISTO NÃO É SEGURO PARA PRODUÇÃO. APENAS PARA TESTE. *****
app.use(cors({
    origin: '*', // <--- ALTERADO AQUI! Permite todas as origens.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
}));
const port = 3060;

// Connect to MongoDB; we just do this one time
connectToDatabase().then(() => {
    pinoLogger.info('Connected to DB');
})
    .catch((e) => pinoLogger.error('Failed to connect to DB', e)); // Use pinoLogger para logar erros aqui


app.use(express.json());

// Esta linha permite ao Express servir ficheiros da pasta 'public/images' sob o prefixo /images
app.use('/images', express.static(path.join(__dirname, 'public/images')));
// Esta linha serve outros ficheiros estáticos diretamente da raiz da pasta 'public' (se existirem)
app.use(express.static('public'));

// Route files
const giftRoutes = require('./routes/giftRoutes');
const searchRoutes = require('./routes/searchRoutes');
const authRoutes = require('./routes/authRoutes'); // <-- ADICIONA ESTA LINHA: Importa as rotas de autenticação


const pinoHttp = require('pino-http');
const logger = require('./logger'); // Certifica-te que este 'logger' é a instância que queres usar para HTTP logs

app.use(pinoHttp({ logger }));

// Use Routes
app.use('/api/gifts', giftRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/auth', authRoutes); // <-- ADICIONA ESTA LINHA: Integra as rotas de autenticação sob '/api/auth'


// Global Error Handler
app.use((err, req, res, next) => {
    pinoLogger.error(err); // <-- Mudei de console.error para pinoLogger.error
    res.status(500).send('Internal Server Error');
});

app.get("/",(req,res)=>{
    res.send("Inside the server")
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});