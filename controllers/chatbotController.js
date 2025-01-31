const chatbotModel = require('../models/chatbotModel');

const askQuestion = async (req, res) => {
    try {
        const { question } = req.body;

        // Verifica que la pregunta esté presente en el cuerpo de la solicitud
        if (!question) {
            return res.status(400).json({ error: 'La pregunta es requerida' });
        }

        console.log('Pregunta recibida:', question); // Depuración
        const answer = await chatbotModel.getAnswer(question);
        console.log('Respuesta encontrada:', answer); // Depuración

        res.json({ answer });
    } catch (error) {
        console.error('Error en askQuestion:', error); // Depuración
        res.status(500).json({ error: 'Error al procesar la pregunta' });
    }
};

const getSuggestions = async (req, res) => {
    try {
        const { query } = req.query;

        // Verifica que la consulta esté presente en los parámetros de la solicitud
        if (!query) {
            return res.status(400).json({ error: 'La consulta es requerida' });
        }

        console.log('Consulta para sugerencias:', query); // Depuración
        const suggestions = await chatbotModel.getSuggestions(query);
        console.log('Sugerencias encontradas:', suggestions); // Depuración

        res.json({ suggestions });
    } catch (error) {
        console.error('Error en getSuggestions:', error); // Depuración
        res.status(500).json({ error: 'Error al obtener sugerencias' });
    }
};

module.exports = { askQuestion, getSuggestions };