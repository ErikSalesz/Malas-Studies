// sw.js (VERSÃO ATUALIZADA E MELHORADA)

// 1. Atualizamos a versão do cache
const CACHE_NAME = 'meu-pwa-cache-v3';

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
  '/styles/components/_date-picker.css',

  // JavaScript
  '/scripts/main.js',

  '/scripts/components/theme-switcher.js',
  '/scripts/components/timeline.js',
  '/scripts/components/date-picker.js',

  '/scripts/features/push-notifications.js',
  '/scripts/lib/supabase-client.js',
];

// Evento de 'install': Salva os arquivos essenciais em cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto e arquivos sendo salvos');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento de 'activate': Limpa os caches antigos
// Isso é crucial para garantir que a nova versão do cache seja usada
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Se o nome do cache não for o atual, ele é deletado
          if (cacheName !== CACHE_NAME) {
            console.log('Limpando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
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