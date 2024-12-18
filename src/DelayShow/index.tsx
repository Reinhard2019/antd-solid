/**
 * 延迟创建组件
 * 只有当 props.when 第一次为 true 时才初始化组件
 */
import {
  type Component,
  type JSXElement,
  Show,
  untrack,
  createSignal,
  createRenderEffect,
  on,
} from 'solid-js'

export interface DelayShowProps {
  when?: boolean
  /**
   * 延迟显示的时间，只在第一次显示时有效
   * 单位 ms
   */
  time?: number
  children: JSXElement
}

const DelayShow: Component<DelayShowProps> = props => {
  // 是否显示过一次
  const [showed, setShowed] = createSignal(untrack(() => props.when ?? false))
  createRenderEffect(
    on(
      () => props.when,
      () => {
        if (!props.when && !showed()) return

        if (typeof props.time === 'number') {
          setTimeout(() => {
            setShowed(true)
          }, props.time)
        } else {
          setShowed(true)
        }
      },
    ),
  )
  return <Show when={showed() || props.when}>{props.children}</Show>
}

export default DelayShow
