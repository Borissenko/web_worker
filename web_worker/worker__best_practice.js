
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
function throwItUp() {  //аргументы не задекларированы явно, но они вставляются через геттер функции arguments
  if (arguments.length < 1) {
    throw new TypeError('throwItUp takes at least one argument');
    return;
  }
  postMessage({            //Потребность в таком усложнении - когда один и тот же воркер, в зависимости от входящих установок /event.data.workerMethod/, запускает в себе разные функции с разной структурой ретерна у них.
    callbackName: arguments[0],    //'printStuff' или 'doAlert'
    callbackArguments: Array.prototype.slice.call(arguments, 1)          // переводим массивоподобный объект "arguments" {0: item_1, 1: item_2, 2: item_3, length: 3} в нормальный массив [item_1, item_2, item_3].
  });                                                                            //аргумент 1 - для функции .slice(1). Т.о. будет сделан клон массива, но начиная с 1-члена исходного массива.
}                                                                               //Эта запись аналогична arguments.slice(1). Припон был в том, что массивоподобный объект не имеет метода .slice(1).
                                                                               // Пришлось этот метод заимствовать у Array.prototype и применять via .call() к arguments.



function defaultReply(message) {
  console.log(message)
}



onmessage = function(event) {           //ПОТОК ВНИЗ, в воркер.
  if (event.data instanceof Object &&
    event.data.hasOwnProperty('workerMethod') &&
    event.data.hasOwnProperty('workerArguments')) {
  
    functionList[event.data.workerMethod]         //запуск в воркере определенной функции
    .call(self, event.data.workerArguments);      //self в коде воркеров альтернативен this.  Здесь польза от .call - сообщаем аргументы для функции и ее запуск.
  } else {
    defaultReply(event.data);
  }
}







