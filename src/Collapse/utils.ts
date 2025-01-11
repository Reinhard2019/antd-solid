import cs from 'classnames'
import { type CollapseItemProps } from './Item'

export function getElementClass(type: CollapseItemProps['type']) {
  return cs(
    '[font-size:var(--ant-font-size)] text-[var(--ant-color-text)] leading-[var(--ant-line-height)]',
    type === 'card' &&
      'rounded-[var(--ant-border-radius-lg)] overflow-hidden [border:1px_solid_var(--ant-color-border)]',
  )
}

export function getElementCssVariables(
  type: CollapseItemProps['type'],
  size: Exclude<CollapseItemProps['size'], undefined>,
) {
  return {
    '--ant-collapse-header-padding': {
      small: 'var(--ant-padding-xs) var(--ant-padding-sm)',
      middle: 'var(--ant-padding-sm) var(--ant-padding)',
      large: 'var(--ant-padding) var(--ant-padding-lg)',
    }[size],
    '--ant-collapse-content-padding':
      type === 'line'
        ? {
          small: 'var(--ant-padding-sm) 0 0 0',
          middle: 'var(--ant-padding) 0 0 0',
          large: 'var(--ant-padding-lg) 0 0 0',
        }[size]
        : {
          small: 'var(--ant-padding-sm)',
          middle: 'var(--ant-padding)',
          large: 'var(--ant-padding-lg)',
        }[size],
    '--ant-collapse-divider-margin': {
      small: 'var(--ant-margin-sm) 0',
      middle: 'var(--ant-margin) 0',
      large: 'var(--ant-margin-lg) 0',
    }[size],
  }
}
