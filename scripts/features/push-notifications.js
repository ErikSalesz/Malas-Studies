// scripts/push-notifications.js

// Lembre-se de substituir pela sua chave pública VAPID!
const vapidPublicKey = 'SUA_VAPID_PUBLIC_KEY_AQUI';

async function configurePushSubscription() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
        console.log('Usuário já inscrito:', subscription);
        return;
    }
    
    try {
        const newSubscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: vapidPublicKey
        });
        console.log('Nova inscrição:', newSubscription);
        // Aqui você enviaria a inscrição para o seu servidor
    } catch (error) {
        console.error('Falha ao se inscrever:', error);
    }
}

export function initPushNotifications() {
    const notificationsButton = document.getElementById('enable-notifications');

    if ('Notification' in window && 'serviceWorker' in navigator) {
        notificationsButton.addEventListener('click', () => {
            Notification.requestPermission(async (result) => {
                if (result === 'granted') {
                    console.log('Permissão para notificações concedida!');
                    notificationsButton.textContent = 'Notificações Ativadas';
                    notificationsButton.disabled = true;
                    await configurePushSubscription();
                } else {
                    console.log('Permissão para notificações negada.');
                }
            });
        });
    } else {
        console.log('Este navegador não suporta notificações.');
        notificationsButton.style.display = 'none';
    }
}