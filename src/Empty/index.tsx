import { type Component } from 'solid-js'
import PRESENTED_IMAGE_SIMPLE from './PRESENTED_IMAGE_SIMPLE'
import emptySvg from './assets/empty.svg?raw'

const Empty: Component & {
  PRESENTED_IMAGE_SIMPLE: Component
} = () => {
  return (
    <div>
      {/* eslint-disable-next-line solid/no-innerhtml */}
      <div class='ant-mb-[var(--ant-margin-xs)] ant-flex ant-justify-center' innerHTML={emptySvg} />
      <div class='ant-text-[var(--ant-color-text)] ant-text-center'>暂无数据</div>
    </div>
  )
}

Empty.PRESENTED_IMAGE_SIMPLE = PRESENTED_IMAGE_SIMPLE

export default Empty
