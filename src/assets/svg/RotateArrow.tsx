import { type Component } from 'solid-js'
import { type StyleProps } from '../../types'
import { commonStyle } from './common'

const RotateArrowSvg: Component<StyleProps> = props => {
  const startX = 100
  const startY = 700
  const arrowWidth = 300
  const halfArrowWidth = arrowWidth / 2
  const arrowLength = arrowWidth * 0.7
  const curveWidth = arrowWidth * 0.3
  const halfCurveWidth = curveWidth / 2
  return (
    <svg
      viewBox="0 0 1000 1000"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      style={{
        ...commonStyle,
        ...props.style,
      }}
    >
      <path
        fill="black"
        stroke-width={50}
        stroke="white"
        d={`M ${startX},${startY} l ${arrowLength},${-halfArrowWidth} v ${halfArrowWidth - halfCurveWidth} Q ${startY},${startY} ${startY - halfCurveWidth},${startX + arrowLength} h ${halfCurveWidth - halfArrowWidth} L ${startY},${startX} l ${halfArrowWidth},${arrowLength} h ${halfCurveWidth - halfArrowWidth} Q ${startY + halfCurveWidth},${startY + halfCurveWidth} ${startX + arrowLength},${startY + halfCurveWidth} v ${halfArrowWidth - halfCurveWidth} L ${startX},${startY}`}
      />
    </svg>
  )
}

export default RotateArrowSvg
