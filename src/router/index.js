import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'

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
      { path:'/params', component: Params }
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
