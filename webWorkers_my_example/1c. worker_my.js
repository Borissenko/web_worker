function doIt(dataIn) {
  let dataOut = dataIn
  postMessage({callbackName: 'worker_my', callbackArguments: dataOut});    //кастомный поток вверх
}

onmessage = function (event) {
  if (event.data != null && event.data.length > 0) {
    doIt(event.data);
  } else {
    console.log(`error at the worker_my.js, event.data = ${event.data}`);
  }
}



