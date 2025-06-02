/*jshint esversion: 8 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pinoLogger = require('./logger'); // Importa o logger principal
const path = require('path'); // Necessário para servir ficheiros estáticos

const connectToDatabase = require('./models/db');
// const {loadData} = require("./util/import-mongo/index"); // Removido se não for usado. Mantém se tiveres um script de loadData aqui.

const app = express();

// Configuração do CORS: Muito Importante para permitir comunicação entre o frontend e backend
// Usamos o URL exato do teu frontend para maior segurança, em vez de '*'.
// Este URL foi obtido da mensagem de erro CORS anterior.
app.use(cors({
    origin: 'https://goncalodamas-3000.theiaopenshiftnext-1-labs-prod-theiaopenshift-4-tor01.proxy.cognitiveclass.ai', // URL EXATO DO TEU FRONTEND
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
}));

const port = 3060;

// Connect to MongoDB; we just do this one time
connectToDatabase().then(() => {
    pinoLogger.info('Connected to DB');
})
.catch((e) => pinoLogger.error('Failed to connect to DB', e)); // Agora usando pinoLogger para erros

app.use(express.json()); // Middleware para fazer parse do JSON do corpo da requisição

// Configuração para servir ficheiros estáticos:
// - /images: serve ficheiros da pasta public/images (para imagens de presentes, etc.)
// - Raiz: serve outros ficheiros estáticos da pasta public (se existirem)
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use(express.static('public'));

// Middleware para logging de HTTP requests usando Pino
const pinoHttp = require('pino-http');
app.use(pinoHttp({ logger: pinoLogger })); // Usa a mesma instância do logger

// Route files
const giftRoutes = require('./routes/giftRoutes');
const authRoutes = require('./routes/authRoutes');
const searchRoutes = require('./routes/searchRoutes');

// Use Routes
app.use('/api/gifts', giftRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    pinoLogger.error(err); // Agora usando pinoLogger para o erro global
    res.status(500).send('Internal Server Error');
});

// **--- LINHAS CORRIGIDAS ABAIXO ---**
app.get("/",(req,res)=>{
    res.send("Inside the server"); // Adicionado ;
}); // Adicionado ;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    pinoLogger.info(`Server running on port ${port}`);
}); // Adicionado ;
// **--- LINHAS CORRIGIDAS ACIMA ---**