import { defineConfig } from '@unocss/vite'
import { presetMini } from '@unocss/preset-mini'
import transformerVariantGroup from '@unocss/transformer-variant-group'
import presetIcons from '@unocss/preset-icons'

export default defineConfig({
  shortcuts: [
    {
      ellipsis: 'text-ellipsis overflow-hidden [white-space:nowrap]',
    },
  ],
  presets: [
    presetMini(),
    presetIcons({
      collections: {
        'ant-design': async () => await import('@iconify-json/ant-design').then(i => i.icons),
      },
      extraProperties: {
        display: 'inline-block',
        'vertical-align': '-0.125em',
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
     * child[.*]>?:
     */
    matcher => {
      const prevReg = /^child\[(.*)\](>?):/
      const match = matcher.match(prevReg)
      if (!match) return matcher
      return {
        matcher: matcher.slice(match[0].length),
        selector: s => `${s}${match[2] ? '>' : ' '}${match[1] || '*'}`,
      }
    },
    /**
     * 父级 hover 的状态定义子级的样式
     * p:hover-child[.*]:
     */
    matcher => {
      const prevReg = /^p:hover-child\[(.*)\]:/
      const match = matcher.match(prevReg)
      if (!match) return matcher
      return {
        matcher: matcher.slice(match[0].length),
        selector: s => `${s}:hover ${match[1] || '*'}`,
      }
    },
    /**
     * 有父级 class 的时候才会生效
     * p[.*]:
     */
    matcher => {
      const prevReg = /^p\[(.*)\]:/
      const match = matcher.match(prevReg)
      if (!match) return matcher
      return {
        matcher: matcher.slice(match[0].length),
        selector: s => `${match[1] || '*'} ${s}`,
      }
    },
  ],
  rules: [
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
    [
      /^keyframes-wave$/,
      () => {
        return `@keyframes wave {
          from {
            border-width: 0px;
            inset: 0px;
            opacity: 0.4;
          }
          to {
            border-width: 6px;
            inset: -6px;
            opacity: 0.1;
          }
        }`
      },
    ],
  ],
})
