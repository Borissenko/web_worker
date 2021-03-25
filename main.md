# Определение
//https://developer.mozilla.org/ru/docs/Web/API/Web_Workers_API/Using_web_workers
это потоки, принадлежащие браузеру, которые можно использовать для выполнения JS-кода 
без блокировки цикла событий, вычисления выполняются параллельно.

Это изолированная среда, которая изолирована от 
объекта window, 
объекта document, 
прямого доступа в Интернет 
- у них разная область видимости с вебвокером.


Веб-воркеры не являются частью JavaScript. 
Они представляют собой возможность браузера, к которой можно получить доступ посредством JavaScript.

Код должен быть выделен в отдельный файл(!). Это важно запомнить.

ЗАПУСК кода воркера происходит при инициации экземпляра воркера.


# Виды
## Выделенные воркеры (Dedicated Workers)


## Разделяемые воркеры (Shared Workers)
https://developer.mozilla.org/ru/docs/Web/API/Web_Workers_API/Using_web_workers
https://github.com/mdn/simple-shared-worker

## Сервис-воркеры (Service Workers)



# Декларация, запуск, перезапуск воркера.
if (window.Worker) {                               //alternatively - (typeof(window.Worker) !== "undefined"){}
  var myWorker = new Worker('task.js');            //инициация и ПЕРВЫЙ запуск
  myWorker.postMessage({age: 5});                  //ПОТОК ВНИЗ, в воркер, и ПЕРЕЗАПУСК воркера с новыми аргументами
}

браузер создаст новый поток, который асинхронно загрузит этот файл, и 
начнётся выполнение кода воркера. 
При ошибке 404 сообщения об ошибках не выводятся.(!)




# import кода to worker
- как осуществить импорт JS-кода из других файлов в воркер
importScripts('foo.js', 'bar.js')

Скрипты могут быть загружены в произвольном порядке, 
но их исполнение будет в  том порядке, в котором имена файлов были переданы в importScripts(). 

Функция выполняется синхронно, т.е.
importScripts() не вернёт исполнение, пока все скрипты не будут загружены и исполнены.




# Обмен данными с веб-воркером
##1. = via postMessage({})
в его передаем JSON с аргументами.
данные КЛОНИРУЮТСЯ, а не передается ссылка.

### НеСЕЛЕКТИВНЫЕ потоки вниз и вверх.
- postMessage - посылаем
- onmessage - принимаем

//main.js
myWorker.postMessage([first.value, second.value]);    //1a. посылаем в воркер, [] & {}.

myWorker.onmessage = function(e) {                //2b. принимаем из воркера.
  console.log(e.data);
}


//worker.js
Здесь не приписываем предлог myWorker., а пишем сразу onmessage
т.к. myWorker здесь выступает в качестве глобального объекта (типо window).

onmessage = function(e) {           //1b. обработчик по приему data из main.js.
  var aa = e.data[0] + e.data[1]
  postMessage(aa)                  //2a. посылаем обратно в main.js
}



### СЕЛЕКТИВНЫЙ поток вверх из воркера (custom "listeners").
//main.js
myWorker.addListener('doAlert', function (time, unit) {       //3b. принимаем из воркера СЕЛЕКТИВНО.
  alert(time + unit)
});


//worker.js
reply('doAlert', 3, 'seconds');       //3a. луч doAlert вверх to custom "listeners", несет 2 аргумента.




### Custom поток вверх на основе неселективной технологии.
//main.js
const instance = this
const listenerCallbackList = {}    //пара "имя_колбэка"-"функция_колбэка".

