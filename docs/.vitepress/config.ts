import { defineConfig } from 'vitepress'
import UnocssPlugin from '@unocss/vite'
import solidPlugin from 'vite-plugin-solid'
import path from 'path'

export default defineConfig({
  title: 'Antd-solid',
  description: 'UI 库',
  cleanUrls: true,
  head: [
    [
      'link',
      {
        rel: 'shortcut icon',
        href: 'https://gw.alipayobjects.com/zos/rmsportal/rlpTLlbMzTNYuZGGCVYM.png',
      },
    ],
  ],
  appearance: false,
  themeConfig: {
    logo: 'https://gw.alipayobjects.com/zos/rmsportal/rlpTLlbMzTNYuZGGCVYM.png',
    nav: [
      { text: '首页', link: '/' },
      { text: '组件', link: '/components/button' },
    ],
    sidebar: [
      {
        text: '通用',
        items: [{ text: 'Button 按钮', link: '/components/button' }],
      },
      {
        text: '布局',
        items: [
          { text: 'Divider 分割线', link: '/components/divider' },
          { text: 'Compact 压缩', link: '/components/compact' },
        ],
      },
      {
        text: '数据录入',
        items: [
          { text: 'Checkbox 多选框', link: '/components/checkbox' },
          { text: 'ColorPicker 颜色选择器', link: '/components/color-picker' },
          { text: 'DatePicker 日期选择框', link: '/components/date-picker' },
          { text: 'Input 输入框', link: '/components/input' },
          { text: 'InputNumber 数字输入框', link: '/components/input-number' },
          { text: 'Radio 单选框', link: '/components/radio' },
          { text: 'Form 表单', link: '/components/form' },
          { text: 'Select 选择器', link: '/components/select' },
          { text: 'RangeInput 范围输入框', link: '/components/range-input' },
          { text: 'Slider 滑动输入条', link: '/components/slider' },
          { text: 'Switch 开关', link: '/components/switch' },
          { text: 'Transformer 变形器', link: '/components/transformer' },
          { text: 'TreeSelect 树选择', link: '/components/tree-select' },
        ],
      },
      {
        text: '数据展示',
        items: [
          { text: 'Collapse 折叠面板', link: '/components/collapse' },
          { text: 'Empty 空状态', link: '/components/empty' },
          { text: 'Image 图片', link: '/components/image' },
          { text: 'Popover 气泡卡片', link: '/components/popover' },
          { text: 'Segmented 分段控制器', link: '/components/segmented' },
          { text: 'Table 表格', link: '/components/table' },
          { text: 'Tabs 标签页', link: '/components/tabs' },
          { text: 'Tooltip 文字提示', link: '/components/tooltip' },
          { text: 'Tree 树形控件', link: '/components/tree' },
        ],
      },
      {
        text: '反馈',
        items: [
          { text: 'Alert 警告提示', link: '/components/alert' },
          { text: 'Drawer 抽屉', link: '/components/drawer' },
          { text: 'Modal 对话框', link: '/components/modal' },
          { text: 'Popconfirm 气泡确认框', link: '/components/popconfirm' },
          { text: 'Progress 进度条', link: '/components/progress' },
        ],
      },
      {
        text: '其他',
        items: [{ text: 'ConfigProvider 全局化配置', link: '/components/config-provider' }],
      },
      {
        text: 'hooks',
        items: [{ text: 'useVirtualList', link: '/components/use-virtual-list' }],
      },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/Reinhard2019/antd-solid' }],
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
        'antd-solid-css': path.resolve(__dirname, '../../css'),
      },
    },
    plugins: [UnocssPlugin(), solidPlugin()],
  },
})
