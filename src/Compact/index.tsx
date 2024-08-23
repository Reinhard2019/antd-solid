import { mergeProps, type JSX, type ParentProps } from 'solid-js'
import cs from 'classnames'
import Element from '../Element'

interface CompactProps extends ParentProps {
  block?: boolean
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
    <Element
      class={cs(
        'ant-compact',
        `ant-compact-${props.direction}`,
        props.block ? 'flex w-full' : 'inline-flex',
        props.class,
        // Compact 会出现嵌套的情况
        [
          Compact.compactItemClass,
          '[--ant-compact-rounded-l:6px] p[.ant-compact]:not-first:[--ant-compact-rounded-l:0]',
          '[--ant-compact-rounded-r:6px] p[.ant-compact]:not-last:[--ant-compact-rounded-r:0]',
        ],
      )}
      style={props.style}
    >
      {props.children}
    </Element>
  )
}

Compact.compactItemClass = cs(
  'p[.ant-compact]:ml--1px p[.ant-compact]:first:ml-0 p[.ant-compact]:hover:z-10 p[.ant-compact]:focus:z-10 p[.ant-compact]:focus-within:z-10',
  'p[.ant-compact]:rounded-0',
  'p[.ant-compact]:first:rounded-l-[--ant-compact-rounded-l]',
  'p[.ant-compact]:last:rounded-r-[--ant-compact-rounded-r]',
)

export default Compact
