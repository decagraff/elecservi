document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (!email || !password) {
                e.preventDefault();
                alert('Por favor, completa todos los campos.');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                e.preventDefault();
                alert('Por favor, ingresa un correo electrónico válido.');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            const password = document.getElementById('password').value;
            if (password.length < 6) {
                e.preventDefault();
                alert('La contraseña debe tener al menos 6 caracteres.');
            }
        });
    }

    // Manejo de errores en URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('error')) {
        const messages = {
            'invalid': 'Credenciales inválidas. Por favor, intenta de nuevo.',
            'exists': 'El correo electrónico ya está registrado.',
            'server': 'Error del servidor. Por favor, intenta más tarde.'
        };
        const message = messages[urlParams.get('error')];
        if (message) alert(message);
    }
});