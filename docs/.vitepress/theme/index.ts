import 'uno.css'
import DefaultTheme from 'vitepress/theme'
import Demo from '../components/Demo.vue'

export default {
  ...DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp(ctx)
    ctx.app.component('Demo', Demo)
  },
}