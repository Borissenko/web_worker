import Vue from 'vue'
import Vuex from 'vuex'
import WorkerService from '../workers/main_my'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    fromWorker: '5'
  },
  getters: {
    get_user: state => state.fromWorker
  },
  mutations: {
    set_user: (state, pl) => state.fromWorker = pl
  },
  actions: {
    work_user({commit}, pl) {
      console.log('02 ==============', pl)
      const myWorkerService = new WorkerService();
  
      function callback(fromWorker) {
        commit('set_user', fromWorker);
        
        console.log('25  fromWorker ==============', fromWorker)
        
        myWorkerService.terminate();
      }
      myWorkerService.addListenerCallback('callbackName', callback);  //декларируем колбэк для потока вверх из воркера.
      myWorkerService.runMessage(pl);   //озадачиваем воркер.
    }
  }
})
