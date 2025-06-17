import { type JSX, type Component } from 'solid-js'
import { commonStyle } from './common'
import { type StyleProps } from '../../types'

const CrosshairSvg: Component<
StyleProps &
Pick<JSX.SvgSVGAttributes<SVGSVGElement>, 'ref'> & {
  innerColor: string
  outerColor: string
}
> = props => {
  return (
    <svg
      viewBox="0 0 26 26"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      ref={props.ref}
      class={props.class}
      style={{
        ...commonStyle,
        ...props.style,
      }}
    >
      <line x1="50%" x2="50%" y2="100%" stroke-width="3" stroke={props.outerColor} />
      <line x1="50%" x2="50%" y2="100%" stroke-width="1" stroke={props.innerColor} />
      <line x1="100%" y1="50%" y2="50%" stroke-width="3" stroke={props.outerColor} />
      <line x1="100%" y1="50%" y2="50%" stroke-width="1" stroke={props.innerColor} />
      <circle cx="50%" cy="50%" r="32.7%" fill="none" stroke-width="3" stroke={props.outerColor} />
      <circle cx="50%" cy="50%" r="32.7%" fill="none" stroke-width="1" stroke={props.innerColor} />
      {/* <circle cx="50%" cy="50%" r="13.5%" fill="none" stroke-width="2" stroke="white" />
      <circle cx="50%" cy="50%" r="13.5%" /> */}
    </svg>
  )
}

export default CrosshairSvg
