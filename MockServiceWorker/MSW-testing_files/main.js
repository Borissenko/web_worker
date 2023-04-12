import { createApp } from 'vue'
import App from './App.vue'

import './assets/main.css'
import {worker} from "./MSW/seviceWorker"


if (process.env.NODE_ENV === 'development') {   // << Это ЗАПУСК  MSW для подмены бакенда в процессе разработки.
  worker.start()
}

createApp(App).mount('#app')
