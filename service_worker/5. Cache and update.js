Данный рецепт решает проблему актуальности данных, чего не было в рецепте №2.
Иными словами мы получим обновлённый контент, но с задержкой до следующей загрузки страницы.
  
  
  Решение

Как и в предыдущем варианте, в данном рецепте SW сначала отвечает из кэша, чтобы доставить быстрые ответы,
  но при этом обновляет данные кэша из сети.
  
  
const CACHE = 'cache-and-update-v1';

// При установке воркера мы должны закешировать часть данных (статику).
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(['/img/background']))
  );
});

// при событии fetch, мы используем кэш, и только потом обновляем его данным с сервера
self.addEventListener('fetch', function(event) {
  // Мы используем `respondWith()`, чтобы мгновенно ответить без ожидания ответа с сервера.
  event.respondWith(fromCache(event.request));
  // `waitUntil()` нужен, чтобы предотвратить прекращение работы worker'a до того как кэш обновиться.
  event.waitUntil(update(event.request));
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
      cache.put(request, response)
    )
  );
}