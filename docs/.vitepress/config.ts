import { defineConfig } from 'vitepress'
import UnocssPlugin from '@unocss/vite'
import solidPlugin from 'vite-plugin-solid'
import path from 'path'

export default defineConfig({
  title: "Antd-solid",
  description: "UI 库",
  cleanUrls: true,
  head: [['link', { rel: 'shortcut icon', href: 'https://gw.alipayobjects.com/zos/rmsportal/rlpTLlbMzTNYuZGGCVYM.png' }]],
  themeConfig: {
    logo: 'https://gw.alipayobjects.com/zos/rmsportal/rlpTLlbMzTNYuZGGCVYM.png',
    nav: [
      { text: '首页', link: '/' },
      { text: '组件', link: '/components/button' }
    ],
    sidebar: [
      {
        text: '通用组件',
        items: [
          { text: 'Button 按钮', link: '/components/button' },
        ]
      },
      {
        text: '数据展示',
        items: [
          { text: 'Table 表格', link: '/components/table' },
        ]
      },
      {
        text: '数据录入',
        items: [
          { text: 'ColorPicker 颜色选择器', link: '/components/color-picker' },
          { text: 'Input 输入框', link: '/components/input' },
          { text: 'InputNumber 数字输入框', link: '/components/input-number' },
          { text: 'Form 表单', link: '/components/form' },
          { text: 'Select 选择器', link: '/components/select' },
        ]
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Reinhard2019/antd-solid' }
    ],
    footer: {
      copyright: 'Released under the MIT License. Copyright © 2023-present 丁磊',
    },
  },
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../../docs'),
        'antd-solid': path.resolve(__dirname, '../../src'),
        'antd-solid-dist': path.resolve(__dirname, '../../dist'),
      },
    },
    plugins: [
      UnocssPlugin(),
      solidPlugin(),
    ],
  }
})
