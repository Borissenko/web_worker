export default function(url) {
  const instance = this;
  const  listenerCallbackList = {};    //пара "имя_колбэка"-"функция_колбэка".

  //ИНИЦИАЦИЯ воркера.
  var workerInstance;
  if (window.Worker) {
    workerInstance = new Worker(url);
  }
  else {
    console.log("window.Worker is't supported");
  }

  //обработчик ошибок воркера
  const onError = e => console.log(`error at the ${e.filename}, Line: ${e.lineno}, Message: ${e.message}`);
  workerInstance.addEventListener('error', onError, false);

  //прием потока вверх из воркера =>> запуск его колбэка, который прописан в index.js
  workerInstance.onmessage = function(event) {
    if (event.data instanceof Object &&
      event.data.hasOwnProperty('callbackName') &&
      event.data.hasOwnProperty('callbackArguments')) {
      listenerCallbackList[event.data.callbackName].call(instance, event.data.callbackArguments);
    } else {
      console.log(`wrong event.data at the ${url} => ${event.data}`);
    }
  }

  //добавление/удаление колбэков для кастомного потока вверх из воркера.
  this.addListenerCallback = function(name, listener) {
    listenerCallbackList[name] = listener;
  }

  this.removeListenerCallback = function(name) {
    delete listenerCallbackList[name];
  }

  //поток вниз внутрь воркера
  this.runMessage = function(pl) {
    workerInstance.postMessage(pl);
  }

  //принудительная остановка воркера
  this.terminate = function() {
    workerInstance.terminate();
  }
}

