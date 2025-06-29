import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
//import TestView from '../views/TestView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/sobre',
      name: 'sobre',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/opcoes',
      name: 'opcoes',
      component: () => import('../views/OptionsView.vue'),
    },
    ,
    {
      path: '/editor',
      name: 'editor',
      component: () => import('../views/EditorView.vue'),
    },
  ],
})

export default router
