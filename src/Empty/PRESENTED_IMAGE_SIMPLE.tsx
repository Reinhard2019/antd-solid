import { type Component } from 'solid-js'
import emptySvg from './assets/simple-empty.svg?raw'

const PRESENTED_IMAGE_SIMPLE: Component = () => {
  return (
    <div class='ant-my-[var(--ant-margin-xl)] ant-mx-[var(--ant-margin-xs)]'>
      {/* eslint-disable-next-line solid/no-innerhtml */}
      <div class="ant-mb-[var(--ant-margin-xs)] ant-flex ant-justify-center" innerHTML={emptySvg} />
      <div class="ant-text-[var(--ant-color-text-disabled)] ant-text-center">暂无数据</div>
    </div>
  )
}

export default PRESENTED_IMAGE_SIMPLE