//принимаем из воркера неселективно и, в зависимости от поступающих параметров, запускаем СООТВЕТСТВУЮЩИЙ колбэк.
workerInstance.onmessage = function(event) {
  if (event.data instanceof Object &&
    event.data.hasOwnProperty('callbackName') &&
    event.data.hasOwnProperty('callbackArguments')) {
      listenerCallbackList[event.data.callbackName].apply(instance, event.data.callbackArguments)
      //это же в простой форме
      колбэк_слушателя.apply(контекст_экземпляра_конструктора_в_котором_запустится_колбэк, [аргументы_для_колбэка,они_потупают_из_воркера])   //контекст важен, только если в колбэке есть this. Иначе указываем для формальности.
   } else {
     this.defaultListenerCallback.call(instance, event.data);
   }
}

//добавление/удаление колбэков для неселективного потока вверх из воркера.
addListenerCallback = function(name, listener) {
  listenerCallbackList[name] = listener;
}

removeListenerCallback = function(name) {
  delete listenerCallbackList[name];
}


//worker.js
//лист методов воркера
const functionList = {
  getDifference: function(a, b) {
    throwItUp('printStuff', a - b);           //функция, запускающая НЕСЕЛЕКТИВНЫЙ поток вверх
  },
  waitSomeTime: function() {
    setTimeout(function() {
      throwItUp('doAlert', 3, 'seconds');       //функция, запускающая НЕСЕЛЕКТИВНЫЙ поток вверх
    }, 3000);
  }
}

//функция, запускающая НЕСЕЛЕКТИВНЫЙ поток вверх
function throwItUp() {   //аргументы не задекларированы явно, но они вставляются через геттер функции 'arguments'.
  if (arguments.length < 1) {
    throw new TypeError('throwItUp takes at least one argument');
      return;
  }
  postMessage({
    callbackName: arguments[0],    //'printStuff' или 'doAlert'

####// переводим массивоподобный объект "arguments" {0: item_1, 1: item_2, 2: item_3, length: 3} в нормальный массив [item_1, item_2, item_3].
    callbackArguments: Array.prototype.slice.call(arguments, 1)       
  });                                                                     //аргумент 1 - для функции .slice(1). Т.о. будет сделан клон массива, но начиная с 1-члена исходного массива.
}                                                                        //Эта запись аналогична arguments.slice(1). Припон был в том, что массивоподобный объект не имеет метода .slice(1).
                                                                       // Пришлось этот метод заимствовать у Array.prototype и применять via .call() к arguments.







##2. Обмен данными via  BroadcastChannel
- поддерживается только броузером chrom & firefox.
Все вкладки браузера, iframe или воркеры, относящиеся к одному источнику, 
могут передавать и принимать широковещательные сообщения.
  
Передача мгновенная, без задержку на клонирование, как варианте передачи via postMessage({}).
Передается только в формате arrayBuff.

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





# Остановить воркер.
//main.js
>  myWorker.terminate().

//worker.js
>  self.close()     //self является альтернативой для this.




# Обработка ошибок.
- При ошибке 404 сообщения об ошибках автоматически не выводятся.
- Ошибки необходимо активно выслушивать.

function onError(e) {
console.log('Line: ' + e.lineno);
console.log('In: ' + e.filename);
console.log('Message: ' + e.message);
}

var myWorker = new Worker('workerWithError.js');
myWorker.addEventListener('error', onError, false);        //<<= слушатель ошибок воркера.
myWorker.postMessage();


//workerWithError.js  (воркер с преднамеренной демонстрационной ошибкой).
self.addEventListener('message', function(e) {
  postMessage(x * 2);       // Намеренная ошибка. 'x' не определено.
};




# Что доступно в web-worker'e
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
DOM
Объект window
Объект document
Объект parent


# Стратегия интеграции в основной код.
Исполнение воркера выносится в параллельный поток, как у промисов, но для воркеров нет async/awey.
Результат от воркера опоздает для использования в основном коде.

Поэтому надо писать не линейно,
а ЗАПУСКАТЬ продолжение кода основного потока ПОСЛЕ получения воркером своего результата.

Инициатор запуска - прослушка воркера:

myWorker.onmessage = function(e) {                //2b. принимаем из воркера.
  continuanceOfMainStrime(e.data)
  commit('doItThen', e.data)
}


 






