/**
 * 延迟创建组件
 * 只有当 props.when 为 true 时才创建组件
 */
import { type Component, type JSXElement, Show, untrack, createEffect } from 'solid-js'

export interface DelayShowProps {
  when?: boolean
  children: JSXElement
}

const DelayShow: Component<DelayShowProps> = props => {
  // 是否显示过一次
  let showed = untrack(() => props.when ?? false)
  createEffect(() => {
    if (props.when) {
      showed = true
    }
  })
  return <Show when={showed || props.when}>{props.children}</Show>
}

export default DelayShow
