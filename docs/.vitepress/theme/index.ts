import 'uno.css'
import DefaultTheme from 'vitepress/theme'
import 'antd-solid/index.css'
import './index.css'
import Code from '../components/Code.vue'

export default {
  ...DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp(ctx)
    ctx.app.component('Code', Code)
  },
}