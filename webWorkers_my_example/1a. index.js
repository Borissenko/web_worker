//Это JS основного потока

import WorkerService from '../webWorkers/main.js'

let store = {
  actions: {
    PUT_TO_WORKER({commit}, cameras) {
      const myWorker = new WorkerService('../webWorkers/worker_my.js');
      
      function callback(dataFromWorker) {
        commit('set_user_camera', dataFromWorker);    //=>> выполняем что-либо далее, OUTPUT.
        myWorker.terminate();
      }
  
      myWorker.addListenerCallback('worker_my', callback);  //декларируем колбэк для потока вверх из воркера.
      myWorker.runMessage(cameras);   //озадачиваем воркер. INPUT.
    },
  }
}




















