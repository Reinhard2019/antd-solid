import { type Accessor, createContext } from 'solid-js'
import type Color from './color'

interface ColorPickerContextProps {
  color: Accessor<Color>
  setColor: (color: Color, completed?: boolean) => void
  disabledAlpha: Accessor<boolean>
}

const ColorPickerContext = createContext<ColorPickerContextProps>()

export default ColorPickerContext
