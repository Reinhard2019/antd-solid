import { type Component } from 'solid-js'
import PRESENTED_IMAGE_SIMPLE from './PRESENTED_IMAGE_SIMPLE'
import EmptySvg from './assets/EmptySvg'

const Empty: Component & {
  PRESENTED_IMAGE_SIMPLE: Component
} = () => {
  return (
    <div>
      <div class='ant-mb-[var(--ant-margin-xs)] ant-flex ant-justify-center'>
        <EmptySvg />
      </div>
      <div class='ant-text-[var(--ant-color-text)] ant-text-center'>暂无数据</div>
    </div>
  )
}

Empty.PRESENTED_IMAGE_SIMPLE = PRESENTED_IMAGE_SIMPLE

export default Empty
