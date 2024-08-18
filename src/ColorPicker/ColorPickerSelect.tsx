import { createMemo, useContext, type Component } from 'solid-js'
import ColorPickerContext from './context'
import Color from './color'

const ColorPickerSelect: Component = () => {
  const context = useContext(ColorPickerContext)
  const color = createMemo(() => context?.color() ?? new Color())

  return (
    <div
      class="h-160px rounded-[--ant-border-radius-sm]  cursor-pointer relative overflow-hidden"
      style={{
        'background-color': color().toHueRgbString(),
        'background-image':
          'linear-gradient(0deg, rgb(0, 0, 0), transparent), linear-gradient(90deg, rgb(255, 255, 255), rgba(255, 255, 255, 0))',
      }}
      onClick={e => {
        const { offsetX, offsetY } = e
        const { clientWidth, clientHeight } = e.currentTarget
        const hsv = color().toHsv()
        hsv.s = offsetX / clientWidth
        hsv.v = 1 - offsetY / clientHeight
        context?.setColor(new Color(hsv))
      }}
    >
      <div
        class="absolute border-2px border-solid border-[--ant-color-bg-container] rounded-1/2 w-16px h-16px -translate-1/2 pointer-events-none"
        style={{
          left: `${color().toHsv().s * 100}%`,
          top: `${(1 - color().toHsv().v) * 100}%`,
          background: color().toRgbString(),
          'box-shadow':
            'inset 0 0 1px 0 var(--ant-color-text-quaternary), 0 0 0 1px var(--ant-color-fill-secondary)',
        }}
      />
    </div>
  )
}

export default ColorPickerSelect
