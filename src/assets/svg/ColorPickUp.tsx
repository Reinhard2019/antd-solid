import { type Component } from 'solid-js'
import { type StyleProps } from '../../types'
import { commonStyle } from './common'

const ColorPickUpSvg: Component<StyleProps> = props => {
  return (
    <svg
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      class={props.class}
      style={{
        ...commonStyle,
        ...props.style,
      }}
    >
      <path d="M856.2176 347.904l-90.624 90.624 53.504 53.504a52.3264 52.3264 0 1 1-73.984 73.984l-71.5776-71.6288-444.928 444.9792a25.6 25.6 0 0 1-13.4656 7.0656l-133.1712 24.576a25.6 25.6 0 0 1-29.7984-29.7984l24.576-133.1712a25.6 25.6 0 0 1 7.0656-13.4656l444.928-444.9792-71.68-71.6288a52.3264 52.3264 0 0 1 73.984-73.984l53.504 53.504 90.624-90.624a128 128 0 0 1 181.0432 181.0432z m-291.328 37.888l-439.296 439.3472-16.384 88.7808 88.832-16.384 439.296-439.296-72.448-72.448z" />
    </svg>
  )
}

export default ColorPickUpSvg
