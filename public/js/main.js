// JavaScript para interactividad (opcional)
document.getElementById('contact-form').addEventListener('submit', function (e) {
    e.preventDefault();
    alert('Gracias por tu mensaje. Nos pondremos en contacto contigo pronto.');
    this.reset();
});