import { Show, createMemo, createSignal, mergeProps, type Component, type JSX } from 'solid-js'
import cs from 'classnames'
import { inRange } from 'lodash-es'
import { Portal } from 'solid-js/web'
import createControllableValue from '../hooks/createControllableValue'
import RotateSvg from '../assets/svg/Rotate'
import ResizeSvg from '../assets/svg/Resize'
import Element from '../Element'
import { getRotationAngleOfMatrix, radToDeg } from '../utils/math'

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

type ResizeDirection =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight'

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

  // 获取父元素旋转角度
  const getParentRotation = () => {
    const parentElement = container?.parentElement
    if (!parentElement) return 0

    const { transform } = getComputedStyle(parentElement)
    const m = new DOMMatrix(transform)
    return getRotationAngleOfMatrix(m)
  }

  // 将鼠标 x/y 方向的移动值转换为父元素 x/y 方向的移动值
  const rotateMove = (e: MouseEvent, _parentRotation: number) => {
    // 将超出[0, 360]范围的角度转换为[0, 360]
    const parentRotation =
      _parentRotation >= 0
        ? _parentRotation % (Math.PI * 2)
        : Math.PI * 2 + (_parentRotation % (Math.PI * 2))

    let movementX = e.movementX
    let movementY = e.movementY
    if (parentRotation !== 0) {
      const movementYRatio =
        inRange(parentRotation, 0, Math.PI / 2) || inRange(parentRotation, Math.PI, Math.PI * 1.5)
          ? 1
          : -1
      movementX =
        e.movementX * Math.cos(parentRotation) +
        e.movementY * Math.cos(parentRotation) * movementYRatio
      movementY =
        -e.movementX * Math.sin(parentRotation) +
        e.movementY * Math.sin(parentRotation) * movementYRatio
    }

    return {
      movementX,
      movementY,
    }
  }

  const onMoveMouseDown = () => {
    const originUserSelect = document.body.style.userSelect
    document.body.style.userSelect = 'none'

    const parentRotation = getParentRotation()
    const onMouseMove = (e: MouseEvent) => {
      const { movementX, movementY } = rotateMove(e, parentRotation)
      setValue(v => ({
        ...v,
        x: v.x + movementX,
        y: v.y + movementY,
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

  let resizing = false
  /**
   * 监听 resize
   * @param e
   * @param propertyName 指定哪个属性会被修改，为空时代表 width 和 height 同时会被修改
   * @returns
   */
  const onResizeMouseDown = (e: MouseEvent, direction: ResizeDirection) => {
    e.stopPropagation()

    const originUserSelect = document.body.style.userSelect
    document.body.style.userSelect = 'none'
    const originCursor = document.body.style.cursor
    document.body.style.cursor = 'none'

    const parentRotation = getParentRotation()
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
          const { movementX: _movementX } = rotateMove(_e, parentRotation)
          const movementX =
            direction === 'right' || direction === 'topRight' || direction === 'bottomRight'
              ? _movementX
              : -_movementX
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
          const { movementY: _movementY } = rotateMove(_e, parentRotation)
          const movementY =
            direction === 'bottom' || direction === 'bottomLeft' || direction === 'bottomRight'
              ? _movementY
              : -_movementY
          newV.y =
            newV.y -
            (direction === 'top' || direction === 'topLeft' || direction === 'topRight'
              ? movementY
              : 0)
          newV.height = newV.height + movementY
        }
        return newV
      })

      updateResizeSvgPosition(_e)
    }
    window.addEventListener('mousemove', onMouseMove)

    resizing = true
    const onMouseUp = () => {
      resizing = false
      setResizeDirection(false)

      document.body.style.userSelect = originUserSelect
      document.body.style.cursor = originCursor
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
    window.addEventListener('mouseup', onMouseUp)
  }
  const getResizeHandlerProps = (
    direction: ResizeDirection,
  ): JSX.HTMLAttributes<HTMLDivElement> => {
    return {
      onMouseDown: e => {
        onResizeMouseDown(e, direction)
      },
      onMouseEnter: e => {
        if (resizing) return
        setResizeDirection(direction)
        updateResizeSvgPosition(e)
      },
      onMouseMove: e => {
        if (resizing) return
        updateResizeSvgPosition(e)
      },
      onMouseLeave: () => {
        if (resizing) return
        setResizeDirection(false)
      },
    }
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
      const rotate = radToDeg(
        Math.atan2(centerX - clientX, clientY - centerY) - getParentRotation(),
      )
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

  const [resizeDirection, setResizeDirection] = createSignal<ResizeDirection | false>(false)
  const [resizeSvgPosition, setResizeSvgPosition] = createSignal({
    x: 0,
    y: 0,
  })
  const updateResizeSvgPosition = (e: MouseEvent) => {
    setResizeSvgPosition({
      x: e.pageX,
      y: e.pageY,
    })
  }
  const resizeRotate = createMemo(() => {
    const _resizeDirection = resizeDirection()
    const parentRotationDeg = radToDeg(getParentRotation())
    if (!_resizeDirection) return parentRotationDeg

    return (
      parentRotationDeg +
      {
        top: 0,
        bottom: 0,
        left: 90,
        right: 90,
        topLeft: 90 + 45,
        topRight: 180 + 45,
        bottomLeft: 180 + 45,
        bottomRight: 90 + 45,
      }[_resizeDirection]
    )
  })

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
        class="cursor-none rounded-1/2 w-12px h-12px bg-white absolute top-0 left-0 -translate-1/2"
        {...getResizeHandlerProps('topLeft')}
      />
      <div
        class="cursor-none rounded-1/2 w-12px h-12px bg-white absolute top-0 right-0 translate-x-1/2 -translate-y-1/2"
        {...getResizeHandlerProps('topRight')}
      />
      <div
        class="cursor-none rounded-1/2 w-12px h-12px bg-white absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2"
        {...getResizeHandlerProps('bottomLeft')}
      />
      <div
        class="cursor-none rounded-1/2 w-12px h-12px bg-white absolute bottom-0 right-0 translate-1/2"
        {...getResizeHandlerProps('bottomRight')}
      />

      <div
        class="cursor-none rounded-3px w-22px h-6px bg-white absolute top-0 left-1/2 -translate-1/2"
        {...getResizeHandlerProps('top')}
      />
      <div
        class="cursor-none rounded-3px w-22px h-6px bg-white absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
        {...getResizeHandlerProps('bottom')}
      />
      <div
        class="cursor-none rounded-3px w-6px h-22px bg-white absolute top-1/2 left-0 -translate-1/2"
        {...getResizeHandlerProps('left')}
      />
      <div
        class="cursor-none rounded-3px w-6px h-22px bg-white absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2"
        {...getResizeHandlerProps('right')}
      />

      <div
        class="rounded-1/2 color-white absolute left-1/2 -translate-x-1/2 -bottom-36px flex justify-center items-center cursor-pointer text-24px"
        onMouseDown={onRotateMouseDown}
      >
        <RotateSvg />
      </div>

      <Show when={resizeDirection()}>
        <Portal>
          <ResizeSvg
            class="absolute pointer-events-none"
            style={{
              top: `${resizeSvgPosition().y}px`,
              left: `${resizeSvgPosition().x}px`,
              transform: `translate(-50%, -50%) rotate(${resizeRotate()}deg)`,
            }}
          />
        </Portal>
      </Show>
    </Element>
  )
}

export default Transformer
