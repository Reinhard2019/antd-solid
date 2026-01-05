import { useContext, type Component } from 'solid-js'
import { clamp } from 'lodash-es'
import ColorPickerContext from './context'
import Color from './color'
import { setupGlobalDrag } from '../utils/setupGlobalDrag'

const ColorPickerSelect: Component = () => {
  let ref: HTMLDivElement | undefined
  const { color, setColor: _setColor, hsvColor } = useContext(ColorPickerContext)!

  const setColor = (e: MouseEvent, completed?: boolean) => {
    if (!ref) return

    const rect = ref.getBoundingClientRect()
    const offsetX = e.clientX - rect.x
    const offsetY = e.clientY - rect.y
    const { clientWidth, clientHeight } = ref
    const hsv = hsvColor().toHsv()
    hsv.s = clamp(offsetX / clientWidth, 0, 1)
    hsv.v = clamp(1 - offsetY / clientHeight, 0, 1)
    _setColor(new Color(hsv), completed)
  }

  return (
    <div
      ref={ref}
      class="h-160px rounded-[--ant-border-radius-sm]  cursor-pointer relative overflow-hidden"
      style={{
        'background-color': hsvColor().toHueRgbString(),
        'background-image':
          'linear-gradient(0deg, rgb(0, 0, 0), transparent), linear-gradient(90deg, rgb(255, 255, 255), rgba(255, 255, 255, 0))',
      }}
      onClick={e => {
        setColor(e, true)
      }}
    >
      <div
        class="absolute border-2px border-solid border-[--ant-color-bg-container] rounded-1/2 w-16px h-16px -translate-1/2"
        style={{
          left: `${color().toHsv().s * 100}%`,
          top: `${(1 - color().toHsv().v) * 100}%`,
          background: color().toRgbString(),
          'box-shadow':
            'inset 0 0 1px 0 var(--ant-color-text-quaternary), 0 0 0 1px var(--ant-color-fill-secondary)',
        }}
        onMouseDown={() => {
          let isDrag = false

          setupGlobalDrag(
            // eslint-disable-next-line solid/reactivity
            (e: MouseEvent) => {
              setColor(e)
              isDrag = true
            },
            // eslint-disable-next-line solid/reactivity
            () => {
              if (isDrag) _setColor(color(), true)
            },
          )
        }}
      />
    </div>
  )
}

export default ColorPickerSelect
