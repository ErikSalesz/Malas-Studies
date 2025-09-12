// scripts/features/update-handler.js

export function initUpdateHandler() {
    const updateButton = document.getElementById('update-button');
    const updateNotification = document.getElementById('update-notification');
    let newWorker; // Variável para guardar o novo Service Worker

    // 1. Verifica se o navegador suporta Service Workers
    if ('serviceWorker' in navigator) {
        // 2. Ouve por atualizações no registro do Service Worker
        navigator.serviceWorker.getRegistration().then(reg => {
            if (!reg) return;

            // Ouve o evento 'updatefound'
            reg.onupdatefound = () => {
                newWorker = reg.installing;

                // 3. Ouve a mudança de estado do novo worker
                newWorker.onstatechange = () => {
                    // Se o estado for 'installed', significa que ele está esperando para ativar
                    if (newWorker.state === 'installed') {
                        // Mostra a notificação para o usuário
                        console.log('Nova versão pronta para instalar!');
                        updateNotification.classList.remove('hidden');
                    }
                };
            };
        });

        // 4. Configura o clique no botão de atualização
        updateButton.addEventListener('click', () => {
            if (newWorker) {
                // Envia uma mensagem para o SW (não estritamente necessário com skipWaiting no install, mas boa prática)
                // E recarrega a página para que o novo SW assuma
                newWorker.postMessage({ action: 'skipWaiting' });
                window.location.reload();
            }
        });
    }
}