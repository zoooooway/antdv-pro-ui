import Vue from 'vue'
import store from '@/store'

/**
 * Action 权限指令
 * 指令用法：
 *  - 在需要控制 action 级别权限的组件上使用 v-action:permission:method , 如下：
 *    <i-button v-action:user:add >添加用户</a-button>
 *    <a-button v-action:user:delete>删除用户</a-button>
 *    <a v-action:user:edit @click="edit(record)">修改</a>
 *
 *  - 当前用户没有权限时，组件上使用了该指令则会被隐藏
 *  - 当后台权限跟 pro 提供的模式不同时，只需要针对这里的权限过滤进行修改即可
 *
 *  @see https://github.com/vueComponent/ant-design-vue-pro/pull/53
 */
const action = Vue.directive('action', {
  inserted: function (el, binding) {
    const actionName = binding.arg
    const [perm, op] = actionName.split(':')
    const roles = store.getters.roles
    for (const role of roles) {
      for (const p of role.permissions) {
        if (perm === p.permissionKey) {
          if (p.actionList && p.actionList.map(t => t.action).includes(op)) {
            return
          }
        }
      }
    }

    el.parentNode && el.parentNode.removeChild(el) || (el.style.display = 'none')
  }
})

export default action
