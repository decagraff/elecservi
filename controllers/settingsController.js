// settingsController.js
const pool = require('../db');
const bcrypt = require('bcryptjs');

const settingsController = {
    updateSettings: async (req, res) => {
        const { name, email, phone, address, password } = req.body;
        const userId = req.session.user.id;

        try {
            let updateQuery = `UPDATE users SET name = ?, email = ?, phone = ?, address = ?`;
            let values = [name, email, phone, address];
            
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                updateQuery += `, password = ?`;
                values.push(hashedPassword);
            }
            updateQuery += ` WHERE id = ?`;
            values.push(userId);
            
            await pool.query(updateQuery, values);
            req.session.user.name = name;
            req.session.user.email = email;
            req.session.user.phone = phone;
            req.session.user.address = address;

            res.redirect('/dashboard/settings');
        } catch (error) {
            console.error('Error actualizando configuración:', error);
            res.status(500).send('Error interno del servidor');
        }
    }
};

module.exports = settingsController;