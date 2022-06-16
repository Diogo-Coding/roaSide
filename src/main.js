import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Theme and styles
import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'

import './assets/styles/main.scss'
import '@fortawesome/fontawesome-free/css/all.css'

createApp(App)
  .use(store)
  .use(router)
  .use(Oruga, bulmaConfig)
  .mount('#app')
