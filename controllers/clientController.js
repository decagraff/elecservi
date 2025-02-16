// clientController.js
const pool = require('../db');

const clientController = {
    // Mostrar página de clientes
    showClientsPage: async (req, res) => {
        try {
            // Obtener estadísticas generales de clientes
            const [clientStats] = await pool.query(`
                SELECT 
                    COUNT(*) as total_clients,
                    COUNT(CASE WHEN DATEDIFF(CURRENT_DATE, created_at) <= 30 THEN 1 END) as new_clients,
                    (SELECT COUNT(DISTINCT user_id) FROM service_orders) as active_clients
                FROM users 
                WHERE role = 'user'
            `);

            // Obtener lista de clientes con información detallada
            const [clients] = await pool.query(`
                SELECT 
                    u.id,
                    u.name,
                    u.email,
                    u.phone,
                    u.address,
                    u.created_at,
                    COUNT(DISTINCT so.id) as total_orders,
                    SUM(so.total_amount) as total_spent,
                    MAX(so.created_at) as last_order_date
                FROM users u
                LEFT JOIN service_orders so ON u.id = so.user_id
                WHERE u.role = 'user'
                GROUP BY u.id, u.name, u.email, u.phone, u.address, u.created_at
                ORDER BY u.created_at DESC
            `);

            // Obtener las últimas órdenes de servicio
            const [recentOrders] = await pool.query(`
                SELECT 
                    so.id,
                    so.created_at,
                    so.total_amount,
                    so.status,
                    s.name as service_name,
                    u.name as client_name
                FROM service_orders so
                JOIN users u ON so.user_id = u.id
                JOIN services s ON so.service_id = s.id
                WHERE u.role = 'user'
                ORDER BY so.created_at DESC
                LIMIT 5
            `);

            res.render('dashboard/clients', {
                title: 'Gestión de Clientes | Electro Servicios Chávez',
                user: req.session.user,
                currentPage: 'clients',
                clientStats: clientStats[0],
                clients: clients.map(client => ({
                    ...client,
                    total_spent: parseFloat(client.total_spent || 0).toFixed(2),
                    created_at: formatDate(client.created_at),
                    last_order_date: client.last_order_date ? formatDate(client.last_order_date) : 'Sin órdenes'
                })),
                recentOrders: recentOrders.map(order => ({
                    ...order,
                    created_at: formatDate(order.created_at),
                    total_amount: parseFloat(order.total_amount).toFixed(2)
                })),
                stylesheets: ['/css/dashboard.css']
            });
        } catch (error) {
            console.error('Error en la página de clientes:', error);
            res.status(500).send('Error interno del servidor');
        }
    },

    // Obtener detalles de un cliente específico
    getClientDetails: async (req, res) => {
        try {
            const clientId = req.params.id;
            const [clientDetails] = await pool.query(`
                SELECT 
                    u.*,
                    COUNT(DISTINCT so.id) as total_orders,
                    SUM(so.total_amount) as total_spent,
                    MAX(so.created_at) as last_order_date
                FROM users u
                LEFT JOIN service_orders so ON u.id = so.user_id
                WHERE u.id = ? AND u.role = 'user'
                GROUP BY u.id
            `, [clientId]);

            if (clientDetails.length === 0) {
                return res.status(404).json({ message: 'Cliente no encontrado' });
            }

            res.json(clientDetails[0]);
        } catch (error) {
            console.error('Error al obtener detalles del cliente:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    }
};

// Función auxiliar para formatear fechas
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

module.exports = clientController;