<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>订单管理</el-breadcrumb-item>
          <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <el-row>
                <el-col :span="8">
                    <el-input placeholder="请输入内容" class="input-with-select">
                        <el-button slot="append" icon="el-icon-search">
                        </el-button>
                    </el-input>
                </el-col>
            </el-row>

            <!-- 订单列表数据 -->
            <el-table :data="orderlist" border stripe>
                <el-table-column label="#" type="index"></el-table-column>
                <el-table-column label="订单编号" prop="order_number"></el-table-column>
                <el-table-column label="订单价格" prop="order_price"></el-table-column>
                <el-table-column label="是否付款" prop="pay_status">
                    <template v-slot="slotProps">
                        <el-tag type="success" v-if="slotProps.row.pay_status === '1'">已付款</el-tag>
                        <el-tag type="danger" v-else>未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="是否发货" prop="is_send"></el-table-column>
                <el-table-column label="下单时间" prop="create_time">
                    <template v-slot="slotProps">
                        {{slotProps.row.create_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template v-slot="slotProps">
                        <el-button type="primary" icon="el-icon-edit"  size="mini" @click="editAddress(slotProps.row)"></el-button>
                        <el-button type="success" icon="el-icon-location"
                        size="mini" @click="showProgress"></el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页区域 -->
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryInfo.pagenum"
              :page-sizes="[5, 10, 15, 20]"
              :page-size="queryInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
            </el-pagination>
        </el-card>

        <!-- 修改地址对话框 -->
        <el-dialog
          title="修改地址"
          :visible.sync="editAddressDialogVisible"
          width="50%"
          @close="editAddressDialogClose">
          <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="100px">
            <el-form-item label="省市区/县" prop="address1">
                <el-cascader
                  v-model="editForm.address1"
                  :options="cityData"
                  :props="cityProps"
                  @change="handleChange"></el-cascader>
            </el-form-item>
            <el-form-item label="详细地址" prop="address2">
              <el-input v-model="editForm.address2" ></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="editAddressDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editAddressDialogVisible = false">确 定</el-button>
          </span>
        </el-dialog>


        <!-- 物流进度对话框 -->
        <el-dialog
          title="物流进度"
          :visible.sync="progressDialogVisible"
          width="50%">
          <!-- 时间线 -->
          <el-timeline>
              <el-timeline-item
                v-for="(activity, index) in progressInfo"
                :key="index"
                :timestamp="activity.time">
                {{activity.context}}
              </el-timeline-item>
            </el-timeline>
        </el-dialog>
    </div>
</template>

<script>
import cityData from './citydata.js'

export default {
    data() {
        return {
            // 订单查询参数
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 10
            },
            // 总订单条数
            total: 0,
            // 订单列表数组
            orderlist: [],
            // 控制修改地址对话框的显示与隐藏
            editAddressDialogVisible: false,
            // 修改地址表单对象
            editForm: {
                address1: [],
                address2: ''
            },
            // 修改地址表单验证规则对象
            editFormRules: {
                address1: [
                    { required: true, message: '请选择省市区县', trigger: 'blur'}
                ],
                address2: [
                    { required: true, message: '请填写详细地址', trigger: 'blur'}
                ],
            },
            // 导入的城市信息
            cityData: cityData,
            // 级联选择框配置对象
            cityProps: {
                expandTrigger: 'hover',
            },
            // 控制物流弹出框的显示与隐藏
            progressDialogVisible: false,
            // 物流数据数组
            progressInfo: [{
                  "time": "2018-05-10 09:39:00",
                  "ftime": "2018-05-10 09:39:00",
                  "context": "已签收,感谢使用顺丰,期待再次为您服务",
                  "location": ""
                },
                {
                  "time": "2018-05-10 08:23:00",
                  "ftime": "2018-05-10 08:23:00",
                  "context": "[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正         在为您派件",
                  "location": ""
                },
                {
                  "time": "2018-05-10 07:32:00",
                  "ftime": "2018-05-10 07:32:00",
                  "context": "快件到达 [北京海淀育新小区营业点]",
                  "location": ""
                },
                {
                  "time": "2018-05-10 02:03:00",
                  "ftime": "2018-05-10 02:03:00",
                  "context": "快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新         小区营业点]",
                  "location": ""
                },
                {
                  "time": "2018-05-09 23:05:00",
                  "ftime": "2018-05-09 23:05:00",
                  "context": "快件到达 [北京顺义集散中心]",
                  "location": ""
                },
                {
                  "time": "2018-05-09 21:21:00",
                  "ftime": "2018-05-09 21:21:00",
                  "context": "快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中         心]",
                  "location": ""
                },
                {
                  "time": "2018-05-09 13:07:00",
                  "ftime": "2018-05-09 13:07:00",
                  "context": "顺丰速运 已收取快件",
                  "location": ""
                },
                {
                  "time": "2018-05-09 12:25:03",
                  "ftime": "2018-05-09 12:25:03",
                  "context": "卖家发货",
                  "location": ""
                },
                {
                  "time": "2018-05-09 12:22:24",
                  "ftime": "2018-05-09 12:22:24",
                  "context": "您的订单将由HLA（北京海淀区清河中街店）门店安排发货。         ",
                  "location": ""
                },
                {
                  "time": "2018-05-08 21:36:04",
                  "ftime": "2018-05-08 21:36:04",
                  "context": "商品已经下单",
                  "location": ""
                }]
        }
    },
    created() {
        this.getOrderList()
    },
    methods: {
        // 获取订单列表
        async getOrderList() {
            const { data:res } = await this.$http.get('orders', {
                params: this.queryInfo
            })
            if(res.meta.status !== 200){
                return this.$message.error('获取订单列表失败!')
            }

            console.log(res);
            this.total = res.data.total
            this.orderlist = res.data.goods
        },
        // 分页单页条数变化事件
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getOrderList()
        },
        // 分页当前页面变化事件
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getOrderList()
        },
        // 改变当前订单地址事件
        editAddress(row) {
            this.editAddressDialogVisible = true
        },
        // 修改地址对话框关闭事件
        editAddressDialogClose() {
            this.$refs.editFormRef.resetFields()
        },
        // 级联选择器修改事件
        handleChange() {
            console.log(this.editForm.address1);
        },
        // 点击按钮，打开物流进度弹出框
        async showProgress() {
            this.progressDialogVisible = true

            // const { data:res } = await this.$http.get('/kuaidi')
            // if(res.meta.status !== 200){
            //     return this.$message.error('获取物流进度失败！')
            // }

            // this.progressInfo = res.data

            console.log(this.progressInfo);
        }
    }
}
</script>

<style lang="less" scoped>
.el-cascader {
    width: 100%;
}
</style>