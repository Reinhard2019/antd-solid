import { type JSXElement, type Component, type JSX } from 'solid-js'
import PRESENTED_IMAGE_SIMPLE from './PRESENTED_IMAGE_SIMPLE'
import EmptySvg from './assets/EmptySvg'
import Element from '../Element'

export interface EmptyProps {
  description?: JSXElement
  class?: string
  style?: JSX.CSSProperties
}

const Empty: Component<EmptyProps> & {
  PRESENTED_IMAGE_SIMPLE: typeof PRESENTED_IMAGE_SIMPLE
} = props => {
  return (
    <Element class={props.class} style={props.style}>
      <div class="mb-[var(--ant-margin-xs)] flex justify-center">
        <EmptySvg />
      </div>
      <div class="text-[var(--ant-color-text)] text-center">{props.description ?? '暂无数据'}</div>
    </Element>
  )
}

Empty.PRESENTED_IMAGE_SIMPLE = PRESENTED_IMAGE_SIMPLE

export default Empty
