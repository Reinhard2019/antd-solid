import { type Component } from 'solid-js'
import SimpleEmptySvg from './assets/SimpleEmptySvg'

const PRESENTED_IMAGE_SIMPLE: Component = () => {
  return (
    <div class='ant-my-[var(--ant-margin-xl)] ant-mx-[var(--ant-margin-xs)]'>
      <div class="ant-mb-[var(--ant-margin-xs)] ant-flex ant-justify-center">
        <SimpleEmptySvg />
      </div>
      <div class="ant-text-[var(--ant-color-text-disabled)] ant-text-center">暂无数据</div>
    </div>
  )
}

export default PRESENTED_IMAGE_SIMPLE
