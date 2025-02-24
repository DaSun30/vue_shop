import Vue from 'vue'
import VueRouter from 'vue-router'

// 路由懒加载分组1
// import Login from '../components/Login.vue'
const Login = () => import(/* webpackChunkName: 'login_home_welcome' */ '../components/Login.vue')
// import Home from '../components/Home.vue'
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home.vue')
// import Welcome from '../components/Welcome.vue'
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome.vue')

// 路由懒加载分组2
// import Users from '../components/user/Users.vue'
const Users = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/user/Users.vue')
// import Rights from '../components/power/Rights.vue'
const Rights = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Rights.vue')
// import Roles from '../components/power/Roles.vue'
const Roles = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Roles.vue')

// 路由懒加载分组3
// import Cate from '../components/goods/Cate.vue'
const Cate = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/Cate.vue')
// import Params from '../components/goods/Params.vue'
const Params = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/Params.vue')

// 路由懒加载分组4
// import GoodsList from '../components/goods/List.vue'
const GoodsList = () => import(/* webpackChunkName: "GoodsList_AddGoods" */ '../components/goods/List.vue')
// import AddGoods from '../components/goods/Add.vue'
const AddGoods = () => import(/* webpackChunkName: "GoodsList_AddGoods" */ '../components/goods/Add.vue')

// 路由懒加载分组5
// import Order from '../components/order/Order.vue'
const Order = () => import(/* webpackChunkName: "Cate_Params" */ '../components/order/Order.vue')
// import Report from '../components/report/Report.vue'
const Report = () => import(/* webpackChunkName: "Cate_Params" */ '../components/report/Report.vue')

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home', 
    component: Home,
    redirect: '/welcome', 
    children:[
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path:'/rights', component: Rights },
      { path:'/roles', component: Roles },
      { path:'/categories', component: Cate },
      { path:'/params', component: Params },
      { path:'/goods', component: GoodsList }, 
      { path:'/goods/add', component: AddGoods },
      { path:'/orders', component: Order },
      { path:'/reports', component: Report },
  ] }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to: 将要访问的路径
  // from: 从哪个路径跳转而来
  // next: 函数，表示放行
  //        next() 直接放行，   next('/login') 强制跳转到登录页面
  if(to.path === '/login')  next();
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token');
  // tokenStr字符串为空，sessionStorage里无token，说明未登录，这时无论你从哪个页面来，
  // 或者想跳转到除登录页面外的其他页面，导航守卫均强制页面跳转到登录页面
  if(!tokenStr)  next('/login');
  next();
})

export default router
