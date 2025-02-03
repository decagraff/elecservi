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

    try {
        // Intentar crear el nuevo usuario
        await db.createUser(name, email, hashedPassword);
        res.redirect('/login');
    } catch (err) {
        console.error('Error al registrar usuario:', err);

        // Definir el mensaje de error
        let message = 'Hubo un error al registrar el usuario. Intenta nuevamente.';
        
        // Si el error es de entrada duplicada, personalizar el mensaje
        if (err.code === 'ER_DUP_ENTRY') {
            message = 'Este correo electrónico ya está registrado. Por favor, intenta con otro.';
        }

        // Renderizar la vista con el mensaje y la variable stylesheets
        return res.render('register', { message, stylesheets: '/css/styles.css' });
    }
};


const logout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
};

module.exports = { login, register, logout };
