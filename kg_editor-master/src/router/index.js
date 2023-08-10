import Vue from 'vue'
import Router from 'vue-router'
const index = () => import('../pages/index.vue')
const robot = () => import('../pages/robot.vue')

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'index',
      component: index
    },
    {
      path: '/robot',
      name: 'robot',
      component: robot
    }
  ]
})
