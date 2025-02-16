// ==================================
// routes/dashboard.js
// ==================================
const express = require('express');
const router = express.Router();
const pool = require('../db');
const serviceController = require('../controllers/serviceController');
const profileController = require('../controllers/profileController');
const ordersController = require('../controllers/ordersController');
const clientController = require('../controllers/clientController');
const salesController = require('../controllers/salesController');
const reportsController = require('../controllers/reportsController');
const asservicesController = require('../controllers/asservicesController');


// Middleware de autenticación específico para el dashboard
const dashboardAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }   
    next();
};

// Middleware para verificar rol de admin
const adminAuth = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/dashboard/user');
    }
    next();
};

router.use(dashboardAuth);

// Rutas de aservice
router.get('/asservices', asservicesController.showServicesPage);
router.delete('/dashboard/asservices/delete/:id', asservicesController.deleteService);


// Rutas de reportes
router.get('/reports', adminAuth, reportsController.showReportsPage);
router.get('/reports/export', adminAuth, reportsController.exportReports);

// Rutas de Clients
router.get('/clients', adminAuth, clientController.showClientsPage);
router.get('/api/clients/:id', adminAuth, clientController.getClientDetails);

// Rutas de ventas
router.get('/sales', adminAuth, salesController.showSalesPage);


// Rutas del perfil
router.get('/profile', profileController.showProfilePage);
router.post('/profile/update', profileController.updateProfile);

// Ruta de órdenes
router.get('/orders', ordersController.showOrdersPage);

// Ruta para el dashboard de administrador
router.get('/admin', adminAuth, async (req, res) => {
    try {
        // Fetch servicios actuales con más detalles
        const [services] = await pool.query(`
            SELECT 
                s.id,
                s.name,
                s.base_price,
                COUNT(DISTINCT so.id) as total_orders,
                SUM(CASE WHEN so.status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
                SUM(CASE WHEN so.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_orders,
                SUM(CASE WHEN so.status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
                SUM(so.total_amount) as total_revenue
            FROM services s
            LEFT JOIN service_orders so ON s.id = so.service_id
            GROUP BY s.id, s.name, s.base_price
            ORDER BY total_orders DESC
        `);

        // Fetch clientes recientes con más información
        const [recentClients] = await pool.query(`
            SELECT 
                u.id,
                u.name,
                u.email,
                u.phone,
                COUNT(DISTINCT so.id) as total_orders,
                SUM(so.total_amount) as total_spent,
                MAX(so.created_at) as last_order
            FROM users u
            JOIN service_orders so ON u.id = so.user_id
            WHERE u.role = 'user'
            GROUP BY u.id, u.name, u.email, u.phone
            ORDER BY last_order DESC
            LIMIT 5
        `);

        // Fetch actividad reciente con más detalles
        const [recentActivity] = await pool.query(`
            SELECT 
                'shopping-cart' as type,
                CONCAT(u.name, ' - ', s.name) as title,
                so.created_at as time,
                so.status,
                so.total_amount as amount,
                so.progress_percentage,
                p.payment_method,
                p.status as payment_status
            FROM service_orders so
            JOIN services s ON so.service_id = s.id
            JOIN users u ON so.user_id = u.id
            LEFT JOIN payments p ON so.id = p.service_order_id
            ORDER BY so.created_at DESC
            LIMIT 5
        `);

        // Fetch estadísticas generales
        const [stats] = await pool.query(`
            SELECT 
                COUNT(DISTINCT u.id) as total_users,
                COUNT(DISTINCT so.id) as total_orders,
                SUM(so.total_amount) as total_revenue,
                COUNT(DISTINCT CASE WHEN so.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN so.id END) as orders_last_30_days
            FROM users u
            LEFT JOIN service_orders so ON u.id = so.user_id
            WHERE u.role = 'user'
        `);

        res.render('dashboard/admin', {
            title: 'Panel de Administración | Electro Servicios Chávez',
            user: req.session.user,
            currentPage: 'dashboard',
            services: services,
            recentClients: recentClients.map(client => ({
                ...client,
                last_order: formatDate(client.last_order),
                total_spent: parseFloat(client.total_spent || 0).toFixed(2)
            })),
            recentActivity: recentActivity.map(activity => ({
                ...activity,
                time: formatDate(activity.time),
                status: getStatusText(activity.status),
                amount: parseFloat(activity.amount || 0).toFixed(2)
            })),
            stats: {
                ...stats[0],
                total_revenue: parseFloat(stats[0].total_revenue || 0).toFixed(2)
            },
            stylesheets: ['/css/dashboard.css']
        });
    } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        res.status(500).send('Error interno del servidor');
    }
});

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
                'bolt' as icon,
                so.status,
                so.total_amount,
                so.created_at
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
                so.total_amount as amount,
                p.status as payment_status
            FROM service_orders so
            JOIN services s ON so.service_id = s.id
            LEFT JOIN payments p ON so.id = p.service_order_id
            WHERE so.user_id = ?
            ORDER BY so.created_at DESC
            LIMIT 3
        `, [userId]);

        // Fetch available services
        const [availableServices] = await pool.query(`
            SELECT 
                id, 
                name, 
                description, 
                CAST(base_price AS DECIMAL(10,2)) as base_price,
                image_url
            FROM services
            WHERE id NOT IN (
                SELECT service_id 
                FROM service_orders 
                WHERE user_id = ? AND status IN ('pending', 'in_progress')
            )
        `, [userId]);

        // Recent Activity
        const [recentActivity] = await pool.query(`
            SELECT 
                'shopping-cart' as type, 
                CONCAT('Servicio: ', s.name) as title,
                so.created_at as time,
                so.total_amount,
                so.status
            FROM service_orders so
            JOIN services s ON so.service_id = s.id
            WHERE so.user_id = ?
            ORDER BY so.created_at DESC
            LIMIT 3
        `, [userId]);

        // User stats
        const [userStats] = await pool.query(`
            SELECT 
                COUNT(*) as total_services,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_services,
                SUM(total_amount) as total_spent
            FROM service_orders
            WHERE user_id = ?
        `, [userId]);

        res.render('dashboard/user', {
            title: 'Dashboard Usuario | Electro Servicios Chávez',
            user: req.session.user,
            currentPage: 'dashboard',
            availableServices: availableServices.map(service => ({
                ...service,
                base_price: parseFloat(service.base_price).toFixed(2)
            })),
            activeServices: activeServices.map(service => ({
                ...service,
                progress: service.progress || 0,
                amount: parseFloat(service.total_amount).toFixed(2)
            })),
            recentServices: recentServices.map(service => ({
                name: service.name,
                date: formatDate(service.date),
                status: getStatusText(service.status),
                amount: parseFloat(service.amount).toFixed(2),
                payment_status: service.payment_status
            })),
            recentActivity: recentActivity.map(activity => ({
                ...activity,
                time: `hace ${getTimeAgo(activity.time)}`,
                amount: parseFloat(activity.total_amount || 0).toFixed(2)
            })),
            userStats: {
                ...userStats[0],
                total_spent: parseFloat(userStats[0].total_spent || 0).toFixed(2)
            },
            stylesheets: '/css/dashboard.css'
        });
    } catch (error) {
        console.error('Error fetching user dashboard data:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// Ruta para servicios
router.get('/services', serviceController.showServicesPage);

// Helper functions
const formatDate = (date) => {
    if (!date) return 'Fecha no disponible';
    return new Date(date).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' años';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' meses';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' días';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' horas';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutos';
    
    return Math.floor(seconds) + ' segundos';
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