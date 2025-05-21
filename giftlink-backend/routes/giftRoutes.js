const express = require('express');
const router = express.Router();
const connectToDatabase = require('../models/db'); // Certifica-te que esta linha está aqui

router.get('/', async (req, res) => {
    try {
        // Task 1: Connect to MongoDB and store connection to db constant
        const db = await connectToDatabase(); // Usa a função importada para conectar

        // Task 2: use the collection() method to retrieve the gift collection
        const collection = db.collection("gifts"); // Obtém a coleção 'gifts'

        // Task 3: Fetch all gifts using the collection.find method. Chain with toArray method to convert to JSON array
        const gifts = await collection.find({}).toArray(); // Busca todos os presentes e converte para array

        // Task 4: return the gifts using the res.json method
        res.json(gifts); // Retorna os presentes como JSON
    } catch (e) {
        console.error('Error fetching gifts:', e);
        res.status(500).send('Error fetching gifts');
    }
});

router.get('/:id', async (req, res) => {
    try {
        // Task 1: Connect to MongoDB and store connection to db constant
        const db = await connectToDatabase(); // Conecta-se ao MongoDB

        // Task 2: use the collection() method to retrieve the gift collection
        const collection = db.collection("gifts"); // Obtém a coleção 'gifts'

        const id = req.params.id;

        // Task 3: Find a specific gift by ID using the collection.findOne method and store in constant called gift
        const gift = await collection.findOne({ id: id }); // Busca um presente pelo campo 'id'

        if (!gift) {
            return res.status(404).send('Gift not found');
        }

        res.json(gift);
    } catch (e) {
        console.error('Error fetching gift:', e);
        res.status(500).send('Error fetching gift');
    }
});

// Add a new gift
router.post('/', async (req, res, next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("gifts");
        // O método insertOne retorna um objeto Result, para obter o documento inserido
        // geralmente acedemos a result.insertedId (para o _id) ou, se for um array de objetos, result.ops
        // O `req.body` já deve conter o objeto do presente a ser inserido.
        const result = await collection.insertOne(req.body); 
        
        // Verifica se a inserção foi bem-sucedida e retorna o documento inserido
        if (result.acknowledged && result.insertedId) {
            // Para obter o documento completo inserido, uma abordagem comum é encontrá-lo
            // ou assumir que req.body é o documento e adicionar o _id gerado.
            // A sua versão original usava `gift.ops[0]`, que é comum em versões mais antigas do MongoDB Node.js driver.
            // Para versões mais recentes, pode ser preciso adaptar. Se `req.body` for o documento, 
            // e o `_id` gerado não for adicionado automaticamente, pode adicioná-lo:
            const newGift = { _id: result.insertedId, ...req.body };
            res.status(201).json(newGift);
        } else {
            res.status(500).send('Failed to add gift');
        }
    } catch (e) {
        console.error('Error adding gift:', e); // Adicionei um console.error aqui também
        next(e);
    }
});

module.exports = router;