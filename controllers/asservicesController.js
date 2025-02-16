// adservicesController.js (Controlador de Servicios)
const pool = require('../db');

const asservicesController = {
    async showServicesPage(req, res) {
        try {
            console.log("Entrando a showServicesPage"); // Debug
            const [services] = await pool.query(`
                SELECT 
                    s.*, 
                    COUNT(DISTINCT so.id) as total_orders,
                    SUM(CASE WHEN so.status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
                    SUM(CASE WHEN so.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_orders,
                    SUM(so.total_amount) as total_revenue,
                    AVG(so.customer_rating) as average_rating
                FROM services s
                LEFT JOIN service_orders so ON s.id = so.service_id
                GROUP BY s.id
                ORDER BY s.created_at DESC
            `);
            res.render('dashboard/asservices', { 
                title: 'Administrar Servicios', 
                user: req.session.user, 
                services: services.map(service => ({
                    ...service,
                    base_price: parseFloat(service.base_price).toFixed(2),
                    total_revenue: parseFloat(service.total_revenue || 0).toFixed(2),
                    average_rating: service.average_rating ? parseFloat(service.average_rating).toFixed(1) : 'N/A'
                })),
                stylesheets: ['/css/dashboard.css'],
                currentPage: 'asservices'  // Agregar esta línea
            });
            
        } catch (error) {
            console.error('Error al obtener los servicios:', error);
            res.status(500).send('Error interno del servidor');
        }
    }
    ,
    
    async deleteService(req, res) {
        try {
            const { id } = req.params;
            const [activeOrders] = await pool.query(
                'SELECT COUNT(*) as count FROM service_orders WHERE service_id = ? AND status IN ("pending", "in_progress")',
                [id]
            );

            if (activeOrders[0].count > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede eliminar el servicio porque tiene órdenes activas'
                });
            }

            await pool.query("DELETE FROM services WHERE id = ?", [id]);
            res.json({ success: true });
        } catch (error) {
            console.error('Error al eliminar el servicio:', error);
            res.json({ success: false });
        }
    }
};

module.exports = asservicesController;

