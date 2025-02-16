const pool = require('../db');

const salesController = {
    showSalesPage: async (req, res) => {
        try {
            // Obtener resumen de ventas del mes actual
            const [monthlySummary] = await pool.query(`
                SELECT 
                    COUNT(*) as total_orders,
                    SUM(total_amount) as total_revenue,
                    SUM(discount_amount) as total_discounts,
                    SUM(tax_amount) as total_taxes,
                    AVG(customer_rating) as average_rating
                FROM service_orders
                WHERE MONTH(created_at) = MONTH(CURRENT_DATE())
                AND YEAR(created_at) = YEAR(CURRENT_DATE())
                AND status = 'completed'
            `);

            // Obtener ventas por método de pago
            const [paymentMethods] = await pool.query(`
                SELECT 
                    p.payment_method,
                    COUNT(*) as count,
                    SUM(p.amount) as total
                FROM payments p
                WHERE MONTH(p.payment_date) = MONTH(CURRENT_DATE())
                AND YEAR(p.payment_date) = YEAR(CURRENT_DATE())
                GROUP BY p.payment_method
            `);

            // Obtener ventas recientes con detalles
            const [recentSales] = await pool.query(`
                SELECT 
                    so.id,
                    u.name as client_name,
                    s.name as service_name,
                    so.total_amount,
                    so.discount_amount,
                    so.tax_amount,
                    so.created_at,
                    so.status,
                    p.payment_method,
                    p.status as payment_status
                FROM service_orders so
                JOIN users u ON so.user_id = u.id
                JOIN services s ON so.service_id = s.id
                LEFT JOIN payments p ON so.id = p.service_order_id
                ORDER BY so.created_at DESC
                LIMIT 10
            `);

            // Obtener datos para el gráfico de ventas por mes
            const [monthlyData] = await pool.query(`
                SELECT 
                    DATE_FORMAT(created_at, '%Y-%m') as month,
                    COUNT(*) as total_orders,
                    SUM(total_amount) as total_revenue
                FROM service_orders
                WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
                GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                ORDER BY month ASC
            `);

            res.render('dashboard/sales', {
                title: 'Reporte de Ventas | Electro Servicios Chávez',
                user: req.session.user,
                currentPage: 'sales',
                monthlySummary: monthlySummary[0],
                paymentMethods,
                recentSales,
                monthlyData,
                stylesheets: ['/css/dashboard.css']
            });
        } catch (error) {
            console.error('Error al cargar la página de ventas:', error);
            res.status(500).send('Error interno del servidor');
        }
    }
};

module.exports = salesController;