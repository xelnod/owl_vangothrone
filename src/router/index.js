import Vue from 'vue'
import Router from 'vue-router'
import Vangothrone from '@/components/Vangothrone'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Vangothrone',
      component: Vangothrone
    }
  ],
  mode: 'history'
})
