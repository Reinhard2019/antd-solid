import { mergeProps, type ParentProps, type JSX } from 'solid-js'
import cs from 'classnames'

interface CompactProps extends ParentProps {
  class?: string
  style?: JSX.CSSProperties
  /**
   * 指定排列方向
   * 默认 'horizontal'
   */
  direction?: 'horizontal' | 'vertical'
}

function Compact(_props: CompactProps) {
  const props = mergeProps(
    {
      direction: 'horizontal',
    } as CompactProps,
    _props,
  )
  return (
    <div
      class={cs('ant-compact', `ant-compact-${props.direction}`, 'inline-flex', props.class)}
      style={props.style}
    >
      {props.children}
    </div>
  )
}

Compact.compactItemClass = 'p[.ant-compact]:ml--1px p[.ant-compact]:first:ml-0'
Compact.compactItemRounded0Class = 'p[.ant-compact]:rounded-0'
Compact.compactItemRoundedLeftClass = 'p[.ant-compact>:first-child]:rounded-l-6px'
Compact.compactItemRoundedRightClass = 'p[.ant-compact>:last-child]:rounded-r-6px'
Compact.compactItemZIndexClass =
  'p[.ant-compact]:hover:z-10 p[.ant-compact]:focus:z-10 p[.ant-compact]:focus-within:z-10'

export default Compact
