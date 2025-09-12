if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registrado com sucesso:', registration);
            })
            .catch(error => {
                console.log('Falha ao registrar o Service Worker:', error);
            });
    });
}

const themeToggle = document.getElementById('theme-toggle');
const body = document.documentElement; // Usamos documentElement (<html>) para aplicar o tema

themeToggle.addEventListener('click', () => {
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        themeToggle.textContent = 'Alternar para Modo Escuro';
    } else {
        body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = 'Alternar para Modo Claro';
    }
});