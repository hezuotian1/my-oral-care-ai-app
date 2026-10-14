import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/',
    component: () => import('@/components/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/home' },
      { path: 'home', name: 'home', component: () => import('@/views/HomeView.vue') },
      { path: 'scan', name: 'scan', component: () => import('@/views/ScanView.vue') },
      { path: 'records', name: 'records', component: () => import('@/views/RecordsView.vue') },
      { path: 'articles', name: 'articles', component: () => import('@/views/ArticlesView.vue') },
      {
        path: 'articles/:id',
        name: 'article-detail',
        component: () => import('@/views/ArticleDetailView.vue'),
      },
      { path: 'assistant', name: 'assistant', component: () => import('@/views/AssistantView.vue') },
      { path: 'profile', name: 'profile', component: () => import('@/views/ProfileView.vue') },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/home' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const userStore = useUserStore()
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return { name: 'login' }
  }
  if (to.name === 'login' && userStore.isLoggedIn) {
    return { name: 'home' }
  }
  return true
})

export default router
