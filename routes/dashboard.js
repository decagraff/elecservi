const express = require('express');
const path = require('path'); // Asegúrate de importar el módulo 'path'
const router = express.Router();

// Ruta para el dashboard de administrador
router.get('/admin', (req, res) => {
    if (req.session.role !== 'admin') {
        return res.redirect('/dashboard/user');
    }
    res.sendFile(path.join(__dirname, '../views/dashboard-admin.html')); // Corrige la ruta
});

// Ruta para el dashboard de usuario
router.get('/user', (req, res) => {
    if (req.session.role !== 'user') {
        return res.redirect('/dashboard/admin');
    }
    res.sendFile(path.join(__dirname, '../views/dashboard-user.html')); // Corrige la ruta
});

module.exports = router;