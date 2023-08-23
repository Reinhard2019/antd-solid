import { defineConfig } from 'vitepress'
import UnocssPlugin from '@unocss/vite'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "antd-solid",
  description: "UI 库",
  cleanUrls: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '组件', link: '/components/table' }
    ],

    sidebar: [
      {
        text: '组件',
        items: [
          { text: '表格 Table', link: '/components/table' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  },
  vite: {
    plugins: [
      UnocssPlugin(),
    ],
  }
})
