import { mergeProps, type JSX, type ParentProps } from 'solid-js'
import cs from 'classnames'
import Element from '../Element'
import './index.scss'

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
      )}
      style={props.style}
    >
      {props.children}
    </Element>
  )
}

export default Compact
