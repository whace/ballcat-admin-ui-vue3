// notFound 路由，使用函数获取，方便使用不同的路由名称，支持登录后 content 中显示异常信息
import type { RouteRecordRaw } from 'vue-router'
import { LOGIN_PATH } from '@/constants'

export const ExceptionComponentImport = () => import('@/views/basic/exception/index.vue')

export const buildNotFoundRoute = (routeName: string): RouteRecordRaw => ({
  path: '/:pathMatch(.*)*',
  name: routeName,
  component: ExceptionComponentImport,
  meta: {
    name: '404',
    hideInMenu: true,
    hideInTab: true
  },
  props: {
    exceptionStatus: '404'
  }
})

const constantRoutes: RouteRecordRaw[] = [
  {
    path: LOGIN_PATH,
    name: 'Login',
    // route level code-splitting
    // this generates a separate chunk (About.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('@/views/login/index.vue'),
    meta: {
      allowAnonymous: true
    }
  },
  // 404 路由
  buildNotFoundRoute('GlobalNotFound')
]

export default constantRoutes
