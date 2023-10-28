import { ColorPicker } from 'antd'
import { type Color } from 'antd/es/color-picker'
import { reactToSolidComponent } from './utils/component'

export interface ColorPickerProps {
  defaultValue?: string | Color
  value?: string | Color
  onChange?: (value: Color, hex: string) => void
}

export default reactToSolidComponent(ColorPicker)
