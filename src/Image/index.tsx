import { type Component } from 'solid-js'
import cs from 'classnames'
import { type StyleProps } from '../types'

export interface ImageProps extends StyleProps {
  width?: number
  height?: number
  src?: string
  fallback?: string
}

const Image: Component<ImageProps> = props => {
  return (
    <div class={cs('inline-block')}>
      <img
        {...props}
        src={props.src ? props.src : props.fallback}
        onError={e => {
          if (props.fallback) {
            e.currentTarget.src = props.fallback
          }
        }}
      />
    </div>
  )
}

export default Image
