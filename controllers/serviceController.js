// serviceController.js
const pool = require('../db');

const serviceController = {
    showServicesPage: async (req, res) => {
        try {
            const userId = req.session.user.id;

            // Obtener todos los servicios disponibles
            const [services] = await pool.query(`
                SELECT 
                    s.id,
                    s.name,
                    s.description,
                    CAST(s.base_price AS DECIMAL(10,2)) as base_price,
                    s.image_url
                FROM services s
                ORDER BY s.name
            `);

            // Obtener servicios activos del usuario
            const [activeServices] = await pool.query(`
                SELECT 
                    s.id,
                    s.name,
                    so.status,
                    so.progress_percentage as progress,
                    so.created_at,
                    CAST(so.total_amount AS DECIMAL(10,2)) as total_amount
                FROM service_orders so
                JOIN services s ON so.service_id = s.id
                WHERE so.user_id = ? AND so.status IN ('pending', 'in_progress')
                ORDER BY so.created_at DESC
            `, [userId]);

            // Obtener historial de servicios del usuario
            const [serviceHistory] = await pool.query(`
                SELECT 
                    s.name,
                    so.status,
                    CAST(so.total_amount AS DECIMAL(10,2)) as total_amount,
                    DATE_FORMAT(so.created_at, '%d/%m/%Y') as date,
                    so.progress_percentage as progress
                FROM service_orders so
                JOIN services s ON so.service_id = s.id
                WHERE so.user_id = ? AND so.status IN ('completed', 'cancelled')
                ORDER BY so.created_at DESC
                LIMIT 5
            `, [userId]);

            res.render('dashboard/services', {
                title: 'Servicios | Electro Servicios Chávez',
                user: req.session.user,
                currentPage: 'services',
                services: services.map(service => ({
                    ...service,
                    base_price: Number(service.base_price)
                })),
                activeServices: activeServices.map(service => ({
                    ...service,
                    total_amount: Number(service.total_amount)
                })),
                serviceHistory: serviceHistory.map(service => ({
                    ...service,
                    total_amount: Number(service.total_amount)
                })),
                stylesheets: '/css/dashboard.css'
            });
        } catch (error) {
            console.error('Error fetching services:', error);
            res.status(500).render('error', {
                message: 'Error al cargar los servicios',
                error: error,
                stylesheets: '/css/style.css'
            });
        }
    },

    // Mostrar todos los servicios disponibles
    showServices: async (req, res) => {
        try {
            // Obtener todos los servicios
            const [services] = await pool.query(`
                SELECT 
                    s.id,
                    s.name,
                    s.description,
                    CAST(s.base_price AS DECIMAL(10,2)) as base_price,
                    s.image_url,
                    COUNT(DISTINCT so.id) as total_orders,
                    COUNT(DISTINCT CASE WHEN so.status IN ('pending', 'in_progress') THEN so.id END) as active_orders
                FROM services s
                LEFT JOIN service_orders so ON s.id = so.service_id
                GROUP BY s.id
            `);

            // Obtener servicios activos del usuario
            const [activeServices] = await pool.query(`
                SELECT 
                    s.id,
                    s.name,
                    so.status,
                    so.progress_percentage as progress,
                    so.created_at,
                    CAST(so.total_amount AS DECIMAL(10,2)) as total_amount
                FROM service_orders so
                JOIN services s ON so.service_id = s.id
                WHERE so.user_id = ? AND so.status IN ('pending', 'in_progress')
                ORDER BY so.created_at DESC
            `, [req.session.user.id]);

            // Obtener historial de servicios del usuario
            const [serviceHistory] = await pool.query(`
                SELECT 
                    s.name,
                    so.status,
                    CAST(so.total_amount AS DECIMAL(10,2)) as total_amount,
                    DATE_FORMAT(so.created_at, '%d/%m/%Y') as date,
                    so.progress_percentage as progress
                FROM service_orders so
                JOIN services s ON so.service_id = s.id
                WHERE so.user_id = ? AND so.status IN ('completed', 'cancelled')
                ORDER BY so.created_at DESC
                LIMIT 5
            `, [req.session.user.id]);

            res.render('dashboard/services', {
                title: 'Servicios | Electro Servicios Chávez',
                user: req.session.user,
                currentPage: 'services',
                services: services.map(service => ({
                    ...service,
                    base_price: Number(service.base_price)
                })),
                activeServices: activeServices.map(service => ({
                    ...service,
                    total_amount: Number(service.total_amount)
                })),
                serviceHistory: serviceHistory.map(service => ({
                    ...service,
                    total_amount: Number(service.total_amount)
                })),
                stylesheets: '/css/dashboard.css'
            });
        } catch (error) {
            console.error('Error fetching services:', error);
            res.status(500).render('error', {
                message: 'Error al cargar los servicios',
                error: error,
                stylesheets: '/css/style.css'
            });
        }
    },

    requestService: async (req, res) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const { serviceId, description } = req.body;
            const userId = req.session.user.id;

            // Obtener el precio base del servicio
            const [serviceData] = await connection.query(
                'SELECT CAST(base_price AS DECIMAL(10,2)) as base_price FROM services WHERE id = ?',
                [serviceId]
            );

            if (serviceData.length === 0) {
                throw new Error('Servicio no encontrado');
            }

            // Crear la orden de servicio
            const [result] = await connection.query(
                `INSERT INTO service_orders 
                (user_id, service_id, status, total_amount, description) 
                VALUES (?, ?, 'pending', ?, ?)`,
                [userId, serviceId, serviceData[0].base_price, description]
            );

            // Registrar en el historial
            await connection.query(
                `INSERT INTO service_history 
                (service_order_id, status_change, notes) 
                VALUES (?, 'pending', 'Servicio solicitado')`,
                [result.insertId]
            );

            await connection.commit();

            res.json({
                success: true,
                message: 'Servicio solicitado exitosamente'
            });
        } catch (error) {
            await connection.rollback();
            console.error('Error requesting service:', error);
            res.status(500).json({
                success: false,
                message: 'Error al solicitar el servicio'
            });
        } finally {
            connection.release();
        }
    }
};

module.exports = serviceController;