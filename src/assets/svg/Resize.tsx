import { type Component } from 'solid-js'
import cs from 'classnames'
import { type StyleProps } from '../../types'
import { commonStyle } from './common'

const Resize: Component<StyleProps> = props => {
  return (
    <svg
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      class={cs('text-24px', props.class)}
      style={{
        ...commonStyle,
        ...props.style,
      }}
    >
      <path
        fill="black"
        stroke="white"
        stroke-width="50"
        d="M531.2 179.2l130.133333 140.8c4.266667 4.266667 6.4 10.666667 6.4 14.933333-2.133333 4.266667-6.4 6.4-14.933333 6.4h-85.333333v341.333334h85.333333c8.533333 0 12.8 2.133333 14.933333 6.4 2.133333 4.266667 0 8.533333-6.4 14.933333l-130.133333 140.8c-4.266667 6.4-12.8 8.533333-19.2 8.533333s-14.933333-2.133333-19.2-8.533333l-130.133333-140.8c-4.266667-4.266667-6.4-10.666667-6.4-14.933333 2.133333-4.266667 6.4-6.4 14.933333-6.4h85.333333v-341.333334h-85.333333c-8.533333 0-12.8-2.133333-14.933333-6.4-2.133333-4.266667 0-8.533333 6.4-14.933333l130.133333-140.8c4.266667-6.4 12.8-8.533333 19.2-8.533333s14.933333 2.133333 19.2 8.533333z"
      />
    </svg>
  )
}

export default Resize
