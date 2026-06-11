import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/game',
    name: 'game',
    component: () => import('@/views/GameView.vue')
  },
  {
    path: '/select',
    name: 'select',
    component: () => import('@/views/SelectView.vue')
  },
  {
    path: '/debug',
    name: 'debug',
    component: () => import('@/views/DebugView.vue')
  },
  {
    path: '/pvz',
    name: 'pvz',
    component: () => import('@/views/PvZTestView.vue')
  },
  {
    path: '/match3',
    name: 'match3',
    component: () => import('@/views/Match3SimpleTest.vue')
  },
  {
    path: '/index.html',
    redirect: '/'
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
