require('dotenv').config();
const express = require('express');
const axios = require('axios'); // Axios pode não ser estritamente necessário para este ficheiro se não estiveres a fazer requisições HTTP a partir dele
const logger = require('./logger');
const expressPino = require('express-pino-logger')({ logger });
// Task 1: import the natural library
const natural = require("natural"); // <-- Adicionado aqui

// Task 2: initialize the express server
const app = express(); // <-- Adicionado aqui
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(expressPino);

// Define the sentiment analysis route
// Task 3: create the POST /sentiment analysis
app.post('/sentiment', async (req, res) => { // <-- Adicionado aqui

    // Task 4: extract the sentence parameter
    // A dica original é para req.query, mas o código de template usa req.body e POST, o que é mais comum.
    // Vamos assumir que a frase virá no corpo da requisição POST como { "sentence": "..." }
    const { sentence } = req.body; // <-- Adicionado aqui (assumindo req.body para POST)


    if (!sentence) {
        logger.error('No sentence provided');
        return res.status(400).json({ error: 'No sentence provided' });
    }

    // Initialize the sentiment analyzer with the Natural's PorterStemmer and "English" language
    const Analyzer = natural.SentimentAnalyzer;
    const stemmer = natural.PorterStemmer;
    const analyzer = new Analyzer("English", stemmer, "afinn"); // "afinn" é um dicionário comum para análise de sentimento

    // Perform sentiment analysis
    try {
        const analysisResult = analyzer.getSentiment(sentence.split(' '));

        let sentiment = "neutral";

        // Task 5: set sentiment to negative or positive based on score rules
        if (analysisResult < 0) { // Se a pontuação for menor que 0
            sentiment = "negative";
        } else if (analysisResult > 0.33) { // Se a pontuação for maior que 0.33
            sentiment = "positive";
        }
        // Se a pontuação for entre 0 e 0.33, mantém "neutral" (que é o valor padrão)

        // Logging the result
        logger.info(`Sentiment analysis result for "${sentence}": ${analysisResult}, Sentiment: ${sentiment}`); // Adicionei a frase ao log para contexto

        // Task 6: send a status code of 200 with both sentiment score and the sentiment txt in the format { sentimentScore: analysisResult, sentiment: sentiment }
        res.status(200).json({ sentimentScore: analysisResult, sentiment: sentiment }); // <-- Adicionado aqui
    } catch (error) {
        logger.error(`Error performing sentiment analysis: ${error.message}`); // Usar error.message para logs mais limpos
        // Task 7: if there is an error, return a HTTP code of 500 and the json {'message': 'Error performing sentiment analysis'}
        res.status(500).json({ message: 'Error performing sentiment analysis' }); // <-- Adicionado aqui
    }
});

app.listen(port, () => {
    logger.info(`Sentiment Analysis Server running on port ${port}`); // Mensagem de log mais específica
});