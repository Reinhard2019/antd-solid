import { defineConfig } from 'vitepress'

export const zh = defineConfig({
  lang: 'zh-Hans',
  description: 'UI 库',

  themeConfig: {
    nav: [
      { text: '首页', link: '/zh/' },
      { text: '组件', link: '/zh/components/button' },
    ],
  },
})
