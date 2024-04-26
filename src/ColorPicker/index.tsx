import { ColorPicker } from 'antd'
import { type Color } from 'antd/es/color-picker'
import { reactToSolidComponent } from '../utils/component'

export interface ColorPickerProps {
  defaultValue?: string | Color | null
  value?: string | Color | null
  onChange?: (value: Color, hex: string) => void
  allowClear?: boolean
}

export default reactToSolidComponent(ColorPicker, undefined, {
  defaultValue: 'black',
})
