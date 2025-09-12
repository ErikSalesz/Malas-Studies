// scripts/theme-switcher.js (VERSÃO ATUALIZADA)

export function initThemeSwitcher() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.documentElement;
    const iconSun = document.getElementById('theme-icon-sun');
    const iconMoon = document.getElementById('theme-icon-moon');

    // Função para renderizar os ícones da biblioteca Feather
    // Isso é necessário após qualquer alteração dinâmica
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    themeToggle.addEventListener('click', () => {
        if (body.getAttribute('data-theme') === 'dark') {
            // Muda para o tema claro
            body.removeAttribute('data-theme');
            iconSun.style.display = 'inline-block';
            iconMoon.style.display = 'none';
        } else {
            // Muda para o tema escuro
            body.setAttribute('data-theme', 'dark');
            iconSun.style.display = 'none';
            iconMoon.style.display = 'inline-block';
        }
    });
}