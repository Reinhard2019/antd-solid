import { type Component } from 'solid-js'
import cs from 'classnames'
import SimpleEmptySvg from './assets/SimpleEmptySvg'
import Element from '../Element'
import { type EmptyProps } from '.'

const PRESENTED_IMAGE_SIMPLE: Component<EmptyProps> = props => {
  return (
    <Element
      class={cs('my-[var(--ant-margin-xl)] mx-[var(--ant-margin-xs)]', props.class)}
      style={props.style}
    >
      <div class="mb-[var(--ant-margin-xs)] flex justify-center">
        <SimpleEmptySvg />
      </div>
      <div class="text-[var(--ant-color-text-description)] text-center">
        {props.description ?? '暂无数据'}
      </div>
    </Element>
  )
}

export default PRESENTED_IMAGE_SIMPLE
