import { defineConfig } from 'vitepress'
import UnocssPlugin from '@unocss/vite'
import solidPlugin from 'vite-plugin-solid'
import path from 'path'

export const shared = defineConfig({
  title: 'Antd-solid',
  description: 'UI 库',
  rewrites: {
    'zh/:rest*': ':rest*',
  },
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
  themeConfig: {
    logo: 'https://gw.alipayobjects.com/zos/rmsportal/rlpTLlbMzTNYuZGGCVYM.png',
    sidebar: {
      '/en/components/': {
        base: '/en/components/',
        items: [
          {
            text: '通用',
            items: [{ text: 'Button 按钮', link: 'button' }],
          },
          {
            text: '布局',
            items: [
              { text: 'Divider 分割线', link: 'divider' },
              { text: 'Compact 压缩', link: 'compact' },
            ],
          },
          {
            text: '导航',
            items: [
              { text: 'Dropdown 下拉菜单', link: 'dropdown' },
              { text: 'Menu 导航菜单', link: 'menu' },
              { text: 'ContextMenu 右键菜单', link: 'context-menu' },
            ],
          },
          {
            text: '数据录入',
            items: [
              { text: 'Checkbox 多选框', link: 'checkbox' },
              { text: 'CodeInput 验证码输入', link: 'code-input' },
              { text: 'ColorPicker 颜色选择器', link: 'color-picker' },
              { text: 'Input 输入框', link: 'input' },
              { text: 'InputNumber 数字输入框', link: 'input-number' },
              { text: 'Radio 单选框', link: 'radio' },
              { text: 'Form 表单', link: 'form' },
              { text: 'Select 选择器', link: 'select' },
              { text: 'RangeInput 范围输入框', link: 'range-input' },
              { text: 'Slider 滑动输入条', link: 'slider' },
              { text: 'Switch 开关', link: 'switch' },
              { text: 'Transformer 变形器', link: 'transformer' },
              { text: 'TreeSelect 树选择', link: 'tree-select' },
            ],
          },
          {
            text: '数据展示',
            items: [
              { text: 'Collapse 折叠面板', link: 'collapse' },
              { text: 'Empty 空状态', link: 'empty' },
              { text: 'Image 图片', link: 'image' },
              { text: 'Popover 气泡卡片', link: 'popover' },
              { text: 'Segmented 分段控制器', link: 'segmented' },
              { text: 'Table 表格', link: 'table' },
              { text: 'Tabs 标签页', link: 'tabs' },
              { text: 'Tooltip 文字提示', link: 'tooltip' },
              { text: 'Tree 树形控件', link: 'tree' },
            ],
          },
          {
            text: '反馈',
            items: [
              { text: 'Alert 警告提示', link: 'alert' },
              { text: 'Drawer 抽屉', link: 'drawer' },
              { text: 'Message 全局提示', link: 'message' },
              { text: 'Modal 对话框', link: 'modal' },
              { text: 'Popconfirm 气泡确认框', link: 'popconfirm' },
              { text: 'Progress 进度条', link: 'progress' },
              { text: 'Spin 加载中', link: 'spin' },
            ],
          },
          {
            text: '其他',
            items: [{ text: 'ConfigProvider 全局化配置', link: 'config-provider' }],
          },
          {
            text: 'hooks',
            items: [{ text: 'useVirtualList', link: 'use-virtual-list' }],
          },
        ],
      },
      '/components/': {
        base: '/components/',
        items: [
          {
            text: '通用',
            items: [{ text: 'Button 按钮', link: 'button' }],
          },
          {
            text: '布局',
            items: [
              { text: 'Divider 分割线', link: 'divider' },
              { text: 'Compact 压缩', link: 'compact' },
            ],
          },
          {
            text: '导航',
            items: [
              { text: 'Dropdown 下拉菜单', link: 'dropdown' },
              { text: 'Menu 导航菜单', link: 'menu' },
              { text: 'ContextMenu 右键菜单', link: 'context-menu' },
            ],
          },
          {
            text: '数据录入',
            items: [
              { text: 'Checkbox 多选框', link: 'checkbox' },
              { text: 'CodeInput 验证码输入', link: 'code-input' },
              { text: 'ColorPicker 颜色选择器', link: 'color-picker' },
              { text: 'Input 输入框', link: 'input' },
              { text: 'InputNumber 数字输入框', link: 'input-number' },
              { text: 'Radio 单选框', link: 'radio' },
              { text: 'Form 表单', link: 'form' },
              { text: 'Select 选择器', link: 'select' },
              { text: 'RangeInput 范围输入框', link: 'range-input' },
              { text: 'Slider 滑动输入条', link: 'slider' },
              { text: 'Switch 开关', link: 'switch' },
              { text: 'Transformer 变形器', link: 'transformer' },
              { text: 'TreeSelect 树选择', link: 'tree-select' },
            ],
          },
          {
            text: '数据展示',
            items: [
              { text: 'Collapse 折叠面板', link: 'collapse' },
              { text: 'Empty 空状态', link: 'empty' },
              { text: 'Image 图片', link: 'image' },
              { text: 'Popover 气泡卡片', link: 'popover' },
              { text: 'Segmented 分段控制器', link: 'segmented' },
              { text: 'Table 表格', link: 'table' },
              { text: 'Tabs 标签页', link: 'tabs' },
              { text: 'Tooltip 文字提示', link: 'tooltip' },
              { text: 'Tree 树形控件', link: 'tree' },
            ],
          },
          {
            text: '反馈',
            items: [
              { text: 'Alert 警告提示', link: 'alert' },
              { text: 'Drawer 抽屉', link: 'drawer' },
              { text: 'Message 全局提示', link: 'message' },
              { text: 'Modal 对话框', link: 'modal' },
              { text: 'Popconfirm 气泡确认框', link: 'popconfirm' },
              { text: 'Progress 进度条', link: 'progress' },
              { text: 'Spin 加载中', link: 'spin' },
            ],
          },
          {
            text: '其他',
            items: [{ text: 'ConfigProvider 全局化配置', link: 'config-provider' }],
          },
          {
            text: 'hooks',
            items: [{ text: 'useVirtualList', link: 'use-virtual-list' }],
          },
        ],
      },
    },
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
