// scripts/main.js

// Importa as funções dos nossos módulos
import { initPushNotifications } from './features/push-notifications.js';
import { initUpdateHandler } from './features/update-handler.js';
import { initFabHandler } from './features/fab-handler.js';
import { exibirTarefas } from './features/todo-handler.js';

import { initTimeline } from './components/timeline.js';
import { initDatePicker } from './components/date-picker.js';
import { initThemeSwitcher } from './components/theme-switcher.js';

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
    initDatePicker();
    initTimeline();
    initThemeSwitcher();

    initPushNotifications();
    initUpdateHandler();
    initFabHandler();
    exibirTarefas();
});