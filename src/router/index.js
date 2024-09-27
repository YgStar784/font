import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login/index.vue'
import Layout from '../views/Layout/index.vue'
import Users from '../views/main/user/userList.vue'
import UserInfo from '../views/main/user/userInfo.vue'
import TaskInfo from '../views/main/user/taskInfo.vue'

import FederatedLearning from '../views/main/tasks/fl/index.vue'
import PrivateSetIntersection from '../views/main/tasks/psi/index.vue'
import StealthQuery from '../views/main/tasks/pir/index.vue'
import MPC from '../views/main/tasks/mpc/index.vue'
import PlayerInfo from '../views/main/tasks/mpc/components/playerInfo.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: {
        requireAuth: false // 不需要鉴权
      }
    },
    {
      path: '/',
      name: 'main',
      component: Layout,
      redirect: '/userinfo',
      meta: { isAuth: true },
      children: [
        {
          path: '/userinfo',
          name: 'userinfo',
          component: UserInfo,
        },
        {
          path: '/taskinfo',
          name: 'taskinfo',
          component: TaskInfo,
        },
        {
          path: '/users',
          name: 'users',
          component: Users,
        },

        {
          path: '/tasks',
          name: 'tasks',
          //component: Tasks ,
          redirect: '/stealthquery',
          children: [
            {
              path: '/stealthquery',
              name: 'stealthquery',
              component: StealthQuery,
            },

            {
              path: '/federatedLearning',
              name: 'federatedLearning',
              component: FederatedLearning,
            },

            {
              path: '/mpc',
              name: 'mpc',
              component: MPC,
            },
            {
              path: '/mpcplayerinfo',
              name: 'mpcplayerinfo',
              component: PlayerInfo,
            },
            {
              path: '/privateSetIntersection',
              name: 'privateSetIntersection',
              component: PrivateSetIntersection,
            },
          ]
        },
      ]
    },

  ]
})
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next();
  //获取token
  const tokenStr = localStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
