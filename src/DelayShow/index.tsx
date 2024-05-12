/**
 * 延迟创建组件
 * 只有当 props.when 为 true 时才创建组件
 */
import {
  type Component,
  type JSXElement,
  Show,
  untrack,
  createSignal,
  createRenderEffect,
} from 'solid-js'

export interface DelayShowProps {
  when?: boolean
  /**
   * 延迟显示的时间
   * 单位 ms
   */
  time?: number
  children: JSXElement
}

const DelayShow: Component<DelayShowProps> = props => {
  // 是否显示过一次
  const [showed, setShowed] = createSignal(untrack(() => props.when ?? false))
  createRenderEffect(() => {
    if (typeof props.time === 'number') {
      setTimeout(() => {
        setShowed(true)
      }, props.time)
    }
  })
  return <Show when={showed() || props.when}>{props.children}</Show>
}

export default DelayShow
