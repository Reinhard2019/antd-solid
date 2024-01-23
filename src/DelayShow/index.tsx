/**
 * 延迟创建组件
 * 只有当 props.when 为 true 时才创建组件
 */
import { type Component, type JSXElement, Show, onMount, untrack } from 'solid-js'

export interface DelayShowProps {
  when?: boolean
  children: JSXElement
}

const DelayShow: Component<DelayShowProps> = props => {
  let init = untrack(() => props.when ?? false)
  onMount(() => {
    init = true
  })
  return <Show when={init || props.when}>{props.children}</Show>
}

export default DelayShow
