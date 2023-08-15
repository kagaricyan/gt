import {createRouter, createWebHashHistory} from 'vue-router';

export const router = createRouter({
  history: createWebHashHistory('/gt/'),
  routes: [
    {
      path: '/cn',
      component: () => import('../pages/home/Home.vue'),
    },
    {
      path: '/na2',
      component: () => import('../pages/NA2/NA2.vue'),
    },
  ],
});