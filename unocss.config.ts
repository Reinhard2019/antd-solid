/* eslint-disable @typescript-eslint/promise-function-async */
import { defineConfig } from '@unocss/vite'
import { presetMini } from '@unocss/preset-mini'
import transformerVariantGroup from '@unocss/transformer-variant-group'
import presetIcons from '@unocss/preset-icons'

export default defineConfig({
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
