Подходит для медийных сайтов, где очень много медиа-контента.
  Картинки и видео могут отдаваться долго, наша задача закэшировать их.
  При последующих запросах на сервер мы будем отдавать данные из кэша.
  Имеем в виду, что данные могут быть уже неактуальными, для нас главное здесь — избавить пользователя от ожидания загрузки файлов.
  
  
  Решение

  Данный вариант подойдёт, если скорость загрузки контента для вас приоритетна, но хотелось бы показать наиболее актуальные данные.
  
  Механизм работы следующий: идёт запрос на ресурс с ограничением по времени, например 400ms,
  если данные не были получены в течении этого времени, мы отдаём их из кэша.
  
  SW в этом рецепте пытается получить самый актуальный контент из сети, но если запрос занимает слишком много времени, то данные будут взяты из кэша. Эту проблему можно решить путём выставления timeout’а на запрос.
  
  
const CACHE = 'network-or-cache-v1';
const timeout = 400;
// При установке воркера мы должны закешировать часть данных (статику).
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll([
        '/img/background'
      ])
    ));
});

// при событии fetch, мы и делаем запрос, но используем кэш, только после истечения timeout.
self.addEventListener('fetch', (event) => {
  event.respondWith(fromNetwork(event.request, timeout)
    .catch((err) => {
      console.log(`Error: ${err.message()}`);
      return fromCache(event.request);
    }));
});

// Временно-ограниченный запрос.
function fromNetwork(request, timeout) {
  return new Promise((fulfill, reject) => {
    var timeoutId = setTimeout(reject, timeout);
    fetch(request).then((response) => {
      clearTimeout(timeoutId);
      fulfill(response);
    }, reject);
  });
}

function fromCache(request) {
// Открываем наше хранилище кэша (CacheStorage API), выполняем поиск запрошенного ресурса.
// Обратите внимание, что в случае отсутствия соответствия значения Promise выполнится успешно, но со значением `undefined`
  return caches.open(CACHE).then((cache) =>
    cache.match(request).then((matching) =>
      matching || Promise.reject('no-match')
    ));
}