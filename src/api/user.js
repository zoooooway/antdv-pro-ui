import request from '@/utils/request'
import { METHOD } from './api-constants'

const api = {
  user: '/user'
}

export function getUserList (parameter) {
  return request({
    url: api.user,
    method: METHOD.GET,
    params: parameter
  })
}

export function addUser (data) {
  return request({
    url: api.user,
    method: METHOD.POST,
    data: data
  })
}

export function editUser (userId, data) {
  return request({
    url: `${api.user}/${userId}`,
    method: METHOD.PUT,
    data: data
  })
}

export function delUser (userId) {
  return request({
    url: `${api.user}/${userId}`,
    method: METHOD.DELETE
  })
}
