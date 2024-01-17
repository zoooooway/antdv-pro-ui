<template>
  <a-card :bordered="false">
    <a-button slot="extra" type="primary" @click="showAddRoleModal(null)"> 新增角色 </a-button>

    <a-table :columns="columns" :data-source="data" rowKey="roleKey">
      <div slot="expandedRowRender" slot-scope="record" style="margin: 0">
        <a-row :gutter="24" :style="{ marginBottom: '12px' }">
          <a-col :span="12" v-for="(permi, index) in record.permissions" :key="index" :style="{ marginBottom: '12px' }">
            <a-col :span="4">
              <span>{{ permi.permissionName }}：</span>
            </a-col>
            <a-col :span="20" v-if="permi.actionList.length > 0">
              <a-tag color="cyan" v-for="(action, k) in permi.actionList" :key="k">{{ action.describe }}</a-tag>
            </a-col>
            <a-col :span="20" v-else>-</a-col>
          </a-col>
        </a-row>
      </div>
      <span slot="action" slot-scope="record" v-if="record.roleKey !== 'SUPPER'">
        <a @click="showAddRoleModal(record)">修改</a>
        <a-divider type="vertical" />
        <a-popconfirm
          title="角色将被永久删除, 您确定要继续吗?"
          ok-text="仍然删除"
          okType="danger"
          cancel-text="取消"
          @confirm="onDelRole(record.id)"
        >
          <a style="color: red">删除</a>
        </a-popconfirm>
      </span>
    </a-table>

    <a-modal
      :title="modalInfo.title"
      style="top: 20px"
      :width="800"
      v-model="modalVis"
      destroyOnClose
      @ok="handleOK(modalInfo.id)"
    >
      <a-form class="permission-form" :form="form">
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="角色标识">
          <a-input
            placeholder="角色标识, 必须唯一"
            :disabled="modalInfo.roleKeyDisable"
            v-decorator="[
              'roleKey',
              {
                rules: [{ required: true, message: '请输入角色标识!' }]
              }
            ]"
          />
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="角色名称">
          <a-input
            placeholder="角色名称, 建议中文"
            v-decorator="[
              'roleName',
              {
                rules: [{ required: true, message: '请输入角色名称!' }]
              }
            ]"
          />
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="描述">
          <a-textarea :rows="5" placeholder="描述此角色的职责" id="description" v-decorator="['description']" />
        </a-form-item>

        <a-divider>拥有权限</a-divider>
        <template v-for="permission in permissions">
          <a-form-item
            class="permission-group"
            v-if="permission.actionsOptions && permission.actionsOptions.length > 0"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            :key="permission.permissionId"
            :label="permission.permissionName"
          >
            <a-checkbox
              :indeterminate="permission.indeterminate"
              :checked="permission.checkAll"
              @change="onCheckAllChange($event, permission)"
            >全选</a-checkbox
            >
            <a-checkbox-group
              :options="permission.actionsOptions"
              v-decorator="[`permissions.${permission.permissionId}`]"
              @change="onChange($event, permission)"
            />
          </a-form-item>
        </template>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script>
import pick from 'lodash.pick'
import { getRoleList, addRole, editRole, delRole } from '@/api/role'
import { getAuthorityPermissions } from '@/api/permission'
import { PERMISSION_ENUM } from '@/core/permission/permission'

const columns = [
  {
    title: '角色标识',
    dataIndex: 'roleKey',
    key: 'roleKey'
  },
  {
    title: '角色名称',
    dataIndex: 'roleName',
    key: 'roleName'
  },
  {
    title: '角色用户数',
    dataIndex: 'userCount',
    key: 'userCount'
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description'
  },
  {
    title: '操作',
    key: 'action',
    scopedSlots: { customRender: 'action' }
  }
]

