<template>
  <a-card :bordered="false">
    <a-row type="flex" justify="space-around">
      <a-col :span="20">
        <div class="table-page-search-wrapper">
          <a-form layout="inline" :form="searchForm">
            <a-row :gutter="48">
              <a-col :md="8" :sm="24">
                <a-form-item label="用户名">
                  <a-input v-decorator="['username']" placeholder="用户名称, 支持模糊查询" />
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item label="角色">
                  <a-select placeholder="请选择" v-decorator="['roles']" mode="multiple">
                    <a-select-option v-for="role in roleSelections" :key="role.id" :value="role.id">
                      {{ role.roleName }}</a-select-option
                    >
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <span class="table-page-search-submitButtons">
                  <a-button type="primary" @click="searchUser">查询</a-button>
                  <a-button style="margin-left: 8px" @click="() => searchForm.resetFields()">重置</a-button>
                </span>
              </a-col>
            </a-row>
          </a-form>
        </div>
      </a-col>
      <a-col :span="2">
        <a-button type="primary" @click="showAddUserModal(null)"> 新增用户 </a-button>
      </a-col>
    </a-row>

    <a-table :columns="columns" :data-source="data" rowKey="id" :pagination="pagination">
      <span slot="action" slot-scope="record">
        <a @click="showAddUserModal(record)">修改</a>
        <a-divider type="vertical" />
        <a-popconfirm
          title="用户将被永久删除, 您确定要继续吗?"
          ok-text="仍然删除"
          okType="danger"
          cancel-text="取消"
          @confirm="onDelUser(record.id)"
        >
          <a style="color: red">删除</a>
        </a-popconfirm>
      </span>
    </a-table>

    <a-modal :title="modalInfo.title" style="top: 20px" :width="600" v-model="modalVis" @ok="handleOK(modalInfo.id)">
      <a-form class="permission-form" :form="form">
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="用户名">
          <a-input
            placeholder="用户名"
            v-decorator="[
              'username',
              {
                rules: [
                  { required: isAdd, message: '用户名!' },
                  { type: 'string', pattern: /^[\w]{4,20}$/, message: '用户名仅支持 4-20 位的英文字母和数字' }
                ]
              }
            ]"
          />
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="密码">
          <a-input
            placeholder="密码"
            v-decorator="[
              'password',
              {
                rules: [
                  { required: isAdd, message: '请输入密码!' },
                  { type: 'string', pattern: /^.{4,20}$/, message: '密码长度需要满足 8-20 位' }
                ]
              }
            ]"
          />
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="角色">
          <a-select
            id="roleId"
            placeholder="请选择"
            allowClear
            v-decorator="[
              'roleId',
              {
                rules: [{ type: `number`, required: isAdd, message: '请选择角色!' }]
              }
            ]"
          >
            <a-select-option v-for="role in roleSelections" :key="role.id" :value="role.id">
              {{ role.roleName }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script>
import pick from 'lodash.pick'
import moment from 'moment'
import { getRoleSelections } from '@/api/role'
import { getUserList, addUser, editUser, delUser } from '@/api/user'

const dateTimePattern = 'YYYY-MM-DD HH:mm:ss'

const columns = [
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username'
  },
  {
    title: '角色',
    dataIndex: 'roleName',
    key: 'roleName'
  },
  {
    title: '上次登录时间',
    dataIndex: 'lastLogin',
    key: 'lastLogin',
    customRender: (text) => {
      return text ? moment(text).format(dateTimePattern) : '-'
    }
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    customRender: (text) => {
      return moment(text).format(dateTimePattern)
    }
  },
  {
    title: '操作',
    key: 'action',
    scopedSlots: { customRender: 'action' }
  }
]

export default {
  name: 'UserList',
  data () {
    return {
      data: [],
      roleSelections: [],
      searchForm: this.$form.createForm(this),
      pagination: {
        onChange: this.onPageChange,
        defaultPageSize: 10,
        pageNum: 1,
        pageSize: 10,
        total: 0
      },

      modalVis: false,
      isAdd: true,
      modalInfo: {
        title: ''
      },
      form: this.$form.createForm(this),
      indeterminate: true,
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },

      permissions: [],

      columns
    }
  },
  created () {
    this.refreshData()
    this.initRoleSelections()
  },
  methods: {
    loadData (queryParam) {
      getUserList(queryParam).then(
        (res) => {
          console.log('users: ', res)
          this.data = res.data.content
          this.pagination.total = res.data.total
        },
        (err) => {
          this.requestFailed(err)
        }
      )
    },
    initRoleSelections () {
      getRoleSelections().then(
        (res) => {
          console.log('roleSelections: ', res)
          this.roleSelections = res.data
        },
        (err) => {
          this.requestFailed(err)
        }
      )
    },
    searchUser () {
      const { username, roles } = this.searchForm.getFieldsValue()
      const queryParam = {
        username,
        pageNum: this.pagination.pageNum,
        pageSize: this.pagination.pageSize
      }
      if (roles) {
        queryParam.roles = roles.join(',')
      }

      this.loadData(queryParam)
    },

    // 分页变化
    async onPageChange (curr, pageSize) {
      this.pagination.pageNum = curr
      this.pagination.pageSize = pageSize
      this.searchUser()
    },

    async showAddUserModal (record) {
      console.log(record)
      this.modalVis = true

      if (record) {
        this.modalInfo.id = record.id
        this.modalInfo.title = '修改角色'
        this.isAdd = false

        // 如果是修改, 那么应该回显用户信息
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(record, ['username', 'roleId']))
        })
      } else {
        this.modalInfo.title = '新增角色'
        this.isAdd = true
      }
    },

    handleOK (id) {
      this.form.validateFieldsAndScroll((err, formValue) => {
        if (!err) {
          console.log('Received values of form: ', formValue)

          const data = { ...formValue }
          // do submit
          console.log('data: ', data)
          let p
          let type
          if (id) {
            type = '修改'
            p = editUser(id, data)
          } else {
            type = '新增'
            p = addUser(data)
          }
          p.then(
            (res) => {
              const { meta } = res
              if (meta.code === 200) {
                this.refreshData()
                this.$message.success(`${type}用户成功!`)
                this.modalInfo = {}
                this.modalVis = false
                this.form.resetFields()
              } else {
                this.$message.error(meta.message || `${type}用户失败`)
              }
            },
            (err) => {
              this.requestFailed(err)
            }
          )
        }
      })
    },
    onDelUser (userId) {
      delUser(userId).then(
        (res) => {
          const { meta } = res
          if (meta.code === 200) {
            this.refreshData()
            this.$message.success('删除角色成功!')
          } else {
            this.$message.error(meta.message || '删除角色失败')
          }
        },
        (err) => {
          this.requestFailed(err)
        }
      )
    },

    refreshData () {
      const queryParam = {
        pageNum: this.pagination.pageNum,
        pageSize: this.pagination.pageSize
      }
      this.loadData(queryParam)
    },
    requestFailed (err) {
      this.$notification['error']({
        message: '错误',
        description: (((err.response || {}).data || {}).meta || {}).message || '请求出现错误，请稍后再试',
        duration: 4
      })
    },

    validateUsername (rule, value, callback) {
      const form = this.form
      if (value && this.confirmDirty) {
        form.validateFields(['confirm'], { force: true })
      }
      callback()
    }
  }
}
</script>
