import { type Component } from 'solid-js'
import cs from 'classnames'
import { type RootStyleProps, type StyleProps } from '../types'

export interface ImageProps extends RootStyleProps, StyleProps {
  width?: string | number
  height?: string | number
  src?: string
  fallback?: string
}

const Image: Component<ImageProps> = props => {
  return (
    <div
      class={cs(props.rootClass, 'inline-block')}
      style={{
        width: typeof props.width === 'string' ? props.width : undefined,
        height: typeof props.height === 'string' ? props.height : undefined,
        ...props.rootStyle,
      }}
    >
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
