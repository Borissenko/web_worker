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
  
      myWorker.addListenerCallback('worker_my', callback);  //выбираем колбэк для потока вверх из воркера.
      //В конце кода воркера прописан postMessage(), который ознаменовывает окончание работы воркера и дает об этом сигнал.
      //Этот сигнал улавливается спец прослушивателем workerInstance.onmessage, который расположен в клавном JS-коде - в index.js, в экземпляре WorkerService,
      //Далее прослушиватель запускает определенную функцию. Какую функцию -
      //мы ее/callback/ предварительно декларируем в экземпляре WorkerService под произвольным именем/'worker_my'/, и далее имя этой функции/'worker_my'/ указываем в аргументах, вкладываемых в postMessage().
      
      //Если колбэк запускает commit(), то далее события протекают с реактивностью, т.е. с ПОДХВАТОМ ОБНОВЛЕННЫХ ДАННЫХ динамически и ПЕРЕрисовкой интерфейса.
      
      //Если ма воркер используем как сегмент обычной функции в methods(){}, то мы для интеграции "притормаживающего" кода воркера должны обернуть все в промис и использовать async/await.
      
      myWorker.runMessage(cameras);   //озадачиваем воркер. INPUT.
    },
  }
}




















