<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>角色管理</el-breadcrumb-item>
          <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 添加角色按钮区域 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddRoleDialog">添加角色</el-button>
                </el-col>
            </el-row>

            <!-- 角色列表区域 -->
            <el-table :data="rolelist" border stripe>
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <!-- 权限渲染 -->
                        <!-- 渲染一级权限 -->
                        <el-row :class="['vcenter', 'bdbottom', i1 === 0 ? 'bdtop' : '']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
                            <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{i1}}{{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 渲染二级&三级权限 -->
                            <el-col :span="19">
                                <!-- 通过for循环嵌套渲染二级权限 -->
                                <el-row :class="[i2 !== 0 ? 'bdtop' : '', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id" >
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{i2}}{{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>                                        
                                    </el-col>
                                    <el-col :span="18">
                                        <!-- 通过for循环嵌套渲染三级权限 -->
                                        <el-tag type="warning" v-for="(item3, i3) in item2.children" :key="item3.id" 
                                        closable @close="removeRightById(scope.row, item3.id)">{{i3}}{{item3.authName}}</el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column label = "#" type="index"></el-table-column>
                <el-table-column label = "角色名称" prop="roleName"></el-table-column>
                <el-table-column label = "角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label = "操作" width="300px">
                    <!-- 作用域插槽获取表格此字段的每一条数据 -->
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditRoleDialog(scope.row)">编辑</el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeRoleById(scope.row)">删除</el-button>
                        <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 分配权限对话框 -->
        <el-dialog
          title="分配权限"
          :visible.sync="setRightDialogVisible"
          width="50%"
          @close="setRightDialogClose">
          <!-- 树形控件 -->
          <el-tree :data="rightlist" :props="treeProps" show-checkbox node-key="id" 
          default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
          <span slot="footer" class="dialog-footer">
            <el-button @click="setRightDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="allotRights">确 定</el-button>
          </span>
        </el-dialog>

        <!-- 添加角色对话框 -->
        <el-dialog
          title="提示"
          :visible.sync="addRoleDialogVisible"
          width="50%"
          @close="addRoleDialogClose">
          <el-form ref="addRoleFormRef" :model="addRoleForm" :rules="addRoleFormRules" label-width="80px">
            <el-form-item label="角色名称" prop="roleName">
              <el-input v-model="addRoleForm.roleName"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" prop="roleDesc">
              <el-input v-model="addRoleForm.roleDesc"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="addRoleDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addRole">确 定</el-button>
          </span>
        </el-dialog>

        <!-- 编辑修改角色对话框 -->
        <el-dialog
          title="修改角色"
          :visible.sync="editRoleDialogVisible"
          width="50%"
          @close="editRoleDialogClose">
          <el-form ref="editRoleFormRef" :model="editRoleForm" :rules="editRoleFormRules" label-width="80px">
            <el-form-item label="角色ID">
              <el-input v-model="editRoleForm.roleId" disabled></el-input>
            </el-form-item>
            <el-form-item label="角色名称" prop="roleName">
              <el-input v-model="editRoleForm.roleName"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" prop="roleDesc">
              <el-input v-model="editRoleForm.roleDesc"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="editRoleDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editRole">确 定</el-button>
          </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            //所有角色列表数据
            rolelist:[],
            // 控制分配权限对话框显示与隐藏
            setRightDialogVisible: false,
            // 所有权限数据
            rightlist:[],
            // 树形控件属性绑定对象
            treeProps: {
                label: 'authName',
                children: 'children'
            },
            // 默认选中节点id值数组
            defKeys:[],
            // 当前即将分配权限的角色id
            roleId:'',
            // 控制新增角色对话框显示与隐藏
            addRoleDialogVisible: false,
            // 新增角色表单数据
            addRoleForm: {
                roleName: '',
                roleDesc: ''
            },
            // 新增角色表单验证规则对象
            addRoleFormRules: {
                roleName: [
                    { required: true, message: '请输入角色名称', trigger: 'blur' },
                ],
                roleDesc: [
                    { required: true, message: '请输入角色描述', trigger: 'blur' },
                ]
            },
            // 控制修改角色对话框显示与隐藏
            editRoleDialogVisible: false,
            // 编辑修改角色表单数据
            editRoleForm: {
                roleId: '',
                roleName: '',
                roleDesc: ''
            },
            // 修改角色表单验证规则对象
            editRoleFormRules: {
                roleName: [
                    { required: true, message: '请输入角色名称', trigger: 'blur' },
                ],
                roleDesc: [
                    { required: true, message: '请输入角色描述', trigger: 'blur' },
                ]
            }
        }
    },
    created() {
        this.getRoleList()
    },
    methods: {
        // 获取所有角色列表
        async getRoleList(){
            const { data: res } = await this.$http.get('roles')
            if(res.meta.status !== 200){
                return this.$message.error('获取角色列表失败！')
            }

            this.rolelist = res.data
            console.log(this.rolelist);
        },
        // 根据id删除对应权限
        async removeRightById(role, rightId){
            // 弹框提示用户是否删除
            const confirmRes = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).catch(err => err)

            if(confirmRes !== 'confirm'){
                return this.$message('删除已取消！')
            }

            const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
            if(res.meta.status !== 200){
                return this.$message.error('删除权限失败！')
            }

            // // 刷新角色列表
            // this.getRoleList();
            
            role.children = res.data

        },
        // 展示分配权限对话框
        async showSetRightDialog(role) {
            //保存当前对话框对应角色的id
            this.roleId = role.id
            
            const { data: res} = await this.$http.get('rights/tree')
            if(res.meta.status !== 200){
                return this.$message.error('获取权限数据失败!')
            }

            // 把获取到的权限数据保存到data的rightlist中
            this.rightlist = res.data
            console.log(this.rightlist);

            // 递归获取三级节点id
            this.getLeafKeys(role, this.defKeys)

            this.setRightDialogVisible = true
        },
        // 递归获取角色下所有第三级权限id，保存到defKeys数组中
        getLeafKeys(node, arr) {
            // 若当前node节点不包含children属性，则为三级节点，将id推入数组
            if(!node.children){
                return arr.push(node.id)
            }

            node.children.forEach(item => {
                this.getLeafKeys(item, arr)
            })
        },
        // 监听分配权限对话框关闭事件
        setRightDialogClose(){
            // 清空defKeys
            this.defKeys = []
        },
        // 点击权限列表弹出框中的确定按钮为角色分配权限
        async allotRights(){
            // 获取所有选中，半选中的权限id列表
            const keys = [...this.$refs.treeRef.getCheckedKeys(),...this.$refs.treeRef.getHalfCheckedKeys()]
            // 将key数组拼接成字符串
            const idStr = keys.join(',')

            const { data:res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
            if(res.meta.status !== 200){
                this.$message.error('更新权限列表失败！')
            }
            this.$message.success('分配权限成功！')
            // 刷新数据列表
            this.getRoleList()
            // 隐藏分配权限对话框
            this.setRightDialogVisible = false
        },
        // 展示新增角色对话框
        showAddRoleDialog() {
            this.addRoleDialogVisible = true
        },
        // 点击按钮，添加新角色
        addRole() {
            this.$refs.addRoleFormRef.validate(async valid => {
                // valid在前面定义rules规则通过时为true，有一项不通过都为false
                if(!valid)   return;
                // valid为true，开始新增角色
                const { data:res } = await this.$http.post('roles', this.addRoleForm)
                if(res.meta.status !== 201){
                    return this.$message.error('新增角色失败！')
                }
                this.$message.success('新增角色成功！')

                this.addRoleDialogVisible = false
                // 刷新角色列表
                this.getRoleList()
            })
            
        },
        // 新增角色对话框关闭事件，重置表单
        addRoleDialogClose() {
            this.$refs.addRoleFormRef.resetFields();
        },
        // 展示编辑角色对话框
        async showEditRoleDialog(role) {
            this.editRoleDialogVisible = true
            // 发起get请求根据id查询角色，放入editRoleForm中
            const { data:res } = await this.$http.get(`roles/${role.id}`)
            if(res.meta.status !== 200){
                return this.$message.error('获取当前角色信息失败！')
            }
            this.editRoleForm = res.data
        },
        // 编辑角色对话框关闭事件，重置表单数据和校验结果
        editRoleDialogClose() {
            this.$refs.editRoleFormRef.resetFields();
        },
        // 点击按钮，修改当前角色
        editRole() {
            this.$refs.editRoleFormRef.validate(async valid => {
                // 编辑角色表单校验失败，返回
                if(!valid)   return;
                // 校验成功，发起put请求，修改当前角色信息
                const { data:res } = await this.$http.put('roles/' + this.editRoleForm.roleId, {
                    roleName: this.editRoleForm.roleName,
                    roleDesc: this.editRoleForm.roleDesc
                })
                if(res.meta.status !== 200){
                    return this.$message.error('修改角色失败！')
                }
                this.$message.success('修改用户成功！')
                // 修改成功，关闭弹出框，刷新角色列表
                this.editRoleDialogVisible = false
                this.getRoleList();
            })
        },
        // 根据id删除当前角色
        async removeRoleById(role){
            const confirmRes = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).catch(err => err)

            // 如果用户确认删除，则返回值为字符串 confirm
            // 如果用户取消删除，则返回值为字符串 cancel
            if(confirmRes !== 'confirm'){
                return this.$message.info('删除取消了~')
            }
            // 开始删除
            const { data:res } = await this.$http.delete('roles/' + role.id)
            if(res.meta.status !== 200){
                return this.$message.error('删除当前角色失败！')
            }
            this.$message.success('删除当前角色成功！')
            this.getRoleList()
        }
    }
}
</script>

<style lang="less" scoped>
.el-tag {
    margin: 7px;
}

.bdtop {
    border-top: 1px solid #eee;
}

.bdbottom {
    border-bottom: 1px solid #eee;
}

// 纵向居中对齐
.vcenter {
    display: flex;
    align-items: center;
}
</style>