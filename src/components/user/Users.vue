<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>用户管理</el-breadcrumb-item>
          <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <el-row :gutter="20">
                <!-- 搜索与添加区域 -->
                <el-col :span="9">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>

            <!-- 用户列表区域 -->
            <el-table :data="userlist" border stripe>
                <el-table-column label="序号" type="index"></el-table-column>
                <el-table-column label="姓名" prop="username"></el-table-column>
                <el-table-column label="邮箱" prop="email"></el-table-column>
                <el-table-column label="电话" prop="mobile"></el-table-column>
                <el-table-column label="角色" prop="role_name"></el-table-column>
                <el-table-column label="状态">
                    <template slot-scope="scope">
                        <el-switch
                          v-model="scope.row.mg_state"
                          @change="userStateChanged(scope.row)">
                        </el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="添加用户" width="180px">
                    <template slot-scope="scope">
                        <!-- 修改按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
                        <!-- 删除按钮 -->
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
                        <!-- 分配角色按钮 -->
                        <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                            <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页区域 -->
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryInfo.pagenum"
              :page-sizes="[1, 2, 5, 10]"
              :page-size="queryInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
            </el-pagination>
        </el-card>
     
        <!-- 添加用户对话框 -->
        <el-dialog
          title="提示"
          :visible.sync="addDialogVisible"
          width="50%"
          @close="addDialogClose">
          <!-- 内容主体区域 -->
          <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="70px">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="addForm.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="addForm.password"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="addForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机" prop="mobile">
              <el-input v-model="addForm.mobile"></el-input>
            </el-form-item>
          </el-form>
          <!-- 底部区域 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addUser">确 定</el-button>
          </span>
        </el-dialog>

        <!-- 修改用户的对话框 -->
        <el-dialog
          title="修改用户"
          :visible.sync="editDialogVisible"
          width="50%"
          @close="editDialogClose">
          <!-- 内容主体区域 -->
          <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="70px">
            <el-form-item label="用户名">
              <el-input v-model="editForm.username" :disabled="true"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="editForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机" prop="mobile">
              <el-input v-model="editForm.mobile"></el-input>
            </el-form-item>
          </el-form>
          <!-- 底部区域 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editUserInfo()">确 定</el-button>
          </span>
        </el-dialog>

        <!-- 分配角色对话框 -->
        <el-dialog
          title="提示"
          :visible.sync="setRoleDialogVisible"
          width="50%"
          @close="setRoleDialogClose">
          <div>
            <p>当前用户:{{userInfo.username}}</p>
            <p>当前角色:{{userInfo.role_name}}</p>
            <p>分配新角色：
                <el-select v-model="selectedRoleId" placeholder="请选择">
                  <el-option
                    v-for="item in rolelist"
                    :key="item.id"
                    :label="item.roleName"
                    :value="item.id">
                  </el-option>
                </el-select>
            </p>
          </div>
          <span slot="footer" class="dialog-footer">
            <el-button @click="setRoleDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
          </span>
        </el-dialog>  
    </div>
</template>

