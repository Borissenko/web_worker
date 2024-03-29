Существует проблема, когда браузер по умолчанию выдаёт вам сообщение о том, что вы офлайн.
  Я называю это проблемой, так как:
  
  Экран отличается от вашего приложения.
  Экран выглядит по-разному в каждом браузере.
  Сообщение не может быть локализовано.
  
  
  
  
  Лучшим решением в данной ситуации было бы показать пользователю пользовательский фрагмент автономного кэша.
  С помощью SW мы можем подготовить заранее заготовленный ответ, говорящий о том,
  что приложение вне сети и его функционал на определенное время ограничен.
  
  
  Решение

Нужно отдать fallback-данные, если нет доступа к ресурсам (сеть и кэш).
Данные подготавливаются заранее и кладутся как статичные ресурсы, доступные SW.
  
  const CACHE = 'offline-fallback-v1';

// При установке воркера мы должны закешировать часть данных (статику).
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(['/img/background']))
      // `skipWaiting()` необходим, потому что мы хотим активировать SW
      // и контролировать его сразу, а не после перезагрузки.
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  // `self.clients.claim()` позволяет SW начать перехватывать запросы с самого начала,
  // это работает вместе с `skipWaiting()`, позволяя использовать `fallback` с самых первых запросов.
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event) {
  // Можете использовать любую стратегию описанную выше.
  // Если она не отработает корректно, то используейте `Embedded fallback`.
  event.respondWith(networkOrCache(event.request)
    .catch(() => useFallback()));
});

function networkOrCache(request) {
  return fetch(request)
    .then((response) => response.ok ? response : fromCache(request))
    .catch(() => fromCache(request));
}

// Наш Fallback вместе с нашим собсвенным Динозавриком.
const FALLBACK =
  '<div>\n' +
  '    <div>App Title</div>\n' +
  '    <div>you are offline</div>\n' +
  '    <img src="/svg/or/base64/of/your/dinosaur" alt="dinosaur"/>\n' +
  '</div>';

// Он никогда не упадет, т.к мы всегда отдаем заранее подготовленные данные.
function useFallback() {
  return Promise.resolve(new Response(FALLBACK, { headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }}));
}

function fromCache(request) {
  return caches.open(CACHE).then((cache) =>
    cache.match(request).then((matching) =>
      matching || Promise.reject('no-match')
    ));
}