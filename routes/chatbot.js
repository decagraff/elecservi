const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// Ruta para manejar las preguntas del chatbot
router.post('/ask', chatbotController.askQuestion);

// Ruta para obtener sugerencias de preguntas
router.get('/suggestions', chatbotController.getSuggestions);

module.exports = router;