// sw.js (VERSÃO ATUALIZADA E MELHORADA)

// 1. Atualizamos a versão do cache
const CACHE_NAME = 'meu-pwa-cache-v18';

// 2. Atualizamos a lista de arquivos para refletir a nova estrutura
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/icon-192x192.png',
  '/assets/icon-512x512.png',
  
  // CSS
  '/styles/main.css',
  '/styles/base/_base.css',
  '/styles/base/_variables.css',
  '/styles/components/_header.css',
  '/styles/components/_timeline.css',
  '/styles/components/_fab.css',
  '/styles/components/_ui.css',

  // JavaScript
  '/scripts/main.js',

  '/scripts/components/theme-switcher.js',
  '/scripts/components/timeline.js',
  '/scripts/components/date-picker.js',

  '/scripts/features/push-notifications.js',
  '/scripts/features/fab-handler.js',
  '/scripts/features/agenda-handler.js',
  '/scripts/features/update-handler.js',

  // Bibliotecas

  '/scripts/lib/supabase-client.js',
];

// Evento de 'install': Salva os arquivos e se prepara para ativar
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto e arquivos sendo salvos');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Força o novo Service Worker a se preparar para ativar
        return self.skipWaiting(); 
      })
  );
});

// Evento de 'activate': Limpa caches antigos e assume o controle
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      ).then(() => {
        // Assume o controle de todas as abas abertas
        return self.clients.claim(); 
      });
    })
  );
});
// Evento de 'fetch': Intercepta as requisições e serve do cache se disponível
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

// Evento de 'push': Continua igual, para as notificações
self.addEventListener('push', event => {
  console.log('Push recebido!');
  
  let data = { title: 'Nova Mensagem!', body: 'Você tem uma nova notificação.' };
  if (event.data) {
    data = event.data.json();
  }
  
  const options = {
    body: data.body,
    icon: 'assets/icon-192x192.png',
    badge: 'assets/icon-192x192.png'
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});