const pool = require('../db');

const dashboardController = {
    getUserDashboard: async (req, res) => {
        try {
            const userId = req.session.user.id;

            // Fetch available services
            const [availableServices] = await pool.query(
                'SELECT id, name, description, base_price FROM services'
            );

            // Fetch active services (from service_orders)
            const [activeServices] = await pool.query(`
                SELECT 
                    s.id, 
                    s.name, 
                    so.status, 
                    so.progress_percentage as progress
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
                LIMIT 5
            `, [userId]);

            // Render the dashboard
            res.render('dashboard/user', {
                title: 'Panel de Usuario | Electro Servicios Chávez',
                user: req.session.user,
                currentPage: 'dashboard',
                availableServices: availableServices,
                activeServices: activeServices,
                recentServices: recentServices.map(service => ({
                    ...service,
                    date: service.date ? new Date(service.date).toLocaleDateString('es-PE') : 'Fecha no disponible',
                    status: getStatusText(service.status),
                    amount: parseFloat(service.amount).toFixed(2)
                }))
            });
        } catch (err) {
            console.error('Error en el panel de usuario:', err);
            res.status(500).send('Error interno del servidor');
        }
    }
};

// Helper function to convert status to user-friendly text
function getStatusText(status) {
    const statusMap = {
        'pending': 'Pendiente',
        'in_progress': 'En Progreso',
        'completed': 'Completado',
        'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
}

module.exports = dashboardController;