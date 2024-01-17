import request from '@/utils/request'
import { METHOD } from './api-constants'

const api = {
  role: '/role',
  selections: '/role/selections'
}

export function getRoleList (parameter) {
  return request({
    url: api.role,
    method: METHOD.GET,
    params: parameter
  })
}

export function getRoleSelections (parameter) {
  return request({
    url: api.selections,
    method: METHOD.GET,
    params: parameter
  })
}

export function addRole (data) {
  return request({
    url: api.role,
    method: METHOD.POST,
    data: data
  })
}

export function editRole (roleId, data) {
  return request({
    url: `${api.role}/${roleId}`,
    method: METHOD.PUT,
    data: data
  })
}

export function delRole (roleId) {
  return request({
    url: `${api.role}/${roleId}`,
    method: METHOD.DELETE
  })
}
