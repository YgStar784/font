import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login/index.vue'
import Layout from '../views/Layout/index.vue'
import Users from '../views/main/user/userList.vue'
import UserInfo from '../views/main/user/userInfo.vue'
import TaskInfo from '../views/main/user/taskInfo.vue'
import FederatedLearning from '../views/main/tasks/fl/index.vue'
import PrivateSetIntersection from '../views/main/tasks/psi/index.vue'
import StealthQuery from '../views/main/tasks/pir/index.vue'
import Arithmetic from '../views/main/tasks/mpc/index.vue'
import PlayerInfo from '../views/main/tasks/mpc/components/playerInfo.vue'
import CreateTaskFl from '@/views/main/tasks/fl/createTask.vue'
import FLPredict from '@/views/main/tasks/flPredict/index.vue'
import MPCindex from '@/views/main/tasks/indexMPC.vue'
import FLindex from '@/views/main/tasks/indexFL.vue'
import FLCreate from '@/views/main/tasks/fl/createTask.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: {
        requireAuth: false,
        breadcrumbName: '登录'
      }
    },
    {
      path: '/',
      name: 'main',
      component: Layout,
      redirect: '/userinfo',
      meta: { isAuth: true, breadcrumbName: '首页' },
      children: [
        {
          path: 'userinfo',
          name: 'userinfo',
          component: UserInfo,
          meta: { breadcrumbName: '用户信息' }
        },
        {
          path: 'taskinfo',
          name: 'taskinfo',
          component: TaskInfo,
          meta: { breadcrumbName: '任务信息' }
        },
        {
          path: 'users',
          name: 'users',
          component: Users,
          meta: { breadcrumbName: '用户列表' }
        },
        {
          path: 'mpc',
          name: 'mpc',
          redirect: 'arithmetic',
          component: MPCindex,
          meta: { breadcrumbName: '安全多方计算' },
          children: [
            {
              path: 'stealthquery',
              name: 'stealthquery',
              component: StealthQuery,
              meta: { breadcrumbName: '匿踪查询' }
            },
            {
              path: 'arithmetic',
              name: 'arithmetic',
              component: Arithmetic,
              meta: { breadcrumbName: '四则运算' }
            },
            {
              path: 'privateSetIntersection',
              name: 'privateSetIntersection',
              component: PrivateSetIntersection,
              meta: { breadcrumbName: '隐私求交' }
            }
          ]
        },
        {
          path: 'fl',
          name: 'fl',
          redirect: '/fl/federatedLearning',
          component: FLindex,
          meta: { breadcrumbName: '联邦学习' },
          children: [
            {
              path: 'federatedLearning',
              name: 'federatedLearning',
              component: FederatedLearning,
              meta: {
                breadcrumbName: '联邦建模',
              },

              children: [{
                path: 'flCreate',
                name: 'flCreate',
                component: FLCreate,
                meta: { breadcrumbName: '联邦建模-创建' },

              }]
            },
            {
              path: 'flPredict',
              name: 'flPredict',
              component: FLPredict,
              meta: { breadcrumbName: '联邦预测' }
            }
          ]
        }
      ]
    },

  ]
})

export default router