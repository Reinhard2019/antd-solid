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
      <div class="ant-mb-[var(--ant-margin-xs)] ant-flex ant-justify-center">
        <EmptySvg />
      </div>
      <div class="ant-text-[var(--ant-color-text)] ant-text-center">暂无数据</div>
    </div>
  )
}

Empty.PRESENTED_IMAGE_SIMPLE = PRESENTED_IMAGE_SIMPLE

export default Empty
