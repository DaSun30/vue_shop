module.exports = {
    chainWebpack: config => {
        // 发布模式
        config.when(process.env.NODE_ENV === 'production', config => {
            config.entry('app').clear().add('./src/main-prod.js')

            // 包名: 全局查找对象名
            // （例）打包时，不会将vue包合并到输出js文件中，而是会去window全局查找并使用Vue对象
            config.set('externals', {
                vue: 'Vue',
                'vue-router': 'VueRouter',
                axios: 'axios',
                lodash: '_',
                echarts: 'echarts',
                nprogress: 'NProgress',
                'vue-quill-editor': 'VueQuillEditor'
            })

            // 为html插件新增isProd属性
            config.plugin('html').tap(args => {
                args[0].isProd = true
                return args
            })
        })

        // 开发模式
        config.when(process.env.NODE_ENV === 'development', config => {
            config.entry('app').clear().add('./src/main-dev.js')

            // 为html插件新增isProd属性
            config.plugin('html').tap(args => {
                args[0].isProd = false
                return args
            })
        })
    }
}