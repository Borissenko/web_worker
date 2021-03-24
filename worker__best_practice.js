var queryableFunctions = {
  // пример #1: получить разницу между двумя числами
  getDifference: function(a, b) {
    reply('printStuff', a - b);          //луч вверх at custom "listeners"
  },
  // пример #2: подождать три секунды
  waitSomeTime: function() {
    setTimeout(function() {
      reply('doAlert', 3, 'seconds');       //луч вверх at custom "listeners", несет 2 аргумента.
    }, 3000);
  }
}

function reply() {
  if (arguments.length < 1) {
    throw new TypeError(' reply - takes at least one argument');
    return;
  }
  postMessage({
    queryMethodListener: arguments[0],
    queryMethodArguments: Array.prototype.slice.call(arguments, 1)
  });
}

/* This method is called when main page calls QueryWorker's postMessage method directly*/
function defaultReply(message) {
  // your default PUBLIC function executed only when main page calls the queryableWorker.postMessage() method directly
  // do something
}

onmessage = function(event) {
  if (event.data instanceof Object &&
    event.data.hasOwnProperty('queryMethod') &&
    event.data.hasOwnProperty('queryMethodArguments')) {
    queryableFunctions[event.data.queryMethod]
    .apply(self, event.data.queryMethodArguments);
  } else {
    defaultReply(event.data);
  }
}


// И имена свойств "queryMethod", "queryMethodListeners", "queryMethodArguments" могут быть любыми
// пока они согласуются с комплиментарными именами в QueryableWorker и worker.











