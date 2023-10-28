/* eslint-disable @typescript-eslint/promise-function-async */
import { defineConfig } from '@unocss/vite'
import { presetMini } from '@unocss/preset-mini'
import transformerVariantGroup from '@unocss/transformer-variant-group'
import presetIcons from '@unocss/preset-icons'

export default defineConfig({
  preflights: [
    {
      getCSS: () => `
        :root {
          --primary-color: #52c41a;
          --light-primary-color: #95de64;
          --dark-primary-color: #237804;
          --active-bg-color: #d9f7be;
          --hover-bg-color: rgba(0,0,0,.04);
        
          --error-color: #ff4d4f;
          --light-error-color: #ff7875;
          --dark-error-color: #d9363e;
        
          --error-bg-color: #fff2f0;
          --error-bg-hover-color: #fff1f0;
        
          --warning-color: #faad14;
          --color-warning-border-hover: #ffd666;
        
          --border-color: #d9d9d9;
          --secondary-border-color: #f0f0f0;
        
          --light-color: rgba(0, 0, 0, 0.45);
          --dark-color: rgba(0, 0, 0, 0.88);
        
        
          --color-text: rgba(0, 0, 0, 0.88);
          --color-text-secondary: rgba(0, 0, 0, 0.65);
          --color-text-tertiary: rgba(0, 0, 0, 0.45);
          --color-text-quaternary: rgba(0, 0, 0, 0.25);
        
          --light-bg-color: #fafafa;  
        
          font-size: 14px;
        }
      `
    }
  ],
  presets: [
    presetMini({
      prefix: 'ant-'
    }),
    presetIcons({
      collections: {
        'ant-design': () => import('@iconify-json/ant-design').then(i => i.icons),
      },
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
    }) as any,
  ],
  transformers: [transformerVariantGroup()],
  variants: [
    /**
     * not[.*]:
     */
    matcher => {
      const prevReg = /^not\[(.*)\]:/
      const match = matcher.match(prevReg)
      if (!match) return matcher
      return {
        matcher: matcher.slice(match[0].length),
        selector: s => `${s}:not(${match[1]})`,
      }
    },
    /**
     * where:
     */
    matcher => {
      const prev = 'where:'
      if (!matcher.startsWith(prev)) {
        return matcher
      }
      return {
        matcher: matcher.slice(prev.length),
        selector: s => `:where(${s})`,
      }
    },
    /**
     * 定义子级的样式
     * child[.*]:
     */
    matcher => {
      const prevReg = /^child\[(.*)\]:/
      const match = matcher.match(prevReg)
      if (!match) return matcher
      return {
        matcher: matcher.slice(match[0].length),
        selector: s => `${s} ${match[1] || '*'}`,
      }
    },
    /**
     * 父级 hover 的状态定义子级的样式
     * p-hover-child[.*]:
     */
    matcher => {
      const prevReg = /^p-hover-child\[(.*)\]:/
      const match = matcher.match(prevReg)
      if (!match) return matcher
      return {
        matcher: matcher.slice(match[0].length),
        selector: s => `${s}:hover ${match[1] || '*'}`,
      }
    },
  ],
  rules: [
    ['rm-size-btn', { padding: 0, border: 'none', height: 'auto' }],
    [
      /^keyframes-spin$/,
      () => {
        return `@keyframes spin {
          from {
              transform: rotate(0deg);
          }
          to {
              transform: rotate(360deg);
          }
        }`
      },
    ],
  ],
})
