import Vue from 'vue'
import { Button, Form, FormItem, Input } from 'element-ui'// {} 按需导入
// 导入弹框提示组件
import { Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
// Message组件需要全局挂载，这样其他组件通过this.$message自定义属性可以使用Message组件了
Vue.prototype.$message = Message
