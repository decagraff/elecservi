const pool = require('../db');

const ordersController = {
    showOrdersPage: async (req, res) => {
        try {
            const userId = req.session.user.id;

            // Obtener pedidos activos
            const [activeOrders] = await pool.query(`
                SELECT 
                    so.id,
                    s.name as service_name,
                    so.status,
                    so.progress_percentage,
                    so.total_amount,
                    DATE_FORMAT(so.created_at, '%d/%m/%Y') as order_date,
                    so.description,
                    CAST(so.total_amount AS DECIMAL(10,2)) as total_amount
                FROM service_orders so
                JOIN services s ON so.service_id = s.id
                WHERE so.user_id = ? AND so.status IN ('pending', 'in_progress')
                ORDER BY so.created_at DESC
            `, [userId]);

            // Obtener historial de pedidos
            const [orderHistory] = await pool.query(`
                SELECT 
                    so.id,
                    s.name as service_name,
                    so.status,
                    so.progress_percentage,
                    CAST(so.total_amount AS DECIMAL(10,2)) as total_amount,
                    DATE_FORMAT(so.created_at, '%d/%m/%Y') as order_date,
                    so.description,
                    (
                        SELECT GROUP_CONCAT(sh.notes ORDER BY sh.changed_at DESC)
                        FROM service_history sh
                        WHERE sh.service_order_id = so.id
                    ) as history_notes
                FROM service_orders so
                JOIN services s ON so.service_id = s.id
                WHERE so.user_id = ? AND so.status IN ('completed', 'cancelled')
                ORDER BY so.created_at DESC
            `, [userId]);

            // Obtener estadísticas de pedidos
            const [orderStats] = await pool.query(`
                SELECT 
                    COUNT(*) as total_orders,
                    SUM(CASE WHEN status IN ('pending', 'in_progress') THEN 1 ELSE 0 END) as active_orders,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
                    CAST(SUM(total_amount) AS DECIMAL(10,2)) as total_spent
                FROM service_orders
                WHERE user_id = ?
            `, [userId]);

            res.render('dashboard/orders', {
                title: 'Mis Pedidos | Electro Servicios Chávez',
                user: req.session.user,
                currentPage: 'orders',
                activeOrders: activeOrders.map(order => ({
                    ...order,
                    total_amount: Number(order.total_amount).toFixed(2)
                })),
                orderHistory: orderHistory.map(order => ({
                    ...order,
                    total_amount: Number(order.total_amount).toFixed(2)
                })),
                stats: {
                    totalOrders: orderStats[0].total_orders,
                    activeOrders: orderStats[0].active_orders,
                    completedOrders: orderStats[0].completed_orders,
                    totalSpent: Number(orderStats[0].total_spent).toFixed(2)
                },
                stylesheets: '/css/dashboard.css'
            });
        } catch (error) {
            console.error('Error fetching orders:', error);
            res.status(500).render('error', {
                message: 'Error al cargar los pedidos',
                error: error,
                stylesheets: '/css/style.css'
            });
        }
    }
};

module.exports = ordersController;