const menuItems = {
    admin: [
        { icon: 'fa-home', text: 'Inicio', link: '/dashboard' },
        { icon: 'fa-users', text: 'Clientes', link: '/clients' },
        { icon: 'fa-shopping-cart', text: 'Ventas', link: '/sales' },
        { icon: 'fa-chart-bar', text: 'Reportes', link: '/reports' }
    ],
    user: [
        { icon: 'fa-home', text: 'Inicio', link: '/dashboard' },
        { icon: 'fa-user', text: 'Mi Perfil', link: '/profile' },
        { icon: 'fa-clipboard-list', text: 'Mis Servicios', link: '/services' }
    ]
};

function loadDashboard() {
    Promise.all([
        fetch('/dashboard/api/user-info'),
        fetch('/dashboard/api/dashboard-data')
    ])
    .then(responses => Promise.all(responses.map(r => r.json())))
    .then(([userInfo, dashboardData]) => {
        document.getElementById('user-name').textContent = userInfo.name;
        setupMenu(userInfo.role);
        
        if(userInfo.role === 'admin') {
            document.getElementById('dashboard-title').textContent = 'Panel de Administración';
            renderAdminDashboard(dashboardData);
        } else {
            document.getElementById('dashboard-title').textContent = 'Mi Panel';
            renderUserDashboard(dashboardData);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        window.location.href = '/login';
    });
}

function setupMenu(role) {
    const navMenu = document.getElementById('nav-menu');
    const items = menuItems[role];
    
    navMenu.innerHTML = items.map(item => `
        <li>
            <a href="${item.link}">
                <i class="fas ${item.icon}"></i>
                <span>${item.text}</span>
            </a>
        </li>
    `).join('');
}

function renderAdminDashboard(data) {
    const { stats, recentOrders } = data;
    document.getElementById('main-content').innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-users"></i></div>
                <div class="stat-info">
                    <h3>Total Clientes</h3>
                    <p class="stat-number">${stats.clients}</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-tools"></i></div>
                <div class="stat-info">
                    <h3>Servicios Activos</h3>
                    <p class="stat-number">${stats.services}</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-dollar-sign"></i></div>
                <div class="stat-info">
                    <h3>Ingresos Mensuales</h3>
                    <p class="stat-number">S/${stats.revenue.toFixed(2)}</p>
                </div>
            </div>
        </div>
        <div class="content-section">
            <h3>Órdenes Recientes</h3>
            <div class="table-container">
                ${renderRecentOrders(recentOrders)}
            </div>
        </div>`;
}

function renderUserDashboard(data) {
    const { stats } = data;
    document.getElementById('main-content').innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-clipboard-check"></i></div>
                <div class="stat-info">
                    <h3>Servicios Activos</h3>
                    <p class="stat-number">${stats.activeServices.length}</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-history"></i></div>
                <div class="stat-info">
                    <h3>Servicios Completados</h3>
                    <p class="stat-number">${stats.completedServices}</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-dollar-sign"></i></div>
                <div class="stat-info">
                    <h3>Total Gastado</h3>
                    <p class="stat-number">S/${stats.totalSpent.toFixed(2)}</p>
                </div>
            </div>
        </div>
        <div class="content-section">
            <h3>Mis Servicios Activos</h3>
            <div class="service-list">
                ${renderActiveServices(stats.activeServices)}
            </div>
        </div>`;
}

function renderRecentOrders(orders) {
    return `
        <table class="services-table">
            <thead>
                <tr>
                    <th>Cliente</th>
                    <th>Servicio</th>
                    <th>Estado</th>
                    <th>Monto</th>
                </tr>
            </thead>
            <tbody>
                ${orders.map(order => `
                    <tr>
                        <td>${order.client_name}</td>
                        <td>${order.service_name}</td>
                        <td><span class="status ${order.status}">${getStatusText(order.status)}</span></td>
                        <td>S/${order.total_amount.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>`;
}

function renderActiveServices(services) {
    return services.map(service => `
        <div class="service-item">
            <div class="service-icon">
                <i class="fas fa-tools"></i>
            </div>
            <div class="service-details">
                <h4>${service.service_name}</h4>
                <p>Progreso: ${service.progress_percentage}%</p>
                <div class="progress-bar">
                    <div class="progress" style="width: ${service.progress_percentage}%"></div>
                </div>
            </div>
        </div>
    `).join('');
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Pendiente',
        'in_progress': 'En Progreso',
        'completed': 'Completado',
        'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
}

document.addEventListener('DOMContentLoaded', loadDashboard);