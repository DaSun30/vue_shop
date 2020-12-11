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
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>

            <!-- 表格区域 -->
            <tree-table class="treeTable" :data="catelist" :columns="columns" :selection-type="false" :expand-type="false" 
            :show-index="true" border :show-row-hover="false">
                <!-- 是否有效模板列（slot指定插槽名，scope获取本行数据） -->
                <template slot="isok" slot-scope="scope">
                    <i class="el-icon-success" v-if="scope.row.cat_deleted === false"
                    style="color: lightgreen"></i>
                    <i class="el-icon-error" v-else style="color: red"></i>
                </template>
                <!-- 排序模板列 -->
                <template slot="order" slot-scope="scope">
                    <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
                    <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                    <el-tag type="warning" size="mini" v-else>三级</el-tag>
                </template>
                <!-- 操作 -->
                <template slot="opt" slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCateDialog(scope.row)">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCateById(scope.row)">删除</el-button>
                </template>
            </tree-table>
            <!-- 分页区域 -->
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryInfo.pagenum"
              :page-sizes="[3, 5, 10, 20]"
              :page-size="queryInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
            </el-pagination>

            
        </el-card>

        <!-- 添加分类对话框 -->
            <el-dialog
              title="添加分类"
              :visible.sync="addCateDialogVisible"
              width="50%"
              @close="addCartDialogClose">
              <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
                <el-form-item label="分类名称：" prop="cat_name">
                  <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类：">
                    <!-- options指定数据源 -->
                    <!-- props用于指定配置对象 -->
                    <el-cascader
                    v-model="selectedKeys"
                    :options="parentCateList"
                    :props="cascaderProps"
                    @change="parentCateChange"
                    clearable></el-cascader>
                </el-form-item>
              </el-form>
              <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
              </span>
            </el-dialog>

            <!-- 编辑分类对话框 -->
            <el-dialog
              title="编辑分类"
              :visible.sync="editCateDialogVisible"
              width="50%"
              @close="editCateDialogClose">
              <el-form ref="editCateFormRef" :model="editCateForm" :rules="editCateFormRules" label-width="100px">
                <el-form-item label="分类名称: " prop="cat_name">
                  <el-input v-model="editCateForm.cat_name"></el-input>
                </el-form-item>
              </el-form>
              <span slot="footer" class="dialog-footer">
                <el-button @click="editCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editCate">确 定</el-button>
              </span>
            </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 查询条件
            queryInfo: {
                type: 3,
                pagenum: 1,
                pagesize: 5
            },
            // 商品分类数据列表，默认为空
            catelist: [],
            // 总数据条数
            total: 0,
            // 为table指定列的定义
            columns: [{
                label: '分类名称',
                prop: 'cat_name'
            },{
                label: '是否有效',
                // 表示将当前列定义为模板列
                type: 'template',
                // 表示当前列使用的模板名称
                template: 'isok',
            },{
                label: '排序',
                // 表示将当前列定义为模板列
                type: 'template',
                // 表示当前列使用的模板名称
                template: 'order',
            },{
                label: '操作',
                // 表示将当前列定义为模板列
                type: 'template',
                // 表示当前列使用的模板名称
                template: 'opt',
            }],
            // 控制添加分类对话框的显示与隐藏
            addCateDialogVisible: false,
            // 添加分类的表单数据对象
            addCateForm: {
                // 父级分类
                cat_pid: 0,
                // 将要添加分类的名称
                cat_name: '',
                // 分类的等级，默认要添加的是一级分类
                cat_level: 0
            },
            // 添加分类表单验证规则对象
            addCateFormRules: {
                cat_name: [
                  { required: true, message: '请输入分类名称', trigger: 'blur' }
                ]
            },
            // 父级分类的列表(是个数组)
            parentCateList: [],
            // 指定级联选择器配置对象
            cascaderProps: {
                expandTrigger: 'hover',
                value: 'cat_id',
                label: 'cat_name',
                children: 'children',
                checkStrictly: true
            },
            // 选中的父级分类的id数组
            selectedKeys: [],
            // 控制编辑分类对话框的显示与隐藏
            editCateDialogVisible: false,
            // 修改分类的表单数据对象
            editCateForm: {
                cat_name: '',
                cat_id: 0
            },
            // 编辑分类表单验证规则对象
            editCateFormRules: {
                cat_name: [
                  { required: true, message: '请输入分类名称', trigger: 'blur' }
                ]
            }
        }
    },
    created() {
        this.getCateList()
    },
    methods: {
        // 获取商品分类数据
        async getCateList(){
            const { data: res } = await this.$http.get('categories', { params:this.queryInfo })
            if(res.meta.status !== 200){
                return this.$message.error('获取商品分类失败！')
            }

            console.log(res.data);
            // 商品分类结果在result中，赋值给catelist
            this.catelist = res.data.result
            // 为总数据条数赋值
            this.total = res.data.total
        },
        // 监听pagesize改变事件
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getCateList()
        },
        // 监听pagenum改变事件
        handleCurrentChange(newPageNum) {
            this.queryInfo.pagenum = newPageNum
            this.getCateList()
        },
        // 点击按钮，展示添加分类对话框
        showAddCateDialog() {
            // 先获取父级分类数据列表
            this.getParentCateList()
            // 再展示对话框
            this.addCateDialogVisible = true
        },
        // 获取父级分类的数据列表
        async getParentCateList() {
            const { data:res } =  await this.$http.get('categories', { params: { type: 2 }})
            if(res.meta.status !== 200){
                return this.$message.error('获取父级分类数据失败！')
            }

            this.parentCateList = res.data
            console.log(res.data);
        },
        // 父级分类选择项发生变化触发这个函数
        parentCateChange() {
            // 如果selectedKeys数组length大于0，证明选中的父级分类
            // 反之说明没有选中任何父级分类
            if(this.selectedKeys.length > 0){
                // 父级分类的id
                this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
                // 为当前分类的等级赋值
                this.addCateForm.cat_level = this.selectedKeys.length
            }else {
                // 父级分类的id
                this.addCateForm.cat_pid = 0
                // 为当前分类的等级赋值
                this.addCateForm.cat_level = 0
            }
        },
        // 点击按钮，添加新的分类
        addCate() {
            this.$refs.addCateFormRef.validate(async valid => {
                if(!valid)  return
                const { data:res } = await this.$http.post('categories', this.addCateForm)
                if(res.meta.status !== 201){
                    return this.$message.error('添加分类失败！')
                }

                this.$message.success('添加分类成功！')
                this.getCateList()
                this.addCateDialogVisible = false
            })
        },
        // 监听对话框关闭事件，重置表单数据
        addCartDialogClose() {
            this.$refs.addCateFormRef.resetFields();
            this.addCateForm.cat_pid = 0;
            this.addCateForm.cat_level = 0
            this.selectedKeys = []
        },
        // 点击按钮，展示编辑分类对话框
        async showEditCateDialog(cate) {
            this.editCateDialogVisible = true
            // 根据id，查询当前分类名称，放入editCateForm中
            const { data:res } = await this.$http.get('categories/' + cate.cat_id)
            if(res.meta.status !== 200)   return this.$message.error('查询当前分类名称失败！')
            // console.log(res);
            // 将查询到的分类名放入编辑分类数据对象中
            this.editCateForm.cat_name = res.data.cat_name
            // 将当前分类的id放入编辑分类数据对象中
            this.editCateForm.cat_id = cate.cat_id
        },
        // 点击按钮，修改原分类名
        editCate() {
            this.$refs.editCateFormRef.validate(async valid => {
                if(!valid)  return
                const { data:res } = await this.$http.put('categories/' + this.editCateForm.cat_id, {
                    cat_name: this.editCateForm.cat_name
                })
                if(res.meta.status !== 200)   return this.$message.error('更新当前分类名失败！')
                this.$message.success('更新当前分类名成功！')
                this.getCateList()
                this.editCateDialogVisible = false
            })
        },
        // 监听编辑分类对话框关闭事件，重置表单数据
        editCateDialogClose() {
            this.$refs.editCateFormRef.resetFields()
            this.editCateForm.cat_name = ''
            this.editCateForm.cat_id = 0
        }, 
        // 根据id删除当前分类
        async removeCateById(cate) {
            const confirmRes = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).catch(err => err)

            if(confirmRes !== 'confirm'){
                return this.$message.info('删除取消了')
            }
            // 开始删除
            const { data:res } = await this.$http.delete('categories/' + cate.cat_id)
            if(res.meta.status !== 200){
                return this.$message.error('删除当前分类失败！')
            }
            this.$message.success('删除当前分类成功！')
            this.getCateList()
        }
    }
}
</script>

<style lang="less" scoped>
.treeTable {
    margin-top: 15px
}

.el-cascader {
    width: 100%;
}
</style>