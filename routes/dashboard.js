const express = require('express');
const router = express.Router();
const path = require('path'); // Importa el módulo 'path' para manejar rutas de archivos

// Middleware para verificar si el usuario está autenticado
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
};

// Ruta del dashboard para administradores
router.get('/admin', isAuthenticated, (req, res) => {
    if (req.session.user.role === 'admin') {
        res.sendFile(path.join(__dirname, '../views/dashboard-admin.html')); // Usa path.join para construir la ruta
    } else {
        res.status(403).send('Acceso denegado');
    }
});

// Ruta del dashboard para usuarios
router.get('/user', isAuthenticated, (req, res) => {
    if (req.session.user.role === 'user') {
        res.sendFile(path.join(__dirname, '../views/dashboard-user.html')); // Usa path.join para construir la ruta
    } else {
        res.status(403).send('Acceso denegado');
    }
});

module.exports = router;