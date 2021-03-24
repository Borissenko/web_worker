# Веб-воркеры —
//https://developer.mozilla.org/ru/docs/Web/API/Web_Workers_API/Using_web_workers
это потоки, принадлежащие браузеру, которые можно использовать для выполнения JS-кода 
без блокировки цикла событий.

Это изолированная среда, которая изолирована от 
объекта window, 
объекта document, 
прямого доступа в Интернет 
- у них разная область видимости с вебвокером.


при их использовании вычисления выполняются параллельно. 
Перед нами настоящая многопоточность.

Веб-воркеры не являются частью JavaScript. 
Они представляют собой возможность браузера, 
к которой можно получить доступ посредством JavaScript.


Код должен быть выделен в отдельный файл(!). Это важно запомнить.


# Виды воркеров
## Выделенные воркеры (Dedicated Workers)


## Разделяемые воркеры (Shared Workers)
https://developer.mozilla.org/ru/docs/Web/API/Web_Workers_API/Using_web_workers
https://github.com/mdn/simple-shared-worker

## Сервис-воркеры (Service Workers)



# Декларация
if (window.Worker) {                               //alternatively - (typeof(window.Worker) !== "undefined"){}
  var myWorker = new Worker('task.js');            //инициация и запуск
  myWorker.postMessage({age: 5});                  //ПОТОК ВНИЗ, в воркер.
}

браузер создаст новый поток, который асинхронно загрузит этот файл, и 
начнётся выполнение кода воркера. 
При ошибке 404 сообщения об ошибках не выводятся.(!)




# import
importScripts('foo.js', 'bar.js')

Скрипты могут быть загружены в произвольном порядке, 
но их исполнение будет в  том порядке, в котором имена файлов были переданы в importScripts(). 

Функция выполняется синхронно. 
importScripts() не вернёт исполнение, пока все скрипты не будут загружены и исполнены.




# Обмен данными с веб-воркером
##1. via postMessage({})
в его передаем JSON с аргументами.
данные КЛОНИРУЮТСЯ, а не передается ссылка.

### Потоки вниз и вверх.
//main.js     - in.
myWorker.postMessage([first.value, second.value]);    //1a. посылаем в воркер

myWorker.onmessage = function(e) {                //2b. принимаем_1 из воркера.
  console.log(e.data);
}

myTask.addListener('doAlert', function (time, unit) {    //3b. custom "listeners", принимаем_2 из воркера.
  console.log(time, unit)
});



//worker.js     -out.
Здесь не приписываем предлог типа myWorker., а пишем сразу onmessage
т.к. myWorker здесь выступает в качестве глобального объекта (типо window).

onmessage = function(e) {           //1b. обработчик по приему data из main.js.
  var aa = e.data[0] + e.data[1]
  postMessage(aa)                  //2a. посылаем_1 обратно в main.js
}

reply('doAlert', 3, 'seconds');       //3a. луч вверх_2 at custom "listeners", несет 2 аргумента.



### Остановить воркер
//main.js
>  worker.terminate().

//worker.js
>  self.close().



##2. via  BroadcastChannel
- поддерживается только броузером chrom & firefox.
Все вкладки браузера, iframe или воркеры, относящиеся к одному источнику, 
могут передавать и принимать широковещательные сообщения:

// Подключение к широковещательному каналу
var bc = new BroadcastChannel('test_channel');

// Пример отправки сообщения
bc.postMessage('This is a test message.');

// Пример простого обработчика событий, который
// выводит сообщения в консоль
bc.onmessage = function (e) {
console.log(e.data);
}

// Отключение от канала
bc.close()




# Что доступно в web-wker'e
WebSockets,
IndexedDB,
Объект navigator
Объект location (только для чтения)
XMLHttpRequest (НО атрибуты responseXML и channel объекта XMLHttpRequest всегда возвращают null)
setTimeout()/clearTimeout()
setInterval()/clearInterval()
Кэш приложения
Импорт внешних скриптов с использованием importScripts()
Создание других веб-воркеров




# Что НЕдоступно в web-wker'e
DOM (это не потокобезопасно)
Объект window
Объект document
Объект parent




# Обработка ошибок
- работает через worker.addEventListener('error', onError, false)

function onError(e) {
  console.log('Line: ' + e.lineno);
  console.log('In: ' + e.filename);
  console.log('Message: ' + e.message);
}

var worker = new Worker('workerWithError.js');
worker.addEventListener('error', onError, false);    //<<= слушатель ошибок в воркере.
worker.postMessage();

//workerWithError.js, воркер с преднамеренной демонстрационной ошибкой.
self.addEventListener('message', function(e) {
  postMessage(x * 2);       // Намеренная ошибка. 'x' не определено.
};



# Пример
//https://github.com/mdn/simple-web-worker








