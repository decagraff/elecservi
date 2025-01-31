const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
}).promise();

const normalizeText = (text) => {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^\w\s]/gi, '');
};

const getAnswer = async (question) => {
    const normalizedQuestion = normalizeText(question);

    try {
        const [rows] = await pool.query(
            'SELECT answer FROM faq WHERE LOWER(REPLACE(REPLACE(REPLACE(question, "á", "a"), "é", "e"), "í", "i")) LIKE ?',
            [`%${normalizedQuestion}%`]
        );

        if (rows.length > 0) {
            return rows[0].answer;
        } else {
            return 'Lo siento, no tengo una respuesta para esa pregunta.';
        }
    } catch (error) {
        console.error('Error en getAnswer:', error);
        throw error;
    }
};

const getSuggestions = async (query) => {
    const normalizedQuery = normalizeText(query);

    try {
        const [rows] = await pool.query(
            'SELECT question FROM faq WHERE LOWER(REPLACE(REPLACE(REPLACE(question, "á", "a"), "é", "e"), "í", "i")) LIKE ? LIMIT 5',
            [`%${normalizedQuery}%`]
        );

        return rows.map(row => row.question);
    } catch (error) {
        console.error('Error en getSuggestions:', error);
        throw error;
    }
};

module.exports = { getAnswer, getSuggestions };