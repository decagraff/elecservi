const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');

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
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Ruta para la página de inicio
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Electro Servicios Chávez SAC',
        currentPage: 'home',
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
        stylesheets: '/css/styles.css'  // Pasa esta variable a la vista
    });
});

// Rutas de autenticación y dashboard
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

// **Aquí no deberías declarar `serviceRoutes` de nuevo si ya lo has hecho.**
const serviceRoutes = require('./routes/serviceRoutes');  // **Asegúrate de no tener esta línea duplicada en otra parte del archivo**

// Usar rutas de autenticación
app.use('/', authRoutes);

// Usar rutas de dashboard
app.use('/dashboard', dashboardRoutes);

// Usar rutas de servicios
app.use(serviceRoutes);  // Aquí se agregan las rutas de servicios

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
