import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login/index.vue'
import Layout from '../views/Layout/index.vue'
import Users from '../views/main/userMan/userList.vue'
import UserInfo from '../views/main/userMan/userInfo.vue'
import Tasks from '../views/main/tasks/index.vue'
import DataSourceUpload from '../views/main/dataSource/dataSourceUpload.vue'
import DataSourceInfoLB from '../views/main/dataSource/dataSourceInfoLB.vue'
import DataSourceInfoNZ from '../views/main/dataSource/dataSourceInfoNZ.vue'
import DataSourceInfoAQ from '../views/main/dataSource/dataSourceInfoAQ.vue'
import DataSourceInfoYS from '../views/main/dataSource/dataSourceInfoYS.vue'
import TaskInfo from '../views/main/userMan/taskInfo.vue'
import FileUpload from '../views/main/tasks/fileUpload.vue'
import StealthQueryAdd from '../views/main/tasks/stealth/stealthAdd.vue'
import FederatedLearning from '../views/main/tasks/federatedLearning/index.vue'
import SecureMultipartyComputation from '../views/main/tasks/secureMultipartyComputation/index_befor.vue'
import PrivateSetIntersection from '../views/main/tasks/privateSetIntersection/index.vue'
import StealthQuery from '../views/main/tasks/stealth/pirIndex.vue'

import MPC from '../views/main/tasks/secureMultipartyComputation/index.vue'
import PlayerInfo from '../views/main/tasks/secureMultipartyComputation/components/playerInfo.vue'
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
          path: '/datasource',
          name: 'datasource',
          redirect: '/datasourceupload',
          children: [
            {
              path: '/datasourceupload',
              name: 'datasourceupload',
              component: DataSourceUpload,
            },
            {
              path: '/datasourceinfoLB',
              name: 'datasourceinfoLB',
              component: DataSourceInfoLB,
            },
            {
              path: '/datasourceinfoNZ',
              name: 'datasourceinfoNZ',
              component: DataSourceInfoNZ,
            },
            {
              path: '/datasourceinfoAQ',
              name: 'datasourceinfoAQ',
              component: DataSourceInfoAQ,
            },
            {
              path: '/datasourceinfoYS',
              name: 'datasourceinfoYS',
              component: DataSourceInfoYS,
            },
          ]
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
              path: 'stealthqueryAdd',
              name: 'stealthqueryAdd',
              component: StealthQueryAdd,
            },
            {
              path: '/federatedLearning',
              name: 'federatedLearning',
              component: FederatedLearning,
            },
            {
              path: '/secureMultipartyComputation',
              name: 'secureMultipartyComputation',
              component: SecureMultipartyComputation,
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
