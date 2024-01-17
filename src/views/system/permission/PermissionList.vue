<template>
  <a-card :bordered="false">
    <a-button slot="extra" type="primary" @click="showAddPermissionModal(null)"> 新增菜单 </a-button>

    <a-table :columns="columns" :data-source="data" rowKey="key" :pagination="false">
      <span slot="actions" slot-scope="actionEntitySet">
        <a-tag color="cyan" v-for="(action, k) in actionEntitySet" :key="k">{{ action.describe }}</a-tag>
      </span>
      <span slot="show" slot-scope="show">
        {{ show ? '是' : '否' }}
      </span>
      <span slot="hideChildren" slot-scope="hideChildren">
        {{ hideChildren ? '是' : '否' }}
      </span>
      <span slot="operate" slot-scope="record">
        <a @click="showAddPermissionModal(record)">修改</a>
        <a-divider type="vertical" />
        <a-popconfirm
          title="该菜单及其子菜单都将被永久删除, 您确定要继续吗?"
          ok-text="仍然删除"
          okType="danger"
          cancel-text="取消"
          @confirm="onDelPermission(record.id)"
        >
          <a style="color: red">删除</a>
        </a-popconfirm>
      </span>
    </a-table>

    <a-modal :title="modalInfo.title" style="top: 20px" :width="800" v-model="modalVis" @ok="handleOK(modalInfo.id)">
      <a-form class="permission-form" :form="form">
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="父菜单">
          <a-tree-select
            style="width: 100%"
            :tree-data="data"
            :replaceFields="treeFields"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            placeholder="请选择父菜单"
            allow-clear
            v-decorator="[
              'parentId',
              {
                rules: [{ required: isAdd, message: '请选择父菜单!' }]
              }
            ]"
          >
          </a-tree-select>
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
          <span slot="label">
            <a-popover>
              <template slot="content">
                <p>目录: 表明其下有多个模块, 比如系统管理下包含用户管理和角色管理.</p>
                <p>
                  模块: 位于目录下, 定义具体功能划分, 用于控制权限, 比如用户管理, 其父菜单为系统管理.
                  模块应该设置重定向到一具体页面.
                </p>
                <p>
                  页面: 具体展示的页面, 一个模块可以有多个页面, 比如用户列表和用户详情,
                  这两者的权限都交由其父菜单用户管理模块控制.
                </p>
              </template>
              菜单类型&nbsp;
              <a-icon type="question-circle-o" />
            </a-popover>
          </span>
          <a-select
            placeholder="菜单类型"
            v-decorator="[
              'type',
              {
                rules: [{ required: isAdd, message: '请选择菜单类型!' }],
                initialValue: 0
              }
            ]"
          >
            <a-select-option :value="0">目录</a-select-option>
            <a-select-option :value="1">模块</a-select-option>
            <a-select-option :value="2">页面</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="菜单标识">
          <a-input
            placeholder="菜单标识, 唯一"
            v-decorator="[
              'key',
              {
                rules: [{ required: isAdd, message: '请输入菜单标识!' }]
              }
            ]"
          />
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="菜单名称">
          <a-input
            placeholder="菜单名称"
            v-decorator="[
              'title',
              {
                rules: [{ required: isAdd, message: '请输入菜单名称!' }]
              }
            ]"
          />
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="菜单路径">
          <a-input placeholder="菜单路径, 不填默认为父路径/菜单标识拼接" v-decorator="['path']" />
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="菜单组件">
          <a-input
            placeholder="菜单组件"
            v-decorator="[
              'component',
              {
                rules: [{ required: isAdd, message: '请输入菜单组件!' }]
              }
            ]"
          />
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="重定向">
          <a-input placeholder="重定向路径, 可以为空" v-decorator="['redirect']" />
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="是否显示">
          <a-select
            placeholder="是否显示"
            v-decorator="[
              'show',
              {
                rules: [{ required: isAdd, message: '请选择是否显示!' }],
                initialValue: 1
              }
            ]"
          >
            <a-select-option :value="1">是</a-select-option>
            <a-select-option :value="0">否</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
          <span slot="label">
            <a-tooltip>
              <template slot="title">
                菜单类型为模块时设置为'是'以隐藏页面不在左侧菜单栏显示.
              </template>
              是否隐藏子菜单&nbsp; <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-select
            placeholder="是否隐藏子菜单"
            v-decorator="[
              'hideChildren',
              {
                rules: [{ required: isAdd, message: '请选择是否隐藏子菜单!' }],
                initialValue: 0
              }
            ]"
          >
            <a-select-option :value="1">是</a-select-option>
            <a-select-option :value="0">否</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script>
