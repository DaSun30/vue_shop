<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>商品管理</el-breadcrumb-item>
          <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>

         <!-- 卡片视图区域 -->
        <el-card>
            <el-alert title="注意！只允许为第三级分类设置相关参数！" type="warning" :closable="false">
            </el-alert>

            <!-- 选择商品分类区域 -->
            <el-row class="cat_opt">
                <el-col>
                    <span>选择商品分类：</span>
                    <!-- 选择商品分类的级联选择框 -->
                    <el-cascader
                        v-model="selectedCateKeys"
                        :options="catelist"
                        :props="cateProps"
                        @change="handleChange"></el-cascader>
                </el-col>
            </el-row>
            
            <!-- Tabs标签区域 -->
            <el-tabs v-model="activeName" @tab-click="handleClick">
                <!-- 添加动态参数面板 -->
                <el-tab-pane label="动态参数" name="many">
                    <!-- 添加参数按钮 -->
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="showAddDialog">添加参数</el-button>
                    <!-- 动态参数表格 -->
                    <el-table :data="manyTableData" style="width: 100%" border stripe>
                        <!-- 展开行 -->
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleTagClose(i, scope.row)">{{item}}</el-tag>
                                <!-- 输入的文本框 -->
                                <el-input
                                  class="input-new-tag"
                                  v-if="scope.row.inputVisible"
                                  v-model="scope.row.inputValue"
                                  ref="saveTagInput"
                                  size="small"
                                  @keyup.enter.native="handleInputConfirm(scope.row)"
                                  @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <!-- 添加按钮 -->
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <!--  索引列 -->
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <!-- 添加静态属性面板 -->
                <el-tab-pane label="静态属性" name="only">
                    <!-- 添加属性按钮 -->
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="showAddDialog">添加属性</el-button>
                    <!-- 静态属性表格 -->
                    <el-table :data="onlyTableData" style="width: 100%" border stripe>
                        <!-- 展开行 -->
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleTagClose(i, scope.row)">{{item}}</el-tag>
                                <!-- 输入的文本框 -->
                                <el-input
                                  class="input-new-tag"
                                  v-if="scope.row.inputVisible"
                                  v-model="scope.row.inputValue"
                                  ref="saveTagInput"
                                  size="small"
                                  @keyup.enter.native="handleInputConfirm(scope.row)"
                                  @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <!-- 添加按钮 -->
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <!--  索引列 -->
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>


        <!-- 添加参数对话框 -->
        <el-dialog
          :title="'添加' + titleText"
          :visible.sync="addDialogVisible"
          width="50%"
          @close="addDialogClose">
          <!-- 添加参数表单 -->
          <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="80px">
            <el-form-item :label="titleText" prop="attr_name">
              <el-input v-model="addForm.attr_name"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addParams">确 定</el-button>
          </span>
        </el-dialog>


        <!-- 修改参数对话框 -->
        <el-dialog
          :title="'修改' + titleText"
          :visible.sync="editDialogVisible"
          width="50%"
          @close="editDialogClose">
          <!-- 添加参数表单 -->
          <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="80px">
            <el-form-item :label="titleText" prop="attr_name">
              <el-input v-model="editForm.attr_name"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editParams">确 定</el-button>
          </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 商品分类列表
            catelist:[],
            // 级联选择框配置对象
            cateProps: {
                expandTrigger: 'hover',
                value: 'cat_id',
                label: 'cat_name',
                children: 'children'
            },
            // 级联选择框双向绑定的数组
            selectedCateKeys: [],
            // 被激活标签名称
            activeName: 'many',
            // 动态参数数据对象数组
            manyTableData: [],
            // 静态属性数据对象数组
            onlyTableData: [],
            // 控制添加对话框的显示与隐藏
            addDialogVisible: false,
            // 添加参数表单数据对象
            addForm: {
                attr_name: ''
            },
            // 添加表单的验证规则对象
            addFormRules:{
                attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
            },
            // 控制修改对话框的显示与隐藏
            editDialogVisible: false,
            // 修改参数表单数据对象
            editForm: {},
            // 修改表单的验证规则对象
            editFormRules: {
                attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
            },
        }
    },
    created() {
        this.getCateList()
    },
    methods: {
        // 获取所有商品分类列表
        async getCateList() {
            const { data:res } = await this.$http.get('categories')
            if(res.meta.status !== 200){
                return this.$message.error('获取分类列表失败！')
            }

            this.catelist = res.data
            console.log(this.catelist);
        },
        // 级联选择框选中项变化触发此方法
        handleChange() {
            this.getParamsData()
        },
        //  Tabs标签点击事件处理函数
        handleClick() {
            console.log(this.activeName);
            this.getParamsData()
        },
        // 获取参数列表数据
        async getParamsData() {
            // 选中的不是第三级分类
            if(this.selectedCateKeys.length !== 3){
                this.selectedCateKeys = []
                this.manyTableData = []
                this.onlyTableData = []
                return
            }
            // 选中的是第三级分类
            // console.log(this.selectedCateKeys);
            // 根据所选分类id和当前分类面板获取对应参数
            const { data:res } = await this.$http.get('categories/' + this.cateId + '/attributes', 
                { params: { sel:this.activeName }})
            if(res.meta.status !== 200){
                return this.$message.error('获取参数列表失败！')
            }

            // 将attr_vals根据逗号分隔成数组，并赋值回给item.attr_vals,用于渲染tags
            res.data.forEach(item => {
                // 判断，若attrvals原本为空，则直接返回空数组，不分隔
                item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
                // 控制文本框的显示与隐藏
                item.inputVisible = false
                // 文本框中的输入值
                item.inputValue = ''
            })
            console.log(res.data);

            if(this.activeName === 'many'){
                this.manyTableData = res.data
            } else {
                this.onlyTableData = res.data
            }
        },
        // 点击按钮，展示添加动态参数/静态属性对话框
        showAddDialog() {
            this.addDialogVisible = true
        },
        // 监听添加对话框关闭事件
        addDialogClose() {
            // 重置添加参数表单，防止验证规则重复显示
            this.$refs.addFormRef.resetFields()
        },
        // 点击确定按钮，添加参数
        addParams() {
            this.$refs.addFormRef.validate(async valid => {
                if(!valid)  return
                const { data:res } = await this.$http.post('categories/' + this.cateId + '/attributes', {
                    attr_name: this.addForm.attr_name,
                    attr_sel: this.activeName
                })
                if(res.meta.status !== 201){
                    return this.$message.error('添加参数失败！')
                }
                this.$message.success('添加参数成功！')
                this.addDialogVisible = false
                this.getParamsData()
            })
        },
        // 点击按钮，展示编辑动态参数/静态属性对话框
        async showEditDialog(attrId){
            // 查询当前参数信息1.7.4
            const { data:res } = await this.$http.get('categories/' + this.cateId + '/attributes/' + attrId, {
                params: { attr_sel: this.activeName }})
            if(res.meta.status !== 200){
                return this.$message.error('查询参数出错！')
            }
            this.editForm = res.data
            this.editDialogVisible = true
        },
        // 监听修改对话框关闭事件
        editDialogClose() {
            this.$refs.editFormRef.resetFields()
        },
        // 点击按钮，修改参数信息
        editParams() {
            this.$refs.editFormRef.validate(async valid => {
                if(!valid)  return
                const { data:res } = await this.$http.put('categories/' + this.cateId + '/attributes/' + this.editForm.attr_id, {
                    attr_name: this.editForm.attr_name,
                    attr_sel: this.activeName
                })
                if(res.meta.status !== 200){
                    return this.$message.error('更新参数失败！')
                }
                this.$message.success('更新参数成功！')
                this.editDialogVisible = false
                this.getParamsData()
            })
        },
        // 根据id删除对应参数项
        async removeParams(attrId) {
            const confirmRes = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).catch(err => err)

            if(confirmRes !== 'confirm'){
                return this.$message.info('删除取消了~')
            }
            // 继续删除
            const { data:res } = await this.$http.delete('categories/' + this.cateId + '/attributes/' + attrId)
            if(res.meta.status !== 200){
                return this.$message.error('删除参数失败！')
            }
            this.$message.success('删除参数成功！')
            this.getCateList()
        },
        // 文本框失去焦点，或按下回车键触发
        async handleInputConfirm(row) {
            // 用户输入的全是空格，无效，return
            if(row.inputValue.trim().length === 0){
                row.inputValue = ''
                row.inputVisible = false
                return
            }
            // 若无return，则用户输入了真实字符，需要后续处理
            row.attr_vals.push(row.inputValue.trim())
            row.inputValue = ''
            row.inputVisible = false
            // 发起http请求保存tag(attr_vals)增加操作
            this.saveAttrVals(row)
        },
        // 点击按钮，显示input输入框
        showInput(row) {
            row.inputVisible = true
            // 让文本框自动获得焦点
            // nextTick作用：当页面元素被重新渲染之后，才执行回调函数中代码(防止执行focus()时input元素还未被渲染)
            this.$nextTick(_ => {
              this.$refs.saveTagInput.$refs.input.focus();
            });
        },
        // 将对Attr_vals数组的操作保存至数据库
        async saveAttrVals(row) {
            const { data:res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
                attr_name: row.attr_name,
                attr_sel: this.activeName,
                // 拼接attr_vals数组成字符串
                attr_vals: row.attr_vals.join(',')
            })
            if(res.meta.status !== 200){
                return this.$message.error('修改参数项失败!')
            }
            this.$message.success('修改参数项成功!')
        }, 
        // tag标签关闭事件
        handleTagClose(i, row){
            row.attr_vals.splice(i, 1)
            this.saveAttrVals(row)
        }
    },
    computed: {
        // 如果按钮需要被禁用，返回true，否则返回false
        isBtnDisabled() {
            return this.selectedCateKeys.length !== 3 ? true : false
        },
        // 当前选中的第三级分类的id
        cateId() {
            return this.selectedCateKeys.length === 3 ? this.selectedCateKeys[2] : null
        },
        // 动态计算标题文本
        titleText() {
            if(this.activeName === 'many'){
                return '动态参数'
            }
            return '静态属性'
        }

    }
}
</script>

<style lang="less" scoped>
.cat_opt {
    margin: 15px 0;
}

.el-tag {
    margin: 7px;
}

.input-new-tag {
    width: 140px;
}
</style>