// eslint-disable-next-line
import { UserLayout, BasicLayout, BlankLayout, PageView } from '@/layouts'
import { bxAnaalyse } from '@/core/icons'

const RouteView = {
  name: 'RouteView',
  render: h => h('router-view')
}

export const asyncRouterMap = [
  {
    path: '/',
    name: 'root',
    component: BasicLayout,
    meta: { title: 'menu.home' },
    redirect: '/system',
    children: [
      // system
      {
        path: '/system',
        name: 'system',
        redirect: '/system/user',
        component: RouteView,
        meta: { title: 'system.user', keepAlive: true, icon: bxAnaalyse, permission: ['system'] },
        children: [
          {
            path: '/system/user',
            name: 'user',
            redirect: '/system/user/list',
            meta: { title: 'system.user', keepAlive: false, permission: ['user'] },
            children: [
              {
                path: '/system/user/list',
                name: 'userList',
                meta: { title: 'system.user.userList', keepAlive: false, permission: ['user'] }
              }
            ]
          },
          // 外部链接
          // {
          //   path: 'https://www.baidu.com/',
          //   name: 'Monitor',
          //   meta: { title: 'menu.dashboard.monitor', target: '_blank' }
          // },
          {
            path: '/system/role',
            name: 'role',
            redirect: '/system/role/list',
            meta: { title: 'system.role', keepAlive: true, permission: ['role'] },
            children: [
              {
                path: '/system/role/list',
                name: 'roleList',
                component: () => import('@/views/system/role/RoleList'),
                meta: { title: 'system.role.roleList', keepAlive: false, permission: ['role'] }
              }
            ]
          },
          {
            path: '/system/permission',
            name: 'permission',
            redirect: '/system/permission/list',
            meta: { title: 'system.permission', keepAlive: true, permission: ['permission'] },
            children: [
              {
                path: '/system/permission/list',
                name: 'permissionList',
                component: () => import('@/views/system/permission/PermissionList'),
                meta: { title: 'system.permission.permissionList', keepAlive: false, permission: ['permission'] }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    redirect: '/404',
    hidden: true
  }
]

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login')
      },
      {
        path: 'recover',
        name: 'recover',
        component: undefined
      }
    ]
  },

  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  }
]
