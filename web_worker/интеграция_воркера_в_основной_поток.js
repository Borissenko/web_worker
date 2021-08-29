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




//#1. Via Store.
//main.vue
methods: {
  workForWorker(args) {
    this.$store.dispatch('set_user_camera', args)
    .then(() => {              //в варианте №3 это почему-то не срабатывает - там then() запускается раньше, чем поступает результат работы воркера.
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





//#2. Via Promise




//#3. Когда компонент, использующий воркер, сам используется в роли дочки,
//причем когда в родителе - несколько однотипных дочек.

//В этом случае надо индексировать обращение каждой дочки к одному и тому же воркеру,
//что бы результаты работы воркера возвращались в четко определенную дочку.

//Причем здесь требуется watcher, чтобы избежать преждевременного изьятия "результата" работы воркера, котрыйф будет запаздывать.
//Применение then(), подсоединенного к диспатчу, не помогает. Then() будет получать еще не заполненный результатом работы воркера промис.

//component.vue  //дочка
  data() ({
    treeKey: '',   //ключ ДАННОГО экземпляра дочки
    result: null   //<<результат работы воркера.
  }),
  computed: {
    ...mapGetters([
      'GET_TREE_KEYS'
    ]),
  },
  watch: {   //Ключевое место. Обеспечивает изьятие результата работы воркера ПОСЛЕ формирования этого результата.
    GET_TREE_KEYS(newVal) {
      if (newVal.length > 0 && newVal.includes(this.treeKey)) {
        this.result = this.$store.getters.get_for_Tree(this.treeKey);   //<<получение результата работы воркера.
      }
    }
  },
  mounted () {
    this.treeKey = Math.floor(Math.random() * 10000000).toString();  //ключ, специфичный для ДАННОГО экземпляра компонента vue, используемого в роли дочки.
  },
  beforeDestroed() {
    //удаляем из стора ключи и результаты работы воркера для данной дочки.
  },
 methods: {
  complex() {
     this.$store.dispatch('runWorker', {      //>>запуск action, который будет запускать воркер.
       arguments: {},
       key: this.treeKey
     })
   }
 }

 
 //store
import WorkerService from '../../static/webWorkers/main.js'    //конструктор для создания функций по работе с воркером.

state: {
  treeDatas: {},   //результаты работы воркера по всем экземплярам дочки component.vue.
  treeKeys: []   //массив ключей всех экземпляров компонента Tree.vue, присутствующих в интерфейс в роли дочек на текущий момент.
},
getters: {
  GET_TREE_KEYS: st => st.treeKeys,
  get_for_Tree: st => key => {
    if (st.treeDatas[key]) {
      let keyIndex = st.treeKeys.findIndex(item => item === key)
      st.treeKeys.splice(keyIndex, 1)
      return st.treeDatas[key]
    }
    return null
  },
},
actions: {
  runWorker ({commit}, data) {    //actions
    const treeWorkerService = new WorkerService('../../static/webWorkers/TreeWorker.js');
    //в момент создания экземпляра конструктора внутри последнего мы прикручиваем файл /TreeWorker.js, в котором прописан код воркера.
    
    function callback(fromWorker) {
      commit('set_for_Tree', {fromWorker, key: data.key});  //вытаскиваем результат работы воркера и начинаем его интегрировать в основной код.
      treeWorkerService.terminate();
    }
    treeWorkerService.addListenerCallback('getCamerasForTree', callback);  //декларируем колбэк для потока вверх из воркера.
    treeWorkerService.runMessage(data);   //озадачиваем воркер.
  },
},
mutations: {
  set_for_Tree (state, {fromWorker, key}) {    //mutations
    Vue.set(state.treeDatas, key, fromWorker);
    state.treeKeys.push(key)    //массив ключей всех экземпляров компонента Tree.vue, присутствующих в интерфейсе на текущий момент.
  },
}





