import 'uno.css'
import DefaultTheme from 'vitepress/theme'
import './index.scss'
import Code from '../components/Code.vue'
import Demo from '../components/Demo.vue'

export default {
  ...DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp(ctx)
    ctx.app.component('Code', Code)
    ctx.app.component('Demo', Demo)
  },
}
