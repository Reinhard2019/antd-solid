import { type Component, mergeProps, untrack } from 'solid-js'
import { type ColorResult, SketchPicker, type Color, type RGBColor, type HSLColor } from 'react-color'
import { reactToSolidComponent } from './utils/component'
import Button from './Button'
import Popover from './Popover'
import { get, isNil } from 'lodash-es'
import createControllableValue from './hooks/createControllableValue'

const _SketchPicker = reactToSolidComponent(SketchPicker)

export interface ColorPickerProps {
  /**
   * 默认: rgba
   */
  type?: 'rgba' | 'hsla'
  defaultColor?: string
  color?: string
  onChange?: (colorString: string, color: ColorResult) => void
}

function isRGBColor(color: Color): color is RGBColor {
  return ['r', 'g', 'b'].every(k => !isNil(get(color, k)))
}

function isHSLColor(color: Color): color is HSLColor {
  return ['r', 'g', 'b'].every(k => !isNil(get(color, k)))
}

function colorStringify(color: Color | undefined) {
  if (!color) return

  if (isRGBColor(color)) return `rgba(${color.r},${color.g},${color.b},${color.a ?? 1})`

  if (isHSLColor(color)) return `hsla(${color.h},${color.s},${color.l},${color.a ?? 1})`

  return color
}

const ColorPicker: Component<ColorPickerProps> = _props => {
  const props = mergeProps({ type: 'rgba' } as ColorPickerProps, _props)
  const [color, setColor] = createControllableValue(props, {
    defaultValuePropName: 'defaultColor',
    valuePropName: 'color',
  })

  return (
    <Popover
      content={
        <_SketchPicker
          color={color()}
          onChange={colorResult =>
          { untrack(() => {
            const colorString = colorStringify(
              props.type === 'rgba' ? colorResult.rgb : colorResult.hsl,
            )!
            setColor(colorString)

            props.onChange?.(colorString, colorResult)
          }); }
          }
        />
      }
      trigger="click"
      placement="bottomLeft"
    >
      <Button style={{ background: color() }} />
    </Popover>
  )
}

export default ColorPicker
