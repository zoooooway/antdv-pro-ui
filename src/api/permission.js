import request from '@/utils/request'
import { METHOD } from './api-constants'

const api = {
  permission: '/permission',
  authorityPermissions: '/permission/authority',
  permissionTree: '/permission/tree'
}

/**
 * 获取可配置权限的菜单
 */
export function getAuthorityPermissions () {
  return request({
    url: api.authorityPermissions,
    method: METHOD.GET
  })
}

export function getPermissionTree () {
  return request({
    url: api.permissionTree,
    method: METHOD.GET
  })
}

export function addPermission (data) {
  return request({
    url: api.permission,
    method: METHOD.POST,
    data: data
  })
}

export function editPermission (permissionId, data) {
  return request({
    url: `${api.permission}/${permissionId}`,
    method: METHOD.PUT,
    data: data
  })
}

export function delPermission (permissionId) {
  return request({
    url: `${api.permission}/${permissionId}`,
    method: METHOD.DELETE
  })
}
