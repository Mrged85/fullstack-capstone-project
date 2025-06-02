/*jshint esversion: 8 */ // Adicionado para suportar ES8 (const, let, arrow functions, async/await)
const express = require('express');
const router = express.Router();
const connectToDatabase = require('../models/db');

// Search for gifts
router.get('/', async (req, res, next) => {
    try {
        // Task 1: Connect to MongoDB using connectToDatabase database. Remember to use the await keyword and store the connection in `db`
        const db = await connectToDatabase(); // Conecta-se ao MongoDB

        const collection = db.collection("gifts");

        // Initialize the query object
        let query = {};

        // Task 2: Check if the name exists and is not empty
        // Use a hint: req.query.name && req.query.name.trim() !== ''
        if (req.query.name && req.query.name.trim() !== '') {
            query.name = { $regex: req.query.name, $options: "i" }; // Usando regex para correspondência parcial, insensível a maiúsculas/minúsculas
        }

        // Task 3: Add other filters to the query
        if (req.query.category) {
            query.category = req.query.category; // Adiciona filtro por categoria
        }
        if (req.query.condition) {
            query.condition = req.query.condition; // Adiciona filtro por condição
        }
        if (req.query.age_years) {
            // A dica para age_years já estava no seu código, está correto.
            query.age_years = { $lte: parseInt(req.query.age_years) }; // Filtro por idade (menor ou igual a)
        }

        // Task 4: Fetch filtered gifts using the find(query) method. Make sure to use await and store the result in the `gifts` constant
        const gifts = await collection.find(query).toArray(); // Busca os presentes com base no objeto de query

        res.json(gifts);
    } catch (e) {
        console.error('Error in search endpoint:', e); // Adicionado log de erro para este endpoint
        next(e);
    }
});

module.exports = router;