<script>
export default {
    data() {
        // 验证邮箱的规则
        var checkEmail = (rule, value, cb) => {
            // 验证邮箱的正则表达式
            const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

            // 邮箱合法
            if (regEmail.test(value)) {
                return cb();
            }

            cb(new Error('请输入合法的邮箱'))
        }

        // 验证手机号的规则
        var checkMobile = (rule, value, cb) => {
            // 验证手机号的正则表达式
            const regMobile = /^1[3|4|5|7|8][0-9]{9}$/

            // 邮箱合法
            if (regMobile.test(value)) {
                return cb();
            }

            cb(new Error('请输入合法的手机号'))
        }

        return {
            // 获取用户列表参数对象
            queryInfo: {
                query: '',
                // 当前页
                pagenum: 1,
                // 当前每页显示多少条数据
                pagesize: 2
            },
            userlist:[],
            total: 0,
            // 控制添加用户对话框的显示与隐藏
            addDialogVisible: false,
            // 添加用户的表单数据
            addForm: {
                username: '',
                password: '',
                email: '',
                mobile: ''
            },
            // 添加表单验证规则对象
            addFormRules: {
                username: [
                    { required: true, message: '请输入用户名',
                      trigger: 'blur' }, 
                    { min: 3, max: 10, message: '用户名长度在3~10个字符之间',
                      trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码',
                      trigger: 'blur' },
                    { min: 6, max: 15, message: '密码长度在6~15个字符之间',
                      trigger: 'blur' }
                ],
                email: [
                    { required: true, message: '请输入邮箱',
                      trigger: 'blur' },
                    { validator: checkEmail , trigger: 'blur' }
                ],
                mobile: [
                    { required: true, message: '请输入手机号',
                      trigger: 'blur' },
                    { validator: checkMobile, trigger: 'blur' }
                ],
            },
            // 控制修改用户对话框的显示与隐藏
            editDialogVisible: false,
            // 查询到的用户信息对象
            editForm: {},
            // 修改表单验证规则对象
            editFormRules: {
                email: [
                    { required: true, message: '请输入邮箱',
                      trigger: 'blur' },
                    { validator: checkEmail , trigger: 'blur' }
                ],
                mobile: [
                    { required: true, message: '请输入手机号',
                      trigger: 'blur' },
                    { validator: checkMobile, trigger: 'blur' }
                ]
            },
            // 控制分配角色对话框显示与隐藏
            setRoleDialogVisible: false,
            // 需要被分配角色的用户信息
            userInfo: {},
            // 所有角色的数据列表
            rolelist: [],
            // 已选中的角色id值
            selectedRoleId: ''
        }
    },
    created() {
        this.getUserList();
    },
    methods: {
        async getUserList(){
            const {data: res} = await this.$http.get('users', {params: this.queryInfo});
            // console.log(res);
            if(res.meta.status !== 200)  return this.$message.error('获取用户列表失败！');
            this.userlist = res.data.users;
            this.total = res.data.total;
            // console.log(this.total);
        },
        // 监听 pagesize 改变事件
        handleSizeChange(newSize) {
            // console.log(newSize);
            this.queryInfo.pagesize = newSize;
            // 根据新的pagesize发送请求获取新数据
            this.getUserList();
        },
        // 监听 当前页码 改变事件
        handleCurrentChange(newPageNum) {
            // console.log(newPageNum);
            this.queryInfo.pagenum = newPageNum;
            this.getUserList();
        },
        // 监听switch开关状态改变
        async userStateChanged(userinfo){
            // console.log(userinfo);
            const {data: res} = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
            if(res.meta.status !== 200){
                userinfo.mg_state = !userinfo.mg_state
                return this.$message.error('更新用户状态失败！')
            }
            this.$message.success('更新状态成功！');
        },
        // 监听添加用户对话框关闭事件
        addDialogClose() {
            // console.log(this);
            this.$refs.addFormRef.resetFields();
        },
        // 点击按钮，添加新用户
        addUser() {
            this.$refs.addFormRef.validate(async valid => {
                // console.log(valid);
                if(!valid)   return
                // 发起添加用户的网络请求
                const { data: res} = await this.$http.post('users', this.addForm)
                // console.log(res);
                if(res.meta.status !== 201)   return this.$message.error('添加用户失败！')
                this.$message.success('添加用户成功！')
                // 隐藏新增用户对话框
                this.addDialogVisible = false;
                // 重新获取用户列表数据
                this.getUserList();  
            })
        },
        // 展示编辑用户的对话框
        async showEditDialog(id) {
            console.log(id);
            const { data: res } = await this.$http.get(`users/${id}`)
            console.log(res);
            if(res.meta.status !== 200)   return this.$message.error('查询用户信息失败！')
            this.editForm = res.data
            console.log(this.editForm);
            this.editDialogVisible = true
        },
        // 监听修改用户对话框关闭事件
        editDialogClose() {
            this.$refs.editFormRef.resetFields();
        },
        // 修改用户信息并提交
        editUserInfo() {
            this.$refs.editFormRef.validate(async valid => {
                // console.log(valid);
                if(!valid)   return;
                // 发起修改用户信息的网络请求
                const { data: res } = await this.$http.put('users/' + this.editForm.id, {
                    email: this.editForm.email,
                    mobile: this.editForm.mobile
                })
                if(res.meta.status !== 200)   return this.$message.error('修改用户信息失败！')
                // 关闭对话框
                this.editDialogVisible = false;
                // 刷新用户列表
                this.getUserList();
                // 提示修改成功
                this.$message.success('修改用户信息成功！')
            })
        },
        // 根据id删除对应用户信息
        async removeUserById(id){
            // console.log(id);
            // 弹框确认是否删除
            const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).catch(err => err);

            // 如果用户确认删除，则返回值为字符串 confirm
            // 如果用户取消删除，则返回值为字符串 cancel
            // console.log(confirmResult);
            if(confirmResult !== 'confirm'){
                return this.$message.info('删除取消了~')
            }
            
            // 用户确认删除，开始删除
            const { data: res } = await this.$http.delete('users/' + id)
            console.log(res);
            if(res.meta.status !== 200)   return this.$message.error('删除失败咯！')
            this.$message.success('删除用户成功！')
            this.getUserList();
        },
        // 展示分配角色对话框
        async setRole(userInfo) {
          // 将当前角色信息保存至userInfo数据对象中
          this.userInfo = userInfo

          // 展示对话框前，获取所有角色列表
          const { data:res } = await this.$http.get('roles')
          if(res.meta.status !== 200){
            return this.$message.error('获取角色列表失败！')
          }

          // 定义rolelist对象，将获取的角色列表数据保存到其中
          this.rolelist = res.data

          this.setRoleDialogVisible = true
        },
        // 点击按钮分配角色
        async saveRoleInfo() {
          // 判断用户是否选择了分配角色(若selectedRoleId为空，取反才为true，否则其不为空的话，取反为false)
          if(!this.selectedRoleId === true){
            this.$message.error('请选择要分配的角色！')
          }

          const { data:res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid:this.selectedRoleId })
          if(res.meta.status !== 200){
            return this.$message.error('更新角色失败！')
          }

          this.$message.success('更新角色成功！')
          this.getUserList();
          this.setRoleDialogVisible = false
        },
        // 监听分配分配角色对话框关闭事件,重置两个数据，使得下次打开对话框时，select下拉框不自动记住上次内容
        setRoleDialogClose() {
          this.selectedRoleId = ''
          this.userInfo = {}
        }
    }
}
</script>

<style lang="less" scoped>

</style>