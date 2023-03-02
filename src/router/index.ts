import { createRouter, createWebHistory } from 'vue-router';

export const router = createRouter({
  history: createWebHistory('/gt/'),
  routes: [
    {
      path: '/',
      component: () => import('../pages/home/Home.vue'),
    },
  ],
});