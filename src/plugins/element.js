import Vue from 'vue'
import { Button, 
Form, 
FormItem, 
Input,  
Message, 
Container, 
Header, 
Aside, 
Main, 
Menu, 
Submenu, 
MenuItem,
Breadcrumb,
BreadcrumbItem,
Card,
Row,
Col,
Table,
TableColumn,
Switch,
Tooltip,
Pagination,
Dialog,
MessageBox,
Tag,
Tree,
Select,
Option,
Cascader,
Alert,
Tabs,
TabPane,
Steps,
Step,
Checkbox,
CheckboxGroup,
Upload,
Timeline,
TimelineItem } from 'element-ui'// {} 按需导入

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItem)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Row)
Vue.use(Col)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)
Vue.use(Tag)
Vue.use(Tree)
Vue.use(Select)
Vue.use(Option)
Vue.use(Cascader)
Vue.use(Alert)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Steps)
Vue.use(Step)
Vue.use(Checkbox)
Vue.use(CheckboxGroup)
Vue.use(Upload)
Vue.use(Timeline)
Vue.use(TimelineItem)

// Message组件需要全局挂载，这样其他组件通过this.$message自定义属性可以使用Message组件了
Vue.prototype.$message = Message
// MessageBox组件需要全局挂载（到Vue实例的prototype中去）,这样其他组件通过this.$confirm自定义属性可以使用MessageBox组件了
Vue.prototype.$confirm = MessageBox.confirm
