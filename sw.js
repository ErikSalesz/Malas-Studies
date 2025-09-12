const CACHE_NAME = 'meu-pwa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/style.css',
  '/scripts/main.js',
  '/assets/icon-192x192.png',
  '/assets/icon-512x512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se o recurso estiver no cache, retorna ele. Caso contrário, busca na rede.
        return response || fetch(event.request);
      }
    )
  );
});

// Este evento 'push' é acionado quando o servidor envia uma notificação
self.addEventListener('push', event => {
  console.log('Push recebido!');
  
  // Extrai os dados da notificação. Podemos enviar um JSON do servidor.
  let data = { title: 'Nova Mensagem!', body: 'Você tem uma nova notificação.' };
  if (event.data) {
    data = event.data.json();
  }
  
  const options = {
    body: data.body,
    icon: 'assets/icon-192x192.png', // Ícone que aparece na notificação
    badge: 'assets/icon-192x192.png' // Ícone para a barra de status em alguns dispositivos
  };
  
  // Pede ao navegador para mostrar a notificação
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});