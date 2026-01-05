import { type Accessor, createContext, type Setter } from 'solid-js'
import type Color from './color'

interface ColorPickerContextProps {
  color: Accessor<Color>
  setColor: (color: Color, completed?: boolean) => void
  disabledAlpha: Accessor<boolean>
  h: Accessor<number>
  setH: Setter<number>
  hsvColor: Accessor<Color>
}

const ColorPickerContext = createContext<ColorPickerContextProps>()

export default ColorPickerContext
