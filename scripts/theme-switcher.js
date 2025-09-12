// scripts/theme-switcher.js

export function initThemeSwitcher() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.documentElement;

    themeToggle.addEventListener('click', () => {
        if (body.getAttribute('data-theme') === 'dark') {
            body.removeAttribute('data-theme');
            themeToggle.textContent = 'Alternar para Modo Escuro';
        } else {
            body.setAttribute('data-theme', 'dark');
            themeToggle.textContent = 'Alternar para Modo Claro';
        }
    });
}