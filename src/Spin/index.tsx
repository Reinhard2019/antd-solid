import { Show, type Component, type ParentProps, mergeProps, children } from 'solid-js'
import cs from 'classnames'
import Element from '../Element'
import { isEmptyJSXElement, unwrapStringOrJSXElement } from '../utils/solid'
import { type StringOrJSXElement, type StyleProps } from '../types'

interface SpinProps extends ParentProps, StyleProps {
  /**
   * 是否为加载中状态
   * 默认 true
   */
  spinning?: boolean
  /**
   * 组件大小，可选值为 small default large
   */
  size?: number
  /**
   * 当作为包裹元素时，可以自定义描述文案
   */
  tip?: StringOrJSXElement
}

const Spin: Component<SpinProps> = _props => {
  const props = mergeProps(
    {
      spinning: true,
      size: 20,
    },
    _props,
  )

  const resolvedChildren = children(() => props.children)
  const resolvedTip = children(() => unwrapStringOrJSXElement(props.tip))

  const spin = (
    <div class="inline-flex flex-col items-center gap-8px text-[var(--ant-color-primary)]">
      <span
        class="i-ant-design:loading keyframes-spin [animation:spin_1s_linear_infinite]"
        style={{ 'font-size': `${props.size}px` }}
      />
      <Show when={!isEmptyJSXElement(resolvedTip())}>{resolvedTip()}</Show>
    </div>
  )

  return (
    <Show
      when={!isEmptyJSXElement(resolvedChildren())}
      fallback={
        <Element class={cs(props.class, 'inline-block text-center')} style={props.style}>
          <Show when={props.spinning}>{spin}</Show>
        </Element>
      }
    >
      <Element class={cs(props.class, 'relative')} style={props.style}>
        <div>{resolvedChildren()}</div>
        <Show when={props.spinning}>
          <div class="absolute inset-0 flex items-center justify-center bg-[var(--ant-color-bg-container)] opacity-40">
            {spin}
          </div>
        </Show>
      </Element>
    </Show>
  )
}

export default Spin
