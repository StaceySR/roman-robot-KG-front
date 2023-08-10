import Vue from 'vue'
// import App from './App'
import elementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// import router from './router'
import store from './store/store'
import '../static/reset.css'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import '@mdi/font/css/materialdesignicons.css'
import G6 from '@antv/g6'
import index from './pages/index'
import robot from './pages/robot'

Vue.use(G6)
Vue.use(elementUI)
Vue.use(Vuetify)

Vue.config.productionTip = false

/* eslint-disable no-new */
// new Vue({
//   el: '#app',
//   router,
//   store,
//   vuetify: new Vuetify(),
//   components: { App },
//   template: '<App/>'
// })

const NotFound = { template: '<p>Page not found</p>' }
const routes = {
  '/': index,
  '/robot': robot
}

new Vue({
  el: '#app',
  store,
  vuetify: new Vuetify(),
  data: {
    currentRoute: window.location.pathname
  },
  computed: {
    ViewComponent () {
      return routes[this.currentRoute] || NotFound
    }
  },
  render (h) { return h(this.ViewComponent) }
})
