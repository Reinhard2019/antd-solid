import { type Component } from 'solid-js'
import cs from 'classnames'
import createControllableValue from '../hooks/createControllableValue'
import RotateSvg from '../assets/svg/Rotate'
import { distance } from './utils'

export interface TransformValue {
  width: number
  height: number
  rotate: number
}

export interface TransformerProps {
  defaultValue?: TransformValue
  value?: TransformValue
  onChange?: (value: TransformValue) => void
}

const Transformer: Component<TransformerProps> = props => {
  let container: HTMLDivElement | undefined
  const [value, setValue] = createControllableValue<TransformValue>(props, {
    defaultValue: {
      width: 100,
      height: 100,
      rotate: 0,
    },
  })

  /**
   * 监听 resize
   * @param e
   * @param propertyName 指定哪个属性会被修改，为空时代表 width 和 height 同时会被修改
   * @returns
   */
  const onResizeMouseDown = (e: MouseEvent, propertyName?: 'width' | 'height') => {
    if (!container) return

    const { x, y, width, height } = container.getBoundingClientRect()
    const centerX = x + width / 2
    const centerY = y + height / 2

    const startDistance = distance([centerX, centerY], [e.clientX, e.clientY])
    const startWidth = value().width
    const startHeight = value().height

    const onMouseMove = (_e: MouseEvent) => {
      const currentDistance = distance([centerX, centerY], [_e.clientX, _e.clientY])
      const widthChange = !propertyName || propertyName === 'width'
      const heightChange = !propertyName || propertyName === 'height'
      setValue(v => ({
        ...v,
        width: widthChange ? (startWidth * currentDistance) / startDistance : v.width,
        height: heightChange ? (startHeight * currentDistance) / startDistance : v.height,
      }))
    }
    window.addEventListener('mousemove', onMouseMove)

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
    window.addEventListener('mouseup', onMouseUp)
  }

  const onRotateMouseDown = () => {
    if (!container) return

    const { x, y, width, height } = container.getBoundingClientRect()
    const centerX = x + width / 2
    const centerY = y + height / 2

    const onMouseMove = (_e: MouseEvent) => {
      const { clientX, clientY } = _e
      const rotate = (Math.atan2(centerX - clientX, clientY - centerY) * 180) / Math.PI
      setValue(v => ({
        ...v,
        rotate,
      }))
    }
    window.addEventListener('mousemove', onMouseMove)

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
    window.addEventListener('mouseup', onMouseUp)
  }

  return (
    <div
      ref={container}
      class={cs('border-solid border-1px border-white p-8px relative box-content')}
      style={{
        width: `${value().width}px`,
        height: `${value().height}px`,
        transform: `rotate(${value().rotate}deg)`,
      }}
    >
      <div
        class="cursor-nwse-resize rounded-1/2 w-12px h-12px bg-white absolute top-0 left-0 -translate-1/2"
        onMouseDown={onResizeMouseDown}
      />
      <div
        class="cursor-nesw-resize rounded-1/2 w-12px h-12px bg-white absolute top-0 right-0 translate-x-1/2 -translate-y-1/2"
        onMouseDown={onResizeMouseDown}
      />
      <div
        class="cursor-nesw-resize rounded-1/2 w-12px h-12px bg-white absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2"
        onMouseDown={onResizeMouseDown}
      />
      <div
        class="cursor-nwse-resize rounded-1/2 w-12px h-12px bg-white absolute bottom-0 right-0 translate-1/2"
        onMouseDown={onResizeMouseDown}
      />

      <div
        class="cursor-ns-resize rounded-3px w-22px h-6px bg-white absolute top-0 left-1/2 -translate-1/2"
        onMouseDown={e => {
          onResizeMouseDown(e, 'height')
        }}
      />
      <div
        class="cursor-ns-resize rounded-3px w-22px h-6px bg-white absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
        onMouseDown={e => {
          onResizeMouseDown(e, 'height')
        }}
      />
      <div
        class="cursor-ew-resize rounded-3px w-6px h-22px bg-white absolute top-1/2 left-0 -translate-1/2"
        onMouseDown={e => {
          onResizeMouseDown(e, 'width')
        }}
      />
      <div
        class="cursor-ew-resize rounded-3px w-6px h-22px bg-white absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2"
        onMouseDown={e => {
          onResizeMouseDown(e, 'width')
        }}
      />

      <div
        class="rounded-1/2 color-white absolute left-1/2 -translate-x-1/2 -bottom-36px flex justify-center items-center cursor-pointer"
        onMouseDown={onRotateMouseDown}
      >
        <RotateSvg style={{ width: '24px', height: '24px' }} />
      </div>
    </div>
  )
}

export default Transformer