export default {
  name: 'RoleList',
  data () {
    return {
      data: [],

      modalVis: false,
      modalInfo: {
        title: '',
        roleKeyDisable: false
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
    this.loadData()
  },
  methods: {
    loadData (queryParam) {
      getRoleList(queryParam).then(
        (res) => {
          console.log('roles: ', res)
          this.data = res.data
        },
        (err) => {
          this.requestFailed(err)
        }
      )
    },
    async initAllPermissions () {
      await getAuthorityPermissions().then((res) => {
        console.log('init')
        this.permissions = res.data.map((permission) => {
          const actionsOptions = permission.actionList.map((action) => {
            return {
              label: action.describe,
              value: action.action
            }
          })
          return {
            ...permission,
            actionsOptions
          }
        })
      })
    },
    async showAddRoleModal (record) {
      this.modalInfo = {}
      await this.initAllPermissions()
      console.log(record)
      this.modalVis = true

      if (record) {
        this.modalInfo.id = record.id
        this.modalInfo.title = '修改角色'
        this.modalInfo.roleKeyDisable = true

        // 如果是修改, 那么应该回显角色信息和拥有的权限
        const checkboxGroup = {}
        record.permissions.map((p) => {
          const groupKey = `permissions.${p.permissionId}`
          const ownedActions = p.actionList.map((p) => p.action)
          checkboxGroup[groupKey] = ownedActions
        })

        this.permissions.forEach((p) => {
          const checkedList = checkboxGroup[`permissions.${p.permissionId}`]
          p.indeterminate = !!(checkedList && checkedList.length && checkedList.length < p.actionsOptions.length)
          p.checkAll = checkedList ? checkedList.length === p.actionsOptions.length : false
        })

        this.$nextTick(() => {
          this.form.setFieldsValue(pick(record, ['roleKey', 'roleName', 'description']))
          this.form.setFieldsValue(checkboxGroup)
        })
      } else {
        this.modalInfo.title = '新增角色'
        this.modalInfo.roleKeyDisable = false
      }
    },

    handleOK (id) {
      this.form.validateFieldsAndScroll((err, formValue) => {
        if (!err) {
          console.log('Received values of form: ', formValue)

          const data = { ...formValue }
          // do submit
          // 处理成后端的参数体
          const permissions = []
          for (const key in formValue.permissions) {
            if (Object.hasOwnProperty.call(formValue.permissions, key)) {
              if (formValue.permissions[key] && formValue.permissions[key].length > 0) {
                const perm = {
                  permissionId: key,
                  actionList: formValue.permissions[key].map((p) => {
                     const { key: action, label: describe } = PERMISSION_ENUM[p]
                     return { action, describe }
                  })
                }
                permissions.push(perm)
              }
            }
          }
          data.permissions = permissions

          console.log('data: ', data)
          let p
          let type
          if (id) {
            type = '修改'
            p = editRole(id, data)
          } else {
            type = '新增'
            p = addRole(data)
          }
          p.then(
            (res) => {
              const { meta } = res
              if (meta.code === 200) {
                this.loadData()
                this.$message.success(`${type}角色成功!`)
                this.modalInfo = {}
                this.modalVis = false
              } else {
                this.$message.error(meta.message || `${type}角色失败`)
              }
            },
            (err) => {
              this.requestFailed(err)
            }
          )
        }
      })
    },
    onDelRole (roleId) {
      delRole(roleId).then(
        (res) => {
          const { meta } = res
          if (meta.code === 200) {
            this.loadData()
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

    onChange (checkedList, permission) {
      permission.indeterminate = checkedList.length && checkedList.length < permission.actionsOptions.length
      permission.checkAll = checkedList.length === permission.actionsOptions.length
    },
    onCheckAllChange (e, permission) {
      permission.indeterminate = false
      permission.checkAll = e.target.checked
      this.$nextTick(() => {
        console.log('permissions', permission)

        const value = e.target.checked ? permission.actionsOptions.map((o) => o.value) : []
        this.form.setFieldsValue({ [`permissions.${permission.permissionId}`]: value })
      })
    },
    requestFailed (err) {
      this.$notification['error']({
        message: '错误',
        description: (((err.response || {}).data || {}).meta || {}).message || '请求出现错误，请稍后再试',
        duration: 4
      })
    }
  }
}
</script>
