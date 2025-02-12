// middleware/authMiddleware.js

const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

const isAdmin = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).render('error', {
            message: 'No tienes permiso para acceder a esta página',
            error: { status: 403 }
        });
    }
};

module.exports = { isAuthenticated, isAdmin };