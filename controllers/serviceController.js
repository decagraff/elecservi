const pool = require('../db');

const serviceController = {
    showServicesPage: async (req, res) => {
        try {
            const [services] = await pool.query('SELECT *, CAST(base_price AS DECIMAL(10,2)) as base_price FROM services ORDER BY created_at DESC');
            res.render('dashboard/services', {
                title: 'Servicios | Electro Servicios Chávez',
                user: req.session.user,
                currentPage: 'services',
                services: services.map(service => ({
                    ...service,
                    base_price: parseFloat(service.base_price)
                })),
                stylesheets: '/css/dashboard.css'
            });
        } catch (err) {
            console.error('Error fetching services:', err);
            res.status(500).send('Internal Server Error');
        }
    },

    showAddServiceForm: (req, res) => {
        res.render('dashboard/add-service', {
            title: 'Agregar Servicio | Electro Servicios Chávez',
            user: req.session.user,
            currentPage: 'services',
            stylesheets: '/css/dashboard.css'
        });
    },

    addService: async (req, res) => {
        try {
            const { name, description, base_price } = req.body;
            await pool.query(
                'INSERT INTO services (name, description, base_price, created_at) VALUES (?, ?, ?, NOW())',
                [name, description, base_price]
            );
            res.redirect('/services');
        } catch (err) {
            console.error('Error adding service:', err);
            res.status(500).send('Internal Server Error');
        }
    },

    deleteService: async (req, res) => {
        try {
            const { id } = req.params;
            await pool.query('DELETE FROM services WHERE id = ?', [id]);
            res.json({ success: true });
        } catch (err) {
            console.error('Error deleting service:', err);
            res.status(500).json({ success: false });
        }
    }
};

module.exports = serviceController;