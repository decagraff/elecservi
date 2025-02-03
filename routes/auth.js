const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// Ruta para mostrar el formulario de login
router.get('/login', (req, res) => {
    res.render('login', {
        title: 'Iniciar Sesión - Electro Servicios Chávez SAC',
        currentPage: 'login',
        stylesheets: '../css/styles.css',  // Añadido
        user: req.session.user || null
    });
});

// Ruta para procesar el login
router.post('/login', authController.login);

// Ruta para mostrar el formulario de registro
router.get('/register', (req, res) => {
    res.render('register', {
        title: 'Registro - Electro Servicios Chávez SAC',
        stylesheets: '../css/styles.css',  // Añadido
        user: req.session.user || null
    });
});

// Ruta para procesar el registro
router.post('/register', authController.register);

// Ruta para cerrar sesión
router.get('/logout', authController.logout);

module.exports = router;