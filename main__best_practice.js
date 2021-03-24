
<ul>
  <li><a id="firstLink" href="javascript:myTask.sendQuery('getDifference', 5, 3);">What is the difference between 5 and 3?</a></li>
  <li><a href="javascript:myTask.sendQuery('waitSomeTime');">Wait 3 seconds</a></li>
  <li><a href="javascript:myTask.terminate();">terminate the Worker</a></li>
</ul>

//main.js

//фабрика для костяка воркера
function QueryableWorker(url, defaultListener, onError) {
  const instance = this
  const workerInstance = new Worker(url)
  const  listeners = {}
  
  this.defaultListener = defaultListener || function() {};
  
  if (onError) {workerInstance.onerror = onError;}
  
  this.postMessage = function(message) {
    workerInstance.postMessage(message);
  }
  
  this.terminate = function() {
    workerInstance.terminate();
  }
  
  //методы добавления/удаления обработчиков.
  this.addListeners = function(name, listener) {
    listeners[name] = listener;
  }
  
  this.removeListeners = function(name) {
    delete listeners[name];
  }
  
  //метод, который проверит есть ли у worker-а обработчик, который мы собираемся вызвать.
  this.sendQuery = function() {
    if (arguments.length < 1) {
      throw new TypeError('QueryableWorker.sendQuery takes at least one argument');
      return;
    }
    workerInstance.postMessage({
      'queryMethod': arguments[0],
      'queryArguments': Array.prototype.slice.call(arguments, 1)
    });
  }
  
  workerInstance.onmessage = function(event) {           //принимаем из воркера.
    if (event.data instanceof Object &&
      event.data.hasOwnProperty('queryMethodListener') &&
      event.data.hasOwnProperty('queryMethodArguments')) {
      listeners[event.data.queryMethodListener].apply(instance, event.data.queryMethodArguments);
    } else {
      this.defaultListener.call(instance, event.data);
    }
  }
}

// init worker
var myTask = new QueryableWorker('my_task.js');

// custom "listeners"
myTask.addListener('printStuff', function (result) {
  console.log(result)
});

myTask.addListener('doAlert', function (time, unit) {
  alert(time + unit);
});
















