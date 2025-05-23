require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Já está correto
const pinoLogger = require('./logger');

const connectToDatabase = require('./models/db');
const {loadData} = require("./util/import-mongo/index");


const app = express();

app.use(cors()); 

const port = 3060;

// Connect to MongoDB; we just do this one time
connectToDatabase().then(() => {
    pinoLogger.info('Connected to DB');
})
    .catch((e) => console.error('Failed to connect to DB', e));


app.use(express.json());

// ADICIONA ESTA LINHA AQUI! (Já está correto para servir imagens)
// Esta linha permite ao Express servir ficheiros da pasta 'public'
app.use(express.static('public')); // Correto para servir a pasta 'public'

// Se as tuas imagens estiverem numa subpasta de 'public', como 'public/images',
// a linha abaixo (que costumava estar no teu código) é mais específica e pode ser preferível:
// app.use('/images', express.static(path.join(__dirname, 'public/images')));
// Se o teu `app.js` original tinha `path` e `app.use('/images', ...)` é melhor manter essa.
// Mas para já, `app.use(express.static('public'));` serve o conteúdo da raiz de 'public'.

// Route files
const giftRoutes = require('./routes/giftRoutes');
const searchRoutes = require('./routes/searchRoutes');


const pinoHttp = require('pino-http');
const logger = require('./logger');

app.use(pinoHttp({ logger }));

// Use Routes
app.use('/api/gifts', giftRoutes);
app.use('/api/search', searchRoutes);


// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
});

app.get("/",(req,res)=>{
    res.send("Inside the server")
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});