function doIt(dataIn) {
  let dataOut = dataIn + 'WORK!'
  postMessage({callbackName: 'callbackName', callbackArguments: dataOut});    //кастомный поток вверх
}

onmessage = function (event) {
  console.log('4  event.data ==============', event.data)
  if (event.data != null) {
    doIt(event.data);
  } else {
    console.log(`error at the worker_my.js, event.data = ${event.data}`);
  }
}



