import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import MstView from '../views/MstView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/mst',
      name: 'mst',
      component: MstView,
    },
    {
      path: '/payment',
      redirect: (to) => ({
        path: '/mst',
        query: {
          payment:
            to.query.order ||
            to.query.order_number ||
            to.query.payment ||
            'true',
        },
      }),
    },
    {
      path: '/payment/kaspi/:order_number',
      name: 'kaspi-processing',
      component: () =>
        import('../../features/payment/ui/KaspiProcessingView.vue'),
    },
    {
      path: '/policies/mst/buy/success',
      name: 'payment-success',
      component: () =>
        import('../../features/payment/ui/PaymentSuccessView.vue'),
    },
    {
      path: '/policies/mst/buy/failure',
      name: 'payment-failure',
      component: () =>
        import('../../features/payment/ui/PaymentFailureView.vue'),
    },
  ],
})

export default router
