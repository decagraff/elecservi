// Validación del formulario de registro
document.getElementById('register-form').addEventListener('submit', function (e) {
    const password = document.getElementById('password').value;
    if (password.length < 6) {
        e.preventDefault();
        alert('La contraseña debe tener al menos 6 caracteres.');
    }
});

// Validación del formulario de login
document.getElementById('login-form').addEventListener('submit', function (e) {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if (!email || !password) {
        e.preventDefault();
        alert('Por favor, completa todos los campos.');
    }
});