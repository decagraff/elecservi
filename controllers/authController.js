const bcrypt = require('bcryptjs');
const db = require('../models/userModel');

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await db.getUserByEmail(email);

    if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = user; // Guarda toda la información del usuario en la sesión
        req.session.role = user.role; // Guarda el rol del usuario en la sesión

        if (user.role === 'admin') {
            res.redirect('/dashboard/admin');
        } else {
            res.redirect('/dashboard/user');
        }
    } else {
        res.send('Credenciales inválidas');
    }
};

const register = async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);
    await db.createUser(name, email, hashedPassword);
    res.redirect('/login');
};

const logout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
};

module.exports = { login, register, logout };