import { type Component } from 'solid-js'
import SimpleEmptySvg from './assets/SimpleEmptySvg'
import Element from '../Element'

const PRESENTED_IMAGE_SIMPLE: Component = () => {
  return (
    <Element class="my-[var(--ant-margin-xl)] mx-[var(--ant-margin-xs)]">
      <div class="mb-[var(--ant-margin-xs)] flex justify-center">
        <SimpleEmptySvg />
      </div>
      <div class="text-[var(--ant-color-text-description)] text-center">暂无数据</div>
    </Element>
  )
}

export default PRESENTED_IMAGE_SIMPLE
