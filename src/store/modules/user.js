import storage from 'store'
import expirePlugin from 'store/plugins/expire'
import { login, getInfo, logout } from '@/api/login'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { welcome } from '@/utils/util'

storage.addPlugin(expirePlugin)
const user = {
  state: {
    token: '',
    name: '',
    welcome: '',
    avatar: '',
    roles: [],
    info: {}
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, { name, welcome }) => {
      state.name = name
      state.welcome = welcome
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_INFO: (state, info) => {
      state.info = info
    }
  },

  actions: {
    // 登录
    Login ({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        login(userInfo)
          .then((response) => {
            const token = response.data
            storage.set(ACCESS_TOKEN, token, new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
            commit('SET_TOKEN', token)
            resolve()
          })
          .catch((error) => {
            reject(error)
          })
      })
    },

    // 获取用户信息
    GetInfo ({ commit }) {
      return new Promise((resolve, reject) => {
        // 请求后端获取用户信息 /api/user/info
        getInfo()
          .then((response) => {
            const { data: result } = response
            if (result.roles && result.roles.length > 0) {
              const roles = [...result.roles]

              for (let idx = 0; idx < roles.length; idx++) {
                const role = roles[idx]

                if (role && role.permissions.length > 0) {
                  // 无需在前端转换, 在后端返回时, 同时返回该路由的所有权限(actionEntitySet/actions)和该角色在该路由上的已分配权限(actionList)
                  // role.permissions = role.permissions.map(permission => {
                  //   const per = {
                  //     ...permission,
                  //     actionList: (permission.actionEntitySet || {}).map(item => item.action)
                  //   }
                  //   return per
                  // })
                  role.permissionList = role.permissions.map((permission) => {
                    return permission.permissionKey
                  })
                } else {
                  reject(new Error('getInfo: permissions must be a non-null array !'))
                }
              }

              // 覆盖响应体的 role, 供下游使用
              result.roles = roles

              commit('SET_ROLES', roles)
              commit('SET_INFO', result)
              commit('SET_NAME', { name: result.authUser.username, welcome: welcome() })
              commit('SET_AVATAR', result.avatar)
              // 下游
              resolve(result)
            } else {
              reject(new Error('getInfo: roles must be a non-null array !'))
            }
          })
          .catch((error) => {
            reject(error)
          })
      })
    },

    // 登出
    Logout ({ commit, state }) {
      return new Promise((resolve) => {
        if (state.token) {
          logout()
            .catch((err) => {
              console.log('logout fail:', err)
              // resolve()
            })
            .finally(() => {
              commit('SET_TOKEN', '')
              commit('SET_ROLES', [])
              storage.remove(ACCESS_TOKEN)
              setTimeout(() => {
                window.location.reload()
              }, 500)
            })
        } else {
          setTimeout(() => {
            window.location.reload()
          }, 500)
        }
      })
    }
  }
}

export default user
