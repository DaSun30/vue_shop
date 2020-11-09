<template>
  <div>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    logout() {
      // 清空sessionStorage中的token数据
      window.sessionStorage.clear()
      // 强制跳转到login页面
      this.$router.push('/login')
      // 弹出退出成功消息框
      this.$message('退出成功！')
    },
  },
}
</script>

<style lang="less" scoped>
</style>