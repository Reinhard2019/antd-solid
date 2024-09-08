import { Show, createMemo, createSignal, mergeProps, type Component, type JSX } from 'solid-js'
import cs from 'classnames'
import { inRange } from 'lodash-es'
import { Portal } from 'solid-js/web'
import NP from 'number-precision'
import createControllableValue from '../hooks/createControllableValue'
import RotateSvg from '../assets/svg/Rotate'
import ResizeSvg from '../assets/svg/Resize'
import Element from '../Element'
import { degToRad, getRotationAngleOfMatrix, radToDeg } from '../utils/math'

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
  /**
   * 移动位置时触发
   */
  onMove?: (value: Pick<TransformValue, 'x' | 'y'>) => void
  /**
   * 缩放时触发
   */
  onResize?: (value: Partial<Pick<TransformValue, 'x' | 'y' | 'width' | 'height'>>) => void
  /**
   * 旋转时触发
   */
  onRotate?: (value: Pick<TransformValue, 'rotate'>) => void
  /**
   * 转变结束时触发
   */
  onTransformEnd?: () => void
  /**
   * 吸附功能
   */
  adsorb?: {
    /**
     * 吸附容器宽度
     */
    width: number
    /**
     * 吸附容器高度
     */
    height: number
    /**
     * 吸附误差，鼠标位于吸附误差范围内时，吸附
     * 默认 5
     */
    gap?: number
  }
  /**
   * 对 resize、rotate icon 以及边框进行缩放
   * 通常用于在父元素放大或缩小时，要保证 Transformer 显示正常的情况
   */
  parentScale?: number
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
      parentScale: 1,
    } as const,
    _props,
  )
  const adsorbGap = createMemo(() =>
    props.adsorb ? (props.adsorb.gap ?? 5) * props.parentScale : 0,
  )
  const scaleVariables = createMemo(() => ({
    '--un-scale-x': props.parentScale,
    '--un-scale-y': props.parentScale,
    '--un-scale-z': props.parentScale,
  }))

  let containerRef: HTMLDivElement | undefined
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
    const parentElement = containerRef?.parentElement
    if (!parentElement) return 0

    const { transform } = getComputedStyle(parentElement)
    const m = new DOMMatrix(transform)
    return getRotationAngleOfMatrix(m)
  }

  // 将鼠标 x/y 方向的移动值转换为父元素 x/y 方向的移动值
  const rotateMove = (point: [number, number], _rotation: number) => {
    // 将超出[0, 360]范围的角度转换为[0, 360]
    const rotation =
      _rotation >= 0 ? _rotation % (Math.PI * 2) : Math.PI * 2 + (_rotation % (Math.PI * 2))

    let x = point[0]
    let y = point[1]
    if (rotation !== 0) {
      const clientYRatio =
        inRange(rotation, 0, Math.PI / 2) || inRange(rotation, Math.PI, Math.PI * 1.5) ? 1 : -1
      x = point[0] * Math.cos(rotation) + point[1] * Math.cos(rotation) * clientYRatio
      y = -point[0] * Math.sin(rotation) + point[1] * Math.sin(rotation) * clientYRatio
    }

    return [x, y]
  }

  interface AdsorbLine {
    left?: boolean
    right?: boolean
    top?: boolean
    bottom?: boolean
    centerX?: boolean
    centerY?: boolean
  }
  const [adsorbLine, setAdsorbLine] = createSignal<AdsorbLine>({})
  const onMoveMouseDown = (e: MouseEvent) => {
    const originUserSelect = document.body.style.userSelect
    document.body.style.userSelect = 'none'

    const parentRotation = getParentRotation()
    const [startClientX, startClientY] = rotateMove([e.clientX, e.clientY], parentRotation)
    const { x: startTranslateX, y: startTranslateY } = value()

    const onMouseMove = (_e: MouseEvent) => {
      const [clientX, clientY] = rotateMove([_e.clientX, _e.clientY], parentRotation)
      const offsetX = (clientX - startClientX) * props.parentScale
      const offsetY = (clientY - startClientY) * props.parentScale
      const changedValue = {
        x: startTranslateX + offsetX,
        y: startTranslateY + offsetY,
      }
      if (props.adsorb) {
        const _adsorbLine: AdsorbLine = {}

        const right = NP.minus(props.adsorb.width, value().width)
        const centerX = right / 2
        const bottom = NP.minus(props.adsorb.height, value().height)
        const centerY = bottom / 2
        if (inRange(changedValue.x, -adsorbGap(), adsorbGap())) {
          changedValue.x = 0
          _adsorbLine.left = true
        }
        if (inRange(changedValue.x, right - adsorbGap(), right + adsorbGap())) {
          changedValue.x = right
          _adsorbLine.right = true
        }
        if (inRange(changedValue.x, centerX - adsorbGap(), centerX + adsorbGap())) {
          changedValue.x = centerX
          _adsorbLine.centerX = true
        }
        if (inRange(changedValue.y, -adsorbGap(), adsorbGap())) {
          changedValue.y = 0
          _adsorbLine.top = true
        }
        if (inRange(changedValue.y, bottom - adsorbGap(), bottom + adsorbGap())) {
          changedValue.y = bottom
          _adsorbLine.bottom = true
        }
        if (inRange(changedValue.y, centerY - adsorbGap(), centerY + adsorbGap())) {
          changedValue.y = centerY
          _adsorbLine.centerY = true
        }
        setAdsorbLine(_adsorbLine)
      }
      setValue(v => ({
        ...v,
        ...changedValue,
      }))
      props.onMove?.(changedValue)
    }
    window.addEventListener('mousemove', onMouseMove)

    const onMouseUp = () => {
      document.body.style.userSelect = originUserSelect
      props.onTransformEnd?.()
      setAdsorbLine({})
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
    window.addEventListener('mouseup', onMouseUp)
  }

  let resizing = false
  const onResizeMouseDown = (e: MouseEvent, direction: ResizeDirection) => {
    e.stopPropagation()

    const originUserSelect = document.body.style.userSelect
    document.body.style.userSelect = 'none'
    const originCursor = document.body.style.cursor
    document.body.style.cursor = 'none'

    const rotation = getParentRotation() + degToRad(value().rotate)
    const onMouseMove = (_e: MouseEvent) => {
      const changedValue: Partial<TransformValue> = {}
      const [movementX, movementY] = rotateMove([_e.movementX, _e.movementY], rotation).map(
        v => v * props.parentScale,
      )
      let widthOffset = 0
      let xOffset = 0
      let heightOffset = 0
      let yOffset = 0
      if (
        direction === 'left' ||
        direction === 'right' ||
        direction === 'topLeft' ||
        direction === 'topRight' ||
        direction === 'bottomLeft' ||
        direction === 'bottomRight'
      ) {
        widthOffset =
          direction === 'right' || direction === 'topRight' || direction === 'bottomRight'
            ? movementX
            : -movementX
        widthOffset = Math.max(-value().width, widthOffset)
        xOffset =
          direction === 'left' || direction === 'topLeft' || direction === 'bottomLeft'
            ? widthOffset
            : 0
        changedValue.width = value().width + widthOffset
      }
      if (
        direction === 'top' ||
        direction === 'bottom' ||
        direction === 'topLeft' ||
        direction === 'topRight' ||
        direction === 'bottomLeft' ||
        direction === 'bottomRight'
      ) {
        heightOffset =
          direction === 'bottom' || direction === 'bottomLeft' || direction === 'bottomRight'
            ? movementY
            : -movementY
        heightOffset = Math.max(-value().height, heightOffset)
        yOffset =
          direction === 'top' || direction === 'topLeft' || direction === 'topRight'
            ? heightOffset
            : 0
        changedValue.height = value().height + heightOffset
      }

      let newPoint = new DOMPoint(value().x, value().y)
      if (value().rotate !== 0) {
        const centerX = value().x + value().width / 2
        const centerY = value().y + value().height / 2
        const rotateCenterMatrix = new DOMMatrix()
          .translateSelf(centerX, centerY)
          .rotateSelf(value().rotate)
          .translateSelf(-centerX, -centerY)
        const newCenterX = centerX + (widthOffset !== 0 ? movementX / 2 : 0)
        const newCenterY = centerY + (heightOffset !== 0 ? movementY / 2 : 0)
        const newCenter = new DOMPoint(newCenterX, newCenterY).matrixTransform(rotateCenterMatrix)
        const rotateNewCenterMatrix = new DOMMatrix()
          .translateSelf(newCenter.x, newCenter.y)
          .rotateSelf(value().rotate)
          .translateSelf(-newCenter.x, -newCenter.y)
          .invertSelf()
        newPoint = newPoint
          .matrixTransform(rotateCenterMatrix)
          .matrixTransform(rotateNewCenterMatrix)
      }
      changedValue.x = newPoint.x - xOffset
      changedValue.y = newPoint.y - yOffset

      setValue(v => ({
        ...v,
        ...changedValue,
      }))
      props.onResize?.(changedValue)

      updateResizeSvgPosition(_e)
    }
    window.addEventListener('mousemove', onMouseMove)

    resizing = true
    const onMouseUp = () => {
      resizing = false
      setResizeDirection(false)
      props.onTransformEnd?.()
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
      style: scaleVariables(),
    }
  }

  const onRotateMouseDown = (e: MouseEvent) => {
    e.stopPropagation()
    if (!containerRef) return

    const originUserSelect = document.body.style.userSelect
    document.body.style.userSelect = 'none'

    const { x, y, width, height } = containerRef.getBoundingClientRect()
    const centerX = x + width / 2
    const centerY = y + height / 2
    const parentRotation = getParentRotation()

    const onMouseMove = (_e: MouseEvent) => {
      const { clientX, clientY } = _e
      const rotate = radToDeg(Math.atan2(centerX - clientX, clientY - centerY) - parentRotation)
      setValue(v => ({
        ...v,
        rotate,
      }))
      props.onRotate?.({ rotate })
    }
    window.addEventListener('mousemove', onMouseMove)

    const onMouseUp = () => {
      document.body.style.userSelect = originUserSelect
      props.onTransformEnd?.()
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
    const rotationDeg = radToDeg(getParentRotation()) + value().rotate
    if (!_resizeDirection) return rotationDeg

    return (
      rotationDeg +
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

  return (
    <Element class="relative">
      <div
        ref={containerRef}
        class={cs('shadow-[var(--ant-transformer-box-shadow)] absolute')}
        style={{
          '--ant-transformer-box-shadow':
            '2px 2px 2px 0 rgba(0,0,0,.12),-2px -2px 2px 0 rgba(0,0,0,.12)',
          width: `${value().width}px`,
          height: `${value().height}px`,
          'transform-origin': `${value().x + value().width / 2}px ${value().y + value().height / 2}px`,
          transform: `rotate(${value().rotate}deg) translate(${value().x}px, ${value().y}px)`,
        }}
        onMouseDown={onMoveMouseDown}
      >
        {/* 边框 */}
        <div
          class="border-2px border-solid border-white absolute inset-0 box-content"
          style={{
            'border-width': `${1 * props.parentScale}px`,
          }}
        />

        <div
          class="cursor-none rounded-3px w-22px h-6px bg-white shadow-[var(--ant-transformer-box-shadow)] absolute top-0 left-1/2 -translate-1/2"
          {...getResizeHandlerProps('top')}
        />
        <div
          class="cursor-none rounded-3px w-22px h-6px bg-white shadow-[var(--ant-transformer-box-shadow)] absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
          {...getResizeHandlerProps('bottom')}
        />
        <div
          class="cursor-none rounded-3px w-6px h-22px bg-white shadow-[var(--ant-transformer-box-shadow)] absolute top-1/2 left-0 -translate-1/2"
          {...getResizeHandlerProps('left')}
        />
        <div
          class="cursor-none rounded-3px w-6px h-22px bg-white shadow-[var(--ant-transformer-box-shadow)] absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2"
          {...getResizeHandlerProps('right')}
        />

        <div
          class="cursor-none rounded-1/2 w-12px h-12px bg-white shadow-[var(--ant-transformer-box-shadow)] absolute top-0 left-0 -translate-1/2"
          {...getResizeHandlerProps('topLeft')}
        />
        <div
          class="cursor-none rounded-1/2 w-12px h-12px bg-white shadow-[var(--ant-transformer-box-shadow)] absolute top-0 right-0 translate-x-1/2 -translate-y-1/2"
          {...getResizeHandlerProps('topRight')}
        />
        <div
          class="cursor-none rounded-1/2 w-12px h-12px bg-white shadow-[var(--ant-transformer-box-shadow)] absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2"
          {...getResizeHandlerProps('bottomLeft')}
        />
        <div
          class="cursor-none rounded-1/2 w-12px h-12px bg-white shadow-[var(--ant-transformer-box-shadow)] absolute bottom-0 right-0 translate-1/2"
          {...getResizeHandlerProps('bottomRight')}
        />

        <div
          class="rounded-1/2 color-white absolute left-1/2 -translate-x-1/2 flex justify-center items-center cursor-pointer text-24px"
          onMouseDown={onRotateMouseDown}
          style={{
            ...scaleVariables(),
            bottom: `${-36 * props.parentScale}px`,
          }}
        >
          <RotateSvg />
        </div>

        <Show when={resizeDirection()}>
          <Portal>
            <ResizeSvg
              class="absolute pointer-events-none text-24px"
              style={{
                top: `${resizeSvgPosition().y}px`,
                left: `${resizeSvgPosition().x}px`,
                transform: `translate(-50%, -50%) rotate(${resizeRotate()}deg)`,
              }}
            />
          </Portal>
        </Show>
      </div>

      <Show when={adsorbLine()?.left}>
        <div
          class="absolute bg-[--ant-color-primary]"
          style={{
            width: `${2 * props.parentScale}px`,
            transform: 'translateX(-50%)',
            height: `${props.adsorb?.height ?? 0}px`,
          }}
        />
      </Show>
      <Show when={adsorbLine()?.right}>
        <div
          class="absolute -left-1px bg-[--ant-color-primary]"
          style={{
            width: `${2 * props.parentScale}px`,
            transform: `translateX(calc(${props.adsorb?.width ?? 0}px - 50%))`,
            height: `${props.adsorb?.height ?? 0}px`,
          }}
        />
      </Show>
      <Show when={adsorbLine()?.centerX}>
        <div
          class="absolute bg-[--ant-color-primary]"
          style={{
            width: `${2 * props.parentScale}px`,
            transform: `translateX(calc(${(props.adsorb?.width ?? 0) / 2}px - 50%))`,
            height: `${props.adsorb?.height ?? 0}px`,
          }}
        />
      </Show>
      <Show when={adsorbLine()?.top}>
        <div
          class="absolute bg-[--ant-color-primary]"
          style={{
            height: `${2 * props.parentScale}px`,
            transform: 'translateY(-50%)',
            width: `${props.adsorb?.width ?? 0}px`,
          }}
        />
      </Show>
      <Show when={adsorbLine()?.bottom}>
        <div
          class="absolute bg-[--ant-color-primary]"
          style={{
            height: `${2 * props.parentScale}px`,
            transform: `translateY(calc(${props.adsorb?.height ?? 0}px - 50%))`,
            width: `${props.adsorb?.width ?? 0}px`,
          }}
        />
      </Show>
      <Show when={adsorbLine()?.centerY}>
        <div
          class="absolute bg-[--ant-color-primary]"
          style={{
            height: `${2 * props.parentScale}px`,
            transform: `translateY(calc(${(props.adsorb?.height ?? 0) / 2}px - 50%))`,
            width: `${props.adsorb?.width ?? 0}px`,
          }}
        />
      </Show>
    </Element>
  )
}

export default Transformer
