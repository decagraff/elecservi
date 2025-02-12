const bcrypt = require('bcryptjs');
const pool = require('../db');

const profileController = {
    showProfilePage: async (req, res) => {
        try {
            const userId = req.session.user.id;

            // Obtener datos actuales del usuario
            const [userData] = await pool.query(
                'SELECT name, email, phone, address FROM users WHERE id = ?',
                [userId]
            );

            // Get total services count
            const [servicesCount] = await pool.query(
                'SELECT COUNT(*) as total FROM service_orders WHERE user_id = ?',
                [userId]
            );

            // Get active services count
            const [activeCount] = await pool.query(
                'SELECT COUNT(*) as active FROM service_orders WHERE user_id = ? AND status IN ("pending", "in_progress")',
                [userId]
            );

            // Get recent activity
            const [recentActivity] = await pool.query(`
                SELECT 
                    'clock' as icon,
                    CASE 
                        WHEN so.status = 'pending' THEN 'Servicio Solicitado'
                        WHEN so.status = 'in_progress' THEN 'Servicio en Progreso'
                        WHEN so.status = 'completed' THEN 'Servicio Completado'
                        ELSE 'Servicio Cancelado'
                    END as title,
                    s.name,
                    so.status,
                    CONCAT('hace ', TIMESTAMPDIFF(HOUR, so.created_at, NOW()), ' horas') as time
                FROM service_orders so
                JOIN services s ON so.service_id = s.id
                WHERE so.user_id = ?
                ORDER BY so.created_at DESC
                LIMIT 5
            `, [userId]);

            res.render('dashboard/profile', {
                title: 'Mi Perfil | Electro Servicios Chávez',
                user: { ...req.session.user, ...userData[0] },
                currentPage: 'profile',
                totalServices: servicesCount[0].total,
                activeServices: activeCount[0].active,
                recentActivity: recentActivity,
                stylesheets: '/css/dashboard.css'  // Asegúrate de que esta línea esté presente
            });
        } catch (error) {
            console.error('Error fetching profile data:', error);
            res.status(500).render('error', {
                message: 'Error al cargar los datos del perfil',
                error: error,
                stylesheets: '/css/style.css'  // Añade stylesheet para la página de error
            });
        }
    },

    updateProfile: async (req, res) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const userId = req.session.user.id;
            const { name, email, phone, address, password } = req.body;

            // Verificar si el email ya existe para otro usuario
            if (email !== req.session.user.email) {
                const [existingUser] = await connection.query(
                    'SELECT id FROM users WHERE email = ? AND id != ?',
                    [email, userId]
                );
                
                if (existingUser.length > 0) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        message: 'Este correo electrónico ya está registrado'
                    });
                }
            }

            // Construir la consulta de actualización
            let query = 'UPDATE users SET name = ?, email = ?, phone = ?, address = ?';
            let values = [name, email, phone || null, address || null];

            // Si se proporciona contraseña, hashearla y agregarla a la actualización
            if (password && password.trim() !== '') {
                const hashedPassword = await bcrypt.hash(password, 8);
                query += ', password = ?';
                values.push(hashedPassword);
            }

            query += ' WHERE id = ?';
            values.push(userId);

            // Ejecutar la actualización
            const [result] = await connection.query(query, values);
            
            if (result.affectedRows === 0) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            await connection.commit();

            // Actualizar la información de la sesión
            req.session.user = {
                ...req.session.user,
                name,
                email,
                phone,
                address
            };

            res.json({ 
                success: true,
                message: 'Perfil actualizado correctamente'
            });
        } catch (error) {
            await connection.rollback();
            console.error('Error updating profile:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error al actualizar el perfil'
            });
        } finally {
            connection.release();
        }
    }
};

module.exports = profileController;
