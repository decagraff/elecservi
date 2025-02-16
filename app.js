// ==================================
// app.js
// ==================================
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const chatbotRoutes = require('./routes/chatbot');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3010;

// Configurar EJS como motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/chatbot', chatbotRoutes);
// Configuración de sesión
app.use(session({
    secret: process.env.SESSION_SECRET || 'tu_secreto_aqui',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Middleware para verificar autenticación
const authMiddleware = (req, res, next) => {
    const publicRoutes = ['/', '/login', '/register'];
    
    if (publicRoutes.includes(req.path)) {
        return next();
    }

    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

app.use(authMiddleware);

// Rutas
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const serviceRoutes = require('./routes/serviceRoutes');

app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use(serviceRoutes);

// Ruta para la página de inicio
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Electro Servicios Chávez SAC',
        currentPage: 'home',
        user: req.session.user,
        heroTitle: 'Soluciones Eléctricas Profesionales',
        heroText: 'Ofrecemos servicios de calidad para hogares y empresas. Confía en los expertos.',
        services: [
            {
                icon: 'fa-bolt',
                title: 'Instalaciones Eléctricas',
                description: 'Instalaciones seguras y eficientes para tu hogar o negocio.'
            },
            {
                icon: 'fa-tools',
                title: 'Mantenimiento',
                description: 'Mantenimiento preventivo y correctivo para tus sistemas eléctricos.'
            },
            {
                icon: 'fa-solar-panel',
                title: 'Energías Renovables',
                description: 'Soluciones sostenibles con paneles solares y más.'
            }
        ],
        companyName: 'Electro Servicios Chávez SAC',
        footerLinks: [
            { url: '/', text: 'Inicio' },
            { url: '#services', text: 'Servicios' },
            { url: '#about', text: 'Nosotros' },
            { url: '#contact', text: 'Contacto' }
        ],
        address: 'Av. Principal 123, Lima, Perú',
        phone: '+51 987 654 321',
        email: 'info@electrochavez.com',
        stylesheets: '/css/styles.css'
    });
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error', {
        title: 'Error',
        stylesheets: '/css/style.css', // Añade el stylesheet por defecto
        message: err.message,
        error: err
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
