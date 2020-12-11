<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏(对width通过isCollapse动态数据确定宽度赋值，三元表达式) -->
      <el-aside :width="isCollapse ? '64px' : '200px'"> 
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区域 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409Eff"
          :unique-opened="false"
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath">
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + child.path" v-for="child in item.children" :key="child.id" @click="saveNavState('/' + child.path)">
              <!-- 二级菜单模板区域 -->
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{child.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <!-- 路由占位符，占位Welcome路由对应的Welcome组件 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>

</template>

<script>
export default {
  data() {
    return {
      //左侧菜单数据
      menulist:[],
      iconObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      // 是否折叠侧边栏
      isCollapse: false,
      //被激活的链接地址
      activePath: ''
    }
  },
  // 生命周期钩子
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem('activePath');
  },
  methods: {
    logout() {
      // 清空sessionStorage中的token数据
      window.sessionStorage.clear()
      // 强制跳转到login页面
      this.$router.push('/login')
      // 弹出退出成功消息框
      this.$message('退出成功！')
    },
    // 获取所有菜单（后台接口1.4.2）
    async getMenuList() {
      // const a = await this.$http.get('menus');
      // console.log(a);
      const {data: res} = await this.$http.get('menus');
      // 侧边栏菜单数据获取失败，打印错误信息
      if(res.meta.status !== 200)   return this.$message.error(res.meta.msg);
      // data是Array，可直接给menulist这个array赋值
      this.menulist = res.data;
      // console.log(res);
    },
    // 点击按钮，切换菜单折叠与展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
      // console.log(this);
    },
    // 保存链接激活状态
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath);
      this.activePath = activePath;
    }
  },
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}

.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;   //优化菜单右侧边框线
  }
}

.el-main {
  background-color: #eaedf1;
}

.iconfont {
  margin-right: 10px;
}

.toggle-button {
  background-color: #4A5064;
  color: white;
  font-size: 10px;
  line-height: 24px;
  text-align: center;
  letter-spacing: 0.2em;   // 美化竖线间距
  cursor: pointer;
}
</style>