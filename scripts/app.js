// scripts/app.js (VERSÃO FINAL DE AUTENTICAÇÃO)

// Importa as funcionalidades necessárias
import { getUser } from './features/auth-handler.js';
import { initTimeline } from './components/timeline.js';
import { initThemeSwitcher } from './components/theme-switcher.js';
import { initPushNotifications } from './features/push-notifications.js';
import { initDatePicker } from './components/date-picker.js';
import { initFabHandler } from './features/fab-handler.js';
import { initAgendaHandler } from './features/agenda-handler.js';
import { exibirAgendamentos } from './features/agenda-handler.js';

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

// === VERIFICAÇÃO DE AUTENTICAÇÃO AO CARREGAR A PÁGINA ===
async function checkUserAuthentication() {
    const user = await getUser();
    if (!user) {
        // Se não há usuário logado, redireciona para a página de login
        window.location.replace('/login.html');
    } else {
        // Se o usuário está logado, carrega o resto do aplicativo
        console.log('Usuário autenticado:', user.email);
        // Inicializa todas as partes da aplicação principal
        initDatePicker();
        initTimeline();
        initThemeSwitcher();
        initPushNotifications();
        initFabHandler();
        initAgendaHandler();
        exibirAgendamentos();
    }
}

// Executa a verificação de autenticação assim que o DOM estiver pronto
document.addEventListener('DOMContentLoaded', checkUserAuthentication);