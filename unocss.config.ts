import { defineConfig } from '@unocss/vite'
import { presetMini } from '@unocss/preset-mini'
import transformerVariantGroup from '@unocss/transformer-variant-group'
import presetIcons from '@unocss/preset-icons'

export default defineConfig({
  preflights: [
    {
      getCSS: () => `
        :root {
          --ant-hover-bg-color: rgba(0,0,0,.04);
        
          --ant-light-error-color: #ff7875;
          --ant-dark-error-color: #d9363e;
        
          --ant-error-bg-color: #fff2f0;
          --ant-error-bg-hover-color: #fff1f0;
        
          --ant-warning-color: #faad14;
          --ant-color-warning-border-hover: #ffd666;
        
          --ant-secondary-border-color: #f0f0f0;
        
          --ant-light-color: rgba(0, 0, 0, 0.45);
          --ant-dark-color: rgba(0, 0, 0, 0.88);
        
          --ant-color-text-secondary: rgba(0, 0, 0, 0.65);
          --ant-color-text-tertiary: rgba(0, 0, 0, 0.45);
          --ant-color-text-quaternary: rgba(0, 0, 0, 0.25);
        
          --ant-light-bg-color: #fafafa;

          --ant-color-primary-active: #0958d9;
          --ant-color-primary: #1677ff;
          --ant-color-primary-hover: #4096ff;
          --ant-color-primary-border: #95de64;
          --ant-color-error: #ff4d4f;
          --ant-color-success: #52c41a;
          --ant-color-text: rgba(0, 0, 0, 0.88);
          --ant-color-text-disabled: rgba(0, 0, 0, 0.25);
          --ant-color-text-heading: rgba(0, 0, 0, 0.88);
          --ant-color-border: #d9d9d9;
          --ant-color-bg-container-disabled: rgba(0, 0, 0, 0.04);
          --ant-color-bg-layout: #f5f5f5;
          --ant-color-split: rgba(5, 5, 5, 0.06);
          --ant-color-icon: rgba(0, 0, 0, 0.45);
          --ant-color-icon-hover: rgba(0, 0, 0, 0.88);

          --ant-font-weight-strong: 600;

          --ant-font-size-lg: 16px;

          --ant-line-height-lg: 1.5;

          --ant-line-width: 1px;

          --ant-margin-xs: 8px;
          --ant-margin-sm: 12px;
          --ant-margin-xl: 32px;

          --ant-padding-sm: 12px;
          --ant-padding: 16px;
          --ant-padding-lg: 24px;

          --ant-box-shadow-tertiary: 0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02);

          --ant-border-radius-sm: 4px;
          --ant-border-radius: 6px;
          --ant-border-radius-lg: 8px;

          --ant-collapse-header-bg: rgba(0, 0, 0, 0.02);
          --ant-collapse-header-padding: 12px 16px;

          --ant-select-option-selected-bg: #e6f4ff;
          
          --ant-tree-node-selected-bg: #e6f4ff;
        
          font-size: 14px;
        }
      `,
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
      /^keyframes-(.*)(\[.*\])(\[.*\])$/,
      match => {
        return `@keyframes ${match[1]} {
          from {
            ${match[2].slice(1, -1)};
          }
          to {
            ${match[3].slice(1, -1)};
          }
        }`
      },
    ],
  ],
})
