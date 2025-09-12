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

const notificationsButton = document.getElementById('enable-notifications');

// Verifica se o navegador suporta notificações
if ('Notification' in window && 'serviceWorker' in navigator) {
    notificationsButton.addEventListener('click', () => {
        Notification.requestPermission(async (result) => {
            if (result === 'granted') {
                console.log('Permissão para notificações concedida!');
                notificationsButton.textContent = 'Notificações Ativadas';
                notificationsButton.disabled = true;
                // Vamos configurar a "inscrição" (subscription) aqui
                await configurePushSubscription();
            } else {
                console.log('Permissão para notificações negada.');
            }
        });
    });
} else {
    console.log('Este navegador não suporta notificações.');
    notificationsButton.style.display = 'none'; // Esconde o botão se não houver suporte
}

// Função para obter a inscrição do usuário
async function configurePushSubscription() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
        console.log('Usuário já inscrito:', subscription);
        return;
    }
    
    // Para se inscrever, precisamos de uma "VAPID public key". 
    // Vamos gerar uma e colocar aqui. Por enquanto, usaremos um placeholder.
    const vapidPublicKey = 'SUA_VAPID_PUBLIC_KEY_AQUI'; // <-- IMPORTANTE: SUBSTITUIR
    
    try {
        const newSubscription = await registration.pushManager.subscribe({
            userVisibleOnly: true, // Sempre true
            applicationServerKey: vapidPublicKey
        });
        console.log('Nova inscrição:', newSubscription);
        
        // Em um aplicativo real, você enviaria 'newSubscription' para seu servidor
        // para que ele possa enviar notificações para este usuário específico.
        // await fetch('/api/subscribe', {
        //     method: 'POST',
        //     body: JSON.stringify(newSubscription),
        //     headers: { 'Content-Type': 'application/json' }
        // });
    } catch (error) {
        console.error('Falha ao se inscrever:', error);
    }
}