import { mergeProps, type Component } from 'solid-js'
import cs from 'classnames'
import createControllableValue from '../hooks/createControllableValue'
import RotateSvg from '../assets/svg/Rotate'
import Element from '../Element'

export interface TransformValue {
  x: number
  y: number
  width: number
  height: number
  rotate: number
}

export interface TransformerProps {
  defaultValue?: TransformValue
  value?: TransformValue
  onChange?: (value: TransformValue) => void
}

const Transformer: Component<TransformerProps> = _props => {
  const props = mergeProps(
    {
      transformOrigin: ['center', 'center'],
    },
    _props,
  )

  let container: HTMLDivElement | undefined
  const [value, setValue] = createControllableValue<TransformValue>(props, {
    defaultValue: {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      rotate: 0,
    },
  })

  const onMoveMouseDown = () => {
    const originUserSelect = document.body.style.userSelect
    document.body.style.userSelect = 'none'

    const onMouseMove = (_e: MouseEvent) => {
      setValue(v => ({
        ...v,
        x: v.x + _e.movementX,
        y: v.y + _e.movementY,
      }))
    }
    window.addEventListener('mousemove', onMouseMove)

    const onMouseUp = () => {
      document.body.style.userSelect = originUserSelect
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
    window.addEventListener('mouseup', onMouseUp)
  }

  /**
   * 监听 resize
   * @param e
   * @param propertyName 指定哪个属性会被修改，为空时代表 width 和 height 同时会被修改
   * @returns
   */
  const onResizeMouseDown = (
    e: MouseEvent,
    direction:
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'topLeft'
    | 'topRight'
    | 'bottomLeft'
    | 'bottomRight',
  ) => {
    e.stopPropagation()

    const originUserSelect = document.body.style.userSelect
    document.body.style.userSelect = 'none'

    const onMouseMove = (_e: MouseEvent) => {
      setValue(v => {
        const newV = { ...v }
        if (
          direction === 'left' ||
          direction === 'right' ||
          direction === 'topLeft' ||
          direction === 'topRight' ||
          direction === 'bottomLeft' ||
          direction === 'bottomRight'
        ) {
          const movementX =
            direction === 'right' || direction === 'topRight' || direction === 'bottomRight'
              ? _e.movementX
              : -_e.movementX
          newV.x =
            newV.x -
            (direction === 'left' || direction === 'topLeft' || direction === 'bottomLeft'
              ? movementX
              : 0)
          newV.width = newV.width + movementX
        }
        if (
          direction === 'top' ||
          direction === 'bottom' ||
          direction === 'topLeft' ||
          direction === 'topRight' ||
          direction === 'bottomLeft' ||
          direction === 'bottomRight'
        ) {
          const movementY =
            direction === 'bottom' || direction === 'bottomLeft' || direction === 'bottomRight'
              ? _e.movementY
              : -_e.movementY
          newV.y =
            newV.y -
            (direction === 'top' || direction === 'topLeft' || direction === 'topRight'
              ? movementY
              : 0)
          newV.height = newV.height + movementY
        }
        return newV
      })
    }
    window.addEventListener('mousemove', onMouseMove)

    const onMouseUp = () => {
      document.body.style.userSelect = originUserSelect
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
    window.addEventListener('mouseup', onMouseUp)
  }

  const onRotateMouseDown = (e: MouseEvent) => {
    e.stopPropagation()
    if (!container) return

    const { x, y, width, height } = container.getBoundingClientRect()
    const centerX = x + width / 2
    const centerY = y + height / 2

    const originUserSelect = document.body.style.userSelect
    document.body.style.userSelect = 'none'

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
      document.body.style.userSelect = originUserSelect
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
    window.addEventListener('mouseup', onMouseUp)
  }

  const borderWidth = 1

  return (
    <Element
      ref={container}
      class={cs('border-solid border-white relative box-content')}
      style={{
        width: `${value().width}px`,
        height: `${value().height}px`,
        'border-width': `${borderWidth}px`,
        'transform-origin': `${value().x + value().width / 2}px ${value().y + value().height / 2}px`,
        transform: `rotate(${value().rotate}deg) translate(${value().x - borderWidth}px, ${value().y - borderWidth}px)`,
      }}
      onMouseDown={onMoveMouseDown}
    >
      <div
        class="cursor-nwse-resize rounded-1/2 w-12px h-12px bg-white absolute top-0 left-0 -translate-1/2"
        onMouseDown={e => {
          onResizeMouseDown(e, 'topLeft')
        }}
      />
      <div
        class="cursor-nesw-resize rounded-1/2 w-12px h-12px bg-white absolute top-0 right-0 translate-x-1/2 -translate-y-1/2"
        onMouseDown={e => {
          onResizeMouseDown(e, 'topRight')
        }}
      />
      <div
        class="cursor-nesw-resize rounded-1/2 w-12px h-12px bg-white absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2"
        onMouseDown={e => {
          onResizeMouseDown(e, 'bottomLeft')
        }}
      />
      <div
        class="cursor-nwse-resize rounded-1/2 w-12px h-12px bg-white absolute bottom-0 right-0 translate-1/2"
        onMouseDown={e => {
          onResizeMouseDown(e, 'bottomRight')
        }}
      />

      <div
        class="cursor-ns-resize rounded-3px w-22px h-6px bg-white absolute top-0 left-1/2 -translate-1/2"
        onMouseDown={e => {
          onResizeMouseDown(e, 'top')
        }}
      />
      <div
        class="cursor-ns-resize rounded-3px w-22px h-6px bg-white absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
        onMouseDown={e => {
          onResizeMouseDown(e, 'bottom')
        }}
      />
      <div
        class="cursor-ew-resize rounded-3px w-6px h-22px bg-white absolute top-1/2 left-0 -translate-1/2"
        onMouseDown={e => {
          onResizeMouseDown(e, 'left')
        }}
      />
      <div
        class="cursor-ew-resize rounded-3px w-6px h-22px bg-white absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2"
        onMouseDown={e => {
          onResizeMouseDown(e, 'right')
        }}
      />

      <div
        class="rounded-1/2 color-white absolute left-1/2 -translate-x-1/2 -bottom-36px flex justify-center items-center cursor-pointer"
        onMouseDown={onRotateMouseDown}
      >
        <RotateSvg style={{ width: '24px', height: '24px' }} />
      </div>
    </Element>
  )
}

export default Transformer
