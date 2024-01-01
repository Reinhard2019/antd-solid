import { type Component, type JSX } from 'solid-js'
import PRESENTED_IMAGE_SIMPLE from './PRESENTED_IMAGE_SIMPLE'
import EmptySvg from './assets/EmptySvg'

export interface EmptyProps {
  class?: string
  style?: JSX.CSSProperties
}

const Empty: Component<EmptyProps> & {
  PRESENTED_IMAGE_SIMPLE: Component
} = props => {
  return (
    <div {...props} style={props.style}>
      <div class="mb-[var(--ant-margin-xs)] flex justify-center">
        <EmptySvg />
      </div>
      <div class="text-[var(--ant-color-text)] text-center">暂无数据</div>
    </div>
  )
}

Empty.PRESENTED_IMAGE_SIMPLE = PRESENTED_IMAGE_SIMPLE

export default Empty
