//https://developer.mozilla.org/ru/docs/Web/API/Web_Workers_API/Using_web_workers

<ul>
  <li><a href="javascript:myTask.sendQuery('getDifference', 5, 3);">What is the difference between 5 and 3?</a></li>
  <li><a href="javascript:myTask.sendQuery('waitSomeTime');">Wait 3 seconds</a></li>
  
  <li><a href="javascript:myTask.runPostMessage(data);">Wait 3 seconds</a></li>
  
  <li><a href="javascript:myTask.terminate();">terminate the Worker</a></li>
</ul>


//main.js

//конструктор для костяка воркера
function QueryableWorker(url, defaultListenerCallback, onError) {
  //==== Свободный JS конструктора
  const instance = this    //для смещения контекста у "колбэка workerInstance.onmessage". instance отождествляется с экземпляром конструктора (а это - объект), и обеспечивает доступ ко всему, что задекларировано в конструкторе с приписочкой "this.".
  const  listenerCallbackList = {}    //пара "имя_колбэка"-"функция_колбэка". Это не луч от воркера.
  
  //2. ИНИЦИАЦИЯ и ЗАПУСК(?) воркера. Происходит в момент создания экземпляра конструктора.
  var workerInstance
  if(window.Worker)
    //good
    workerInstance = new Worker(url)
  else
    console.log("window.Worker is't supported")
   
  
  //обработчик ошибок воркера - wrong.
  //good
  if (onError) workerInstance.onerror = onError
  const onErr = e => console.log(`error at the ${url}, Line: ${e.lineno}, In: ${e.filename}, Message: ${e.message}`);
  workerInstance.addEventListener('error', onErr, false)
  
  
  //==== ПЕРЕМЕННЫЕ конструктора
  //дефолтный колбэк для обработки неселективного потока вверх из воркера.
  this.defaultListenerCallback = defaultListenerCallback || function(fromWorker) { console.log(fromWorker) }
  
  
  //==== МЕТОДЫ конструктора
  //запускаем неселективный поток вниз внутрь воркера, с ПЕРЕзапуском воркера. Воркер запускается ПО КЛИКУ, из-вне.
  this.runMessage = function(pl) {       //'runPostMessage' - служебное слово!!!! Не использовать!! ))
    workerInstance.postMessage(pl);     //для этого потока ничего в воркере не сделано. Написано для примера.
  }
  
  //еще один метод, который ПО КЛИКУ из-вне ПЕРЕзапустит ОПРЕДЕЛЕННУЮ функцию в воркере, сообщив в нее свежие аргументы.
  this.sendQuery = function() {
    if (arguments.length < 1) {
      throw new TypeError('QueryableWorker.sendQuery takes at least one argument');
      return;
    }
    workerInstance.postMessage({
      'workerMethod': arguments[0],
      'workerArguments': Array.prototype.slice.call(arguments, 1)   //<< объяснения смотри в файле worker__best_practice.js.
    });
  }
  
  //принимаем из воркера неселективно и, в зависимости от поступающих параметров, запускаем СООТВЕТСТВУЮЩИЙ колбэк.
  workerInstance.onmessage = function(event) {
    if (event.data instanceof Object &&
      event.data.hasOwnProperty('callbackName') &&
      event.data.hasOwnProperty('callbackArguments')) {
      
      listenerCallbackList[event.data.callbackName].call(instance, event.data.callbackArguments)
      
      //это же в простой форме
      колбэк_слушателя.apply(контекст_экземпляра_конструктора_в_котором_запустится_колбэк, [аргументы_для_колбэка,они_потупают_из_воркера])   //контекст важен, только если в колбэке есть this. Иначе указываем для формальности.
      
    } else {
      this.defaultListenerCallback.call(instance, event.data);
    }
  }
  
  //остановка воркера
  this.terminate = function() {
    workerInstance.terminate();
  }
  
  //добавление/удаление колбэков для неселективного потока вверх из воркера.
  this.addListenerCallback = function(name, listener) {
    listenerCallbackList[name] = listener;
  }
  
  this.removeListenerCallback = function(name) {
    delete listenerCallbackList[name];
  }
}

//1. Создаем экземпляр конструктора, запуская прописанный в конструкторе свободный его JS-код.
var myTask = new QueryableWorker('my_task.js');


// декларируем колбэк для обработки неселективного потока вверх из воркера.
myTask.addListenerCallback('printStuff', function (result) {
  console.log(result)
});

myTask.addListenerCallback('doAlert', function (time, unit) {
  alert(time + unit);
});
















