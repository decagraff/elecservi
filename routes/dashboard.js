const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

// Ruta para el dashboard de administrador
router.get('/admin', (req, res) => {
    if (req.session.role !== 'admin') {
        return res.redirect('/dashboard/user');
    }

    res.render('dashboard/admin', {
        title: 'Dashboard Admin | Electro Servicios Chávez',
        user: req.session.user,
        currentPage: 'dashboard',
        services: [
            {
                name: 'Instalación de Tablero',
                date: '15/01/2025',
                status: 'completed',
                amount: 450
            },
            {
                name: 'Mantenimiento General',
                date: '10/01/2025',
                status: 'completed',
                amount: 300
            },
            {
                name: 'Revisión Eléctrica',
                date: '05/01/2025',
                status: 'completed',
                amount: 250
            }
        ],
        recentClients: [
            { name: 'María López', time: '2 horas' },
            { name: 'Carlos Ruiz', time: '5 horas' },
            { name: 'Ana García', time: '8 horas' }
        ],
        recentActivity: [
            { type: 'shopping-cart', title: 'Venta completada: S/850', time: '4 horas' },
            { type: 'tools', title: 'Servicio finalizado: Instalación', time: '6 horas' },
            { type: 'clipboard-check', title: 'Mantenimiento programado', time: '8 horas' }
        ],
        stylesheets: '/css/dashboard.css'
    });
});

// Ruta para el dashboard de usuario
router.get('/user', (req, res) => {
    if (req.session.role !== 'user') {
        return res.redirect('/dashboard/admin');
    }

    res.render('dashboard/user', {
        title: 'Dashboard Usuario | Electro Servicios Chávez',
        user: req.session.user,
        currentPage: 'dashboard',
        activeServices: [
            {
                name: 'Instalación Eléctrica',
                progress: 75,
                icon: 'bolt'
            },
            {
                name: 'Mantenimiento',
                progress: 40,
                icon: 'wrench'
            }
        ],
        recentServices: [
            {
                name: 'Instalación de Tablero',
                date: '15/01/2025',
                status: 'completed',
                amount: 450
            },
            {
                name: 'Mantenimiento General',
                date: '10/01/2025',
                status: 'completed',
                amount: 300
            },
            {
                name: 'Revisión Eléctrica',
                date: '05/01/2025',
                status: 'completed',
                amount: 250
            }
        ],
        recentActivity: [  // Agregar aquí la variable recentActivity
            { type: 'shopping-cart', title: 'Venta completada: S/850', time: '4 horas' },
            { type: 'tools', title: 'Servicio finalizado: Instalación', time: '6 horas' },
            { type: 'clipboard-check', title: 'Mantenimiento programado', time: '8 horas' }
        ],
        stylesheets: '/css/dashboard.css'
    });
});

router.get('/services', serviceController.showServicesPage);

module.exports = router;



