// ==================================
// routes/dashboard.js
// ==================================
const express = require('express');
const router = express.Router();
const pool = require('../db');
const serviceController = require('../controllers/serviceController');
const profileController = require('../controllers/profileController');

// Middleware de autenticación específico para el dashboard
const dashboardAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }   
    next();
};

router.use(dashboardAuth);

// Rutas del perfil
router.get('/profile', profileController.showProfilePage);
router.post('/profile/update', profileController.updateProfile);

// Ruta para el dashboard de usuario
router.get('/user', async (req, res) => {
    if (req.session.user.role !== 'user') {
        return res.redirect('/dashboard/admin');
    }

    try {
        const userId = req.session.user.id;

        // Fetch active services
        const [activeServices] = await pool.query(`
            SELECT 
                s.name, 
                so.progress_percentage as progress,
                'bolt' as icon
            FROM service_orders so
            JOIN services s ON so.service_id = s.id
            WHERE so.user_id = ? AND so.status NOT IN ('completed', 'cancelled')
        `, [userId]);

        // Fetch recent services
        const [recentServices] = await pool.query(`
            SELECT 
                s.name, 
                so.created_at as date, 
                so.status, 
                so.total_amount as amount
            FROM service_orders so
            JOIN services s ON so.service_id = s.id
            WHERE so.user_id = ?
            ORDER BY so.created_at DESC
            LIMIT 3
        `, [userId]);

        // Fetch available services
        const [availableServices] = await pool.query(`
            SELECT id, name, description, 
                   CAST(base_price AS DECIMAL(10,2)) as base_price
            FROM services
        `);

        // Recent Activity
        const [recentActivity] = await pool.query(`
            SELECT 'shopping-cart' as type, 
                   CONCAT('Venta completada: S/', ROUND(total_amount, 2)) as title,
                   TIMESTAMPDIFF(HOUR, created_at, NOW()) as time
            FROM service_orders
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 3
        `, [userId]);

        res.render('dashboard/user', {
            title: 'Dashboard Usuario | Electro Servicios Chávez',
            user: req.session.user,
            currentPage: 'dashboard',
            availableServices: availableServices.map(service => ({
                ...service,
                base_price: parseFloat(service.base_price).toFixed(2)
            })),
            activeServices: activeServices,
            recentServices: recentServices.map(service => ({
                name: service.name,
                date: formatDate(service.date),
                status: getStatusText(service.status),
                amount: parseFloat(service.amount).toFixed(2)
            })),
            recentActivity: recentActivity.map(activity => ({
                ...activity,
                time: `${activity.time} horas`
            })),
            stylesheets: '/css/dashboard.css'
        });
    } catch (error) {
        console.error('Error fetching user dashboard data:', error);
        res.status(500).send('Error interno del servidor');
    }
});

router.get('/services', serviceController.showServicesPage);

// Helper functions
const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString('es-PE') : 'Fecha no disponible';
};

const getStatusText = (status) => {
    const statusMap = {
        'pending': 'Pendiente',
        'in_progress': 'En Progreso',
        'completed': 'Completado',
        'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
};

module.exports = router;