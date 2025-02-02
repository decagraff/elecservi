const express = require('express');
const path = require('path'); // Asegúrate de importar el módulo 'path'
const authController = require('../controllers/authController');
const router = express.Router();

// Ruta para mostrar el formulario de login
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html')); // Corrige la ruta
});

// Ruta para procesar el login
router.post('/login', authController.login);

// Ruta para mostrar el formulario de registro
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/register.html')); // Corrige la ruta
});

// Ruta para procesar el registro
router.post('/register', authController.register);

// Ruta para cerrar sesión
router.get('/logout', authController.logout);

module.exports = router;