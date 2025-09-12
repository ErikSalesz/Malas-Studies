// scripts/main.js

// Importa as funções dos nossos módulos
import { initThemeSwitcher } from './theme-switcher.js';
import { initPushNotifications } from './push-notifications.js';
import { carregarMensagens } from './data-fetcher.js';

// 1. Registra o Service Worker
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

// 2. Inicializa as funcionalidades importadas
// O DOMContentLoaded garante que o HTML foi completamente carregado antes de rodar os scripts
document.addEventListener('DOMContentLoaded', () => {
    initThemeSwitcher();
    initPushNotifications();
    carregarMensagens();
});