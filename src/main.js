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
  .use(Oruga, {
    ...bulmaConfig,
    iconPack: 'fas',
    modal: {
      override: true,
      rootClass: (_, { props }) => {
        const classes = ['modal']
        if (props.active || props.programmatic) { classes.push('is-active') }
        return classes.join(' ')
      },
      overlayClass: 'modal-background',
      contentClass: 'animation-content modal-card',
      closeClass: 'modal-close is-large',
      fullScreenClass: 'is-full-screen'
    }
  })
  .mount('#app')