import pick from 'lodash.pick'
import { getPermissionTree, addPermission, editPermission, delPermission } from '@/api/permission'
import { PERMISSION_ENUM } from '@/core/permission/permission'

const columns = [
  {
    title: '名称',
    dataIndex: 'title',
    key: 'title'
  },
  {
    title: '唯一标识',
    dataIndex: 'key',
    key: 'key'
  },
  {
    title: '路径',
    dataIndex: 'path',
    key: 'path',
    customRender: (text) => {
      return text || '-'
    }
  },
  {
    title: '组件名称',
    dataIndex: 'component',
    key: 'component',
    customRender: (text) => {
      return text || '-'
    }
  },
  {
    title: '重定向路径',
    dataIndex: 'redirect',
    key: 'redirect',
    customRender: (text) => {
      return text || '-'
    }
  },
  {
    title: '是否显示',
    dataIndex: 'show',
    key: 'show',
    scopedSlots: { customRender: 'show' }
  },
  {
    title: '是否隐藏子菜单',
    dataIndex: 'hideChildren',
    key: 'hideChildren',
    scopedSlots: { customRender: 'hideChildren' }
  },
  {
    title: '操作',
    key: 'operate',
    scopedSlots: { customRender: 'operate' }
  }
]

export default {
  name: 'PermissionList',
  data () {
    return {
      data: [],
      actions: [],

      treeFields: { children: 'children', title: 'title', key: 'key', value: 'id' },

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
    this.actions = Object.values(PERMISSION_ENUM).map((p) => {
      return { label: p.label, value: p.key }
    })
  },
  methods: {
    loadData () {
      getPermissionTree().then(
        (res) => {
          console.log('permission tree: ', res)
          this.data = res.data
        },
        (err) => {
          this.requestFailed(err)
        }
      )
    },

    async showAddPermissionModal (record) {
      console.log(record)
      this.modalVis = true

      if (record) {
        this.modalInfo.id = record.id
        this.modalInfo.title = '修改菜单'
        this.isAdd = false

        const cpRecord = pick(record, ['key', 'title', 'path', 'component', 'redirect', 'type', 'parentId'])
        cpRecord.show = record.show ? 1 : 0
        cpRecord.hideChildren = record.hideChildren ? 1 : 0
        // 如果是修改, 那么应该回显菜单信息
        this.$nextTick(() => {
          this.form.setFieldsValue(cpRecord)
        })
      } else {
        this.modalInfo.title = '新增菜单'
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
            p = editPermission(id, data)
          } else {
            type = '新增'
            p = addPermission(data)
          }
          p.then(
            (res) => {
              const { meta } = res
              if (meta.code === 200) {
                this.$message.success(`${type}菜单成功!`)
                setTimeout(() => {
                  window.location.reload()
                }, 500)
              } else {
                this.$message.error(meta.message || `${type}菜单失败`)
              }
            },
            (err) => {
              this.requestFailed(err)
            }
          )
        }
      })
    },
    onDelPermission (userId) {
      delPermission(userId).then(
        (res) => {
          const { meta } = res
          if (meta.code === 200) {
            this.$message.success('删除菜单成功!')
            setTimeout(() => {
              window.location.reload()
            }, 500)
          } else {
            this.$message.error(meta.message || '删除菜单失败')
          }
        },
        (err) => {
          this.requestFailed(err)
        }
      )
    },

    refreshData () {
      this.loadData()
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
