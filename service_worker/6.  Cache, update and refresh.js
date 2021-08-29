Расширение рецепта №3.
В данном решении мы обновляем контент в фоне, но всегда можем указать пользователю, что данные на странице поменялись.
  Примером может служить создание приложений, в которых происходит редактирование контента в фоне.
  Так, вы читаете статью на новостом сайте и получаете уведомление о том, что данные на странице обновились
и появилась более свежая информация.
  
  
  
  
  Решение

Рецепт позволяет SW отвечать из кэша, чтобы отдавать быстрые ответы, а также обновлять данные в кэше из сети.
  Когда запрос выполнится успешно, пользовательский интерфейс будет обновлён автоматически или посредством UI-контрола.
  
  Используйте содержимые данные из кэша, но в то же время выполняйте запрос на обновление записи кэша и информируйте UI о новый данных.
  
  const CACHE = 'cache-update-and-refresh-v1';

// При установке воркера мы должны закешировать часть данных (статику).
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(['/img/background']))
  );
});

// При запросе на сервер мы используем данные из кэша и только после идем на сервер.
self.addEventListener('fetch', (event) => {
  // Как и в предыдущем примере, сначала `respondWith()` потом `waitUntil()`
  event.respondWith(fromCache(event.request));
  event.waitUntil(
    update(event.request)
      // В конце, после получения "свежих" данных от сервера уведомляем всех клиентов.
      .then(refresh)
  );
});

function fromCache(request) {
  return caches.open(CACHE).then((cache) =>
    cache.match(request).then((matching) =>
      matching || Promise.reject('no-match')
    ));
}

function update(request) {
  return caches.open(CACHE).then((cache) =>
    fetch(request).then((response) =>
      cache.put(request, response.clone()).then(() => response)
    )
  );
}

// Шлём сообщения об обновлении данных всем клиентам.
function refresh(response) {
  return self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      // Подробнее про ETag можно прочитать тут
      // https://en.wikipedia.org/wiki/HTTP_ETag
      const message = {
        type: 'refresh',
        url: response.url,
        eTag: response.headers.get('ETag')
      };
      // Уведомляем клиент об обновлении данных.
      client.postMessage(JSON.stringify(message));
    });
  });
}