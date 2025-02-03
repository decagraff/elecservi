// controllers/serviceController.js

const pool = require('../db'); // Asegúrate de que el archivo db.js esté configurado correctamente

// Función para listar los servicios desde la base de datos
const listServices = async (req, res) => {
    try {
        const [services] = await pool.query('SELECT * FROM services');  // Query a la base de datos
        res.render('dashboard/services', {  // Renderiza la vista 'services' pasando los servicios obtenidos
            title: 'Lista de Servicios | Electro Servicios Chávez',
            services: services
        });
    } catch (err) {
        console.error('Error al obtener los servicios:', err);
        res.status(500).send('Error interno del servidor');
    }
};

module.exports = { listServices };
