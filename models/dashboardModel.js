const pool = require('../config/database');

const dashboardModel = {
    getTotalClients: async () => {
        const [rows] = await pool.query('SELECT COUNT(*) as total FROM clients');
        return rows[0].total;
    },
    
    getTotalActiveServices: async () => {
        const [rows] = await pool.query(
            'SELECT COUNT(*) as total FROM service_orders WHERE status = "in_progress"'
        );
        return rows[0].total;
    },
    
    getRecentOrders: async (limit) => {
        const [rows] = await pool.query(`
            SELECT so.*, c.name as client_name, s.name as service_name 
            FROM service_orders so
            JOIN clients c ON so.client_id = c.id
            JOIN services s ON so.service_id = s.id
            ORDER BY so.created_at DESC
            LIMIT ?`, [limit]
        );
        return rows;
    },
    
    getMonthlyRevenue: async () => {
        const [rows] = await pool.query(`
            SELECT SUM(amount) as total 
            FROM payments 
            WHERE MONTH(payment_date) = MONTH(CURRENT_DATE())
            AND status = 'completed'`
        );
        return rows[0].total || 0;
    },
    
    getUserActiveServices: async (userId) => {
        const [rows] = await pool.query(`
            SELECT so.*, s.name as service_name
            FROM service_orders so
            JOIN services s ON so.service_id = s.id
            JOIN clients c ON so.client_id = c.id
            WHERE c.id = ? AND so.status = 'in_progress'`, [userId]
        );
        return rows;
    },
    
    getUserServiceHistory: async (userId) => {
        const [rows] = await pool.query(`
            SELECT COUNT(*) as total
            FROM service_orders so
            JOIN clients c ON so.client_id = c.id
            WHERE c.id = ? AND so.status = 'completed'`, [userId]
        );
        return rows[0].total;
    },
    
    getUserTotalSpent: async (userId) => {
        const [rows] = await pool.query(`
            SELECT SUM(p.amount) as total
            FROM payments p
            JOIN service_orders so ON p.service_order_id = so.id
            JOIN clients c ON so.client_id = c.id
            WHERE c.id = ? AND p.status = 'completed'`, [userId]
        );
        return rows[0].total || 0;
    }
};

module.exports = dashboardModel;