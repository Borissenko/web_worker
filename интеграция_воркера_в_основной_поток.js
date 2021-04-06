// # Стратегия интеграции в основной код.
//   Исполнение воркера выносится в параллельный поток, как у промисов, но для воркеров нет async/awey.
//   Результат от воркера опоздает для использования в основном коде.
//
//   Поэтому надо писать не линейно,
//   а ЗАПУСКАТЬ продолжение кода основного потока ПОСЛЕ получения воркером своего результата.

// Во всех случаях инициатор запуска - прослушка воркера:

myWorker.onmessage = function(e) {                //2b. принимаем из воркера.
  continuanceOfMainStrime(e.data)
  commit('doItThen', e.data)
}

//# Via Store.
//main.vue
methods: {
  workForWorker(args) {
    this.$store.dispatch('set_user_camera', args)
    .then(() => {
      this.returnedData = this.$store.getters.get_for_Tree;
    })
  }
}

//store/actions
set_user_camera ({commit}, cameras) {    //actions
  const myWorkerService = new WorkerService('../../static/webWorkers/setUserCameraWorker.js');
  
  function callback(fromWorker) {
    commit('set_for_Tree', fromWorker);
    myWorkerService.terminate();
  }
  myWorkerService.addListenerCallback('callbackName', callback);  //декларируем колбэк для потока вверх из воркера.
  myWorkerService.runMessage(cameras);   //озадачиваем воркер.
},

//store/mutations
set_for_Tree (state, treeData) {    //mutations
  state.treeData = treeData;
},

//store/data
treeData: null

//store/getters
get_for_Tree: st => st.treeData,




//# Via Promise






