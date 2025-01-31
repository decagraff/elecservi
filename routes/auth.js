const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const path = require('path'); // Importa el módulo 'path' para manejar rutas de archivos

// Login
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html')); // Usa path.join para construir la ruta
});

router.post('/login', authController.login);

// Register
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/register.html')); // Usa path.join para construir la ruta
});

router.post('/register', authController.register);

// Logout
router.get('/logout', authController.logout);

module.exports = router;