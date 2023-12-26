import { type Component } from 'solid-js'
import emptySvg from './assets/empty.svg?raw'

const Empty: Component = () => {
  return (
    <div>
      {/* eslint-disable-next-line solid/no-innerhtml */}
      <div class='ant-mb-[var(--ant-margin-xs)] ant-flex ant-justify-center' innerHTML={emptySvg} />
      <div class='ant-text-[var(--ant-color-text)] ant-text-center'>暂无数据</div>
    </div>
  )
}

export default Empty
