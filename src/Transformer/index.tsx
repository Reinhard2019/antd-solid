import { Show, createMemo, createSignal, mergeProps, type Component, type JSX } from 'solid-js'
import cs from 'classnames'
import { inRange } from 'lodash-es'
import { Portal } from 'solid-js/web'
import NP from 'number-precision'
import createControllableValue from '../hooks/createControllableValue'
import RotateSvg from '../assets/svg/Rotate'
import ResizeSvg from '../assets/svg/Resize'
import Element from '../Element'
import { degToRad, getRotationRadOfMatrix, radToDeg } from '../utils/math'
import { type StyleProps } from '../types'

export interface TransformValue {
  x: number
  y: number
  width: number
  height: number
  rotate: number
  /** 为空时，默认为 [50%, 50%] */
  transformOrigin?: [x: number, y: number]
}

export interface TransformerProps extends StyleProps {
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
  // parentScale?: number
  /**
   * 单位：deg
   */
  skewX?: number
  /**
   * 单位：deg
   */
  skewY?: number
  /**
   * 单位：px
   * 默认为 ['50%', '50%']
   */
  transformOrigin?:
  | [x: number | `${number}%`, y: number | `${number}%`]
  | ((width: number, height: number) => [x: number, y: number])
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
      skewX: 0,
      skewY: 0,
    } as const,
    _props,
  )
  const adsorbGap = createMemo(() => (props.adsorb ? props.adsorb.gap ?? 5 : 0))

  let containerRef: HTMLDivElement | undefined
  const [_value, setValue] = createControllableValue<TransformValue | undefined>(props)
  const value = createMemo(
    () =>
      _value() ?? {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        rotate: 0,
      },
  )
  const parseTransformOrigin = (width: number, height: number) => {
    if (typeof props.transformOrigin === 'function') {
      return props.transformOrigin(width, height)
    }
    const [x, y] = props.transformOrigin ?? ['50%', '50%']
    return [
      typeof x === 'string' ? (width * parseFloat(x)) / 100 : x,
      typeof y === 'string' ? (height * parseFloat(y)) / 100 : y,
    ]
  }
  const transformOrigin = createMemo(() => parseTransformOrigin(value().width, value().height))
  const skewMatrix = createMemo(
    () =>
      new DOMMatrix([1, Math.tan(degToRad(props.skewY)), Math.tan(degToRad(props.skewX)), 1, 0, 0]),
  )

  // 获取父元素旋转角度
  const getParentRotationRad = () => {
    const parentElement = containerRef?.parentElement
    if (!parentElement) return 0

    const { transform } = getComputedStyle(parentElement)
    const m = new DOMMatrix(transform)
    return getRotationRadOfMatrix(m)
  }

  // 将鼠标 x/y 方向的移动值转换为父元素 x/y 方向的移动值
  const rotateMove = (point: [number, number], _radians: number) => {
    // 将超出[0, 360]范围的角度转换为[0, 360]
    const radians =
      _radians >= 0 ? _radians % (Math.PI * 2) : Math.PI * 2 + (_radians % (Math.PI * 2))

    if (radians === 0) return point

    // 计算旋转后的新坐标
    const x = Math.cos(radians) * -point[0] - Math.sin(radians) * -point[1]
    const y = Math.sin(radians) * -point[0] + Math.cos(radians) * -point[1]

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

    const parentRotation = getParentRotationRad()
    const [startClientX, startClientY] = rotateMove([e.clientX, e.clientY], parentRotation)
    const { x: startTranslateX, y: startTranslateY } = value()

    const onMouseMove = (_e: MouseEvent) => {
      const [clientX, clientY] = rotateMove([_e.clientX, _e.clientY], parentRotation)
      const offsetX = clientX - startClientX
      const offsetY = clientY - startClientY
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
      setValue({
        ...value(),
        ...changedValue,
      })
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

    const rotation = getParentRotationRad() + degToRad(value().rotate)
    const onMouseMove = (_e: MouseEvent) => {
      const changedValue: Partial<TransformValue> = {}
      const [movementX, movementY] = rotateMove([_e.movementX, _e.movementY], rotation)

      let xOffset = 0
      let yOffset = 0
      if (
        direction === 'left' ||
        direction === 'right' ||
        direction === 'topLeft' ||
        direction === 'topRight' ||
        direction === 'bottomLeft' ||
        direction === 'bottomRight'
      ) {
        let widthOffset =
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
        let heightOffset =
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

      const _transformOrigin = transformOrigin()
      const transformMatrix = new DOMMatrix()
        .translateSelf(_transformOrigin[0], _transformOrigin[1])
        .rotateSelf(value().rotate)
        .multiplySelf(skewMatrix())
        .translateSelf(-_transformOrigin[0], -_transformOrigin[1])

      const newTransformOrigin = parseTransformOrigin(
        changedValue.width ?? value().width,
        changedValue.height ?? value().height,
      )
      const newTransformOriginPoint = new DOMPoint(
        newTransformOrigin[0] - xOffset,
        newTransformOrigin[1] - yOffset,
      ).matrixTransform(transformMatrix)
      const newTransformMatrix = new DOMMatrix()
        .translateSelf(newTransformOriginPoint.x, newTransformOriginPoint.y)
        .rotateSelf(value().rotate)
        .multiplySelf(skewMatrix())
        .translateSelf(-newTransformOriginPoint.x, -newTransformOriginPoint.y)
        .translateSelf(xOffset, yOffset)
        .invertSelf()

      const offsetPoint = new DOMPoint()
        .matrixTransform(transformMatrix)
        .matrixTransform(newTransformMatrix)
      changedValue.x = value().x + offsetPoint.x
      changedValue.y = value().y + offsetPoint.y

      setValue({
        ...value(),
        ...changedValue,
      })
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
    const parentRotation = getParentRotationRad()

    const onMouseMove = (_e: MouseEvent) => {
      const { clientX, clientY } = _e
      const rotate = radToDeg(Math.atan2(centerX - clientX, clientY - centerY) - parentRotation)
      setValue({
        ...value(),
        rotate,
      })
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
    const rotationDeg = radToDeg(getParentRotationRad()) + value().rotate
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

  const skewedMatrix = createMemo(() =>
    new DOMMatrix()
      .translateSelf(...transformOrigin())
      .multiplySelf(skewMatrix())
      .translateSelf(-transformOrigin()[0], -transformOrigin()[1]),
  )
  const topLeftPoint = createMemo(() => new DOMPoint(0, 0).matrixTransform(skewedMatrix()))
  const topRightPoint = createMemo(() =>
    new DOMPoint(value().width, 0).matrixTransform(skewedMatrix()),
  )
  const bottomLeftPoint = createMemo(() =>
    new DOMPoint(0, value().height).matrixTransform(skewedMatrix()),
  )
  const bottomRightPoint = createMemo(() =>
    new DOMPoint(value().width, value().height).matrixTransform(skewedMatrix()),
  )
  const topPoint = createMemo(() =>
    new DOMPoint(value().width / 2, 0).matrixTransform(skewedMatrix()),
  )
  const bottomPoint = createMemo(() =>
    new DOMPoint(value().width / 2, value().height).matrixTransform(skewedMatrix()),
  )
  const leftPoint = createMemo(() =>
    new DOMPoint(0, value().height / 2).matrixTransform(skewedMatrix()),
  )
  const rightPoint = createMemo(() =>
    new DOMPoint(value().width, value().height / 2).matrixTransform(skewedMatrix()),
  )

  return (
    <Element class="relative">
      <div
        ref={containerRef}
        class={cs(props.class, 'absolute')}
        style={{
          '--ant-transformer-box-shadow':
            '2px 2px 2px 0 rgba(0,0,0,.12),-2px -2px 2px 0 rgba(0,0,0,.12)',
          width: `${value().width}px`,
          height: `${value().height}px`,
          transform: `translate(${value().x}px, ${value().y}px) rotate(${value().rotate}deg)`,
          'transform-origin': `${transformOrigin()[0]}px ${transformOrigin()[1]}px`,
        }}
        onMouseDown={onMoveMouseDown}
      >
        {/* 边框 */}
        <div
          class="border-1px border-solid border-white absolute inset-0 box-content shadow-[var(--ant-transformer-box-shadow)]"
          style={{
            transform: `skew(${props.skewX}deg, ${props.skewY}deg)`,
            'transform-origin': 'inherit',
            ...props.style,
          }}
        />

        <div
          class="cursor-none rounded-3px w-22px h-6px bg-white shadow-[var(--ant-transformer-box-shadow)] absolute"
          {...getResizeHandlerProps('top')}
          style={{
            transform: `translate(-50%, -50%) rotate(${props.skewY}deg)`,
            top: `${topPoint().y}px`,
            left: `${topPoint().x}px`,
          }}
        />
        <div
          class="cursor-none rounded-3px w-22px h-6px bg-white shadow-[var(--ant-transformer-box-shadow)] absolute"
          {...getResizeHandlerProps('bottom')}
          style={{
            transform: `translate(-50%, -50%) rotate(${props.skewY}deg)`,
            top: `${bottomPoint().y}px`,
            left: `${bottomPoint().x}px`,
          }}
        />
        <div
          class="cursor-none rounded-3px w-6px h-22px bg-white shadow-[var(--ant-transformer-box-shadow)] absolute"
          {...getResizeHandlerProps('left')}
          style={{
            transform: `translate(-50%, -50%) rotate(-${props.skewX}deg)`,
            top: `${leftPoint().y}px`,
            left: `${leftPoint().x}px`,
          }}
        />
        <div
          class="cursor-none rounded-3px w-6px h-22px bg-white shadow-[var(--ant-transformer-box-shadow)] absolute"
          {...getResizeHandlerProps('right')}
          style={{
            transform: `translate(-50%, -50%) rotate(-${props.skewX}deg)`,
            top: `${rightPoint().y}px`,
            left: `${rightPoint().x}px`,
          }}
        />

        <div
          class="cursor-none rounded-1/2 w-12px h-12px bg-white shadow-[var(--ant-transformer-box-shadow)] absolute -translate-1/2"
          {...getResizeHandlerProps('topLeft')}
          style={{
            top: `${topLeftPoint().y}px`,
            left: `${topLeftPoint().x}px`,
          }}
        />
        <div
          class="cursor-none rounded-1/2 w-12px h-12px bg-white shadow-[var(--ant-transformer-box-shadow)] absolute -translate-1/2"
          {...getResizeHandlerProps('topRight')}
          style={{
            top: `${topRightPoint().y}px`,
            left: `${topRightPoint().x}px`,
          }}
        />
        <div
          class="cursor-none rounded-1/2 w-12px h-12px bg-white shadow-[var(--ant-transformer-box-shadow)] absolute -translate-1/2"
          {...getResizeHandlerProps('bottomLeft')}
          style={{
            top: `${bottomLeftPoint().y}px`,
            left: `${bottomLeftPoint().x}px`,
          }}
        />
        <div
          class="cursor-none rounded-1/2 w-12px h-12px bg-white shadow-[var(--ant-transformer-box-shadow)] absolute -translate-1/2"
          {...getResizeHandlerProps('bottomRight')}
          style={{
            top: `${bottomRightPoint().y}px`,
            left: `${bottomRightPoint().x}px`,
          }}
        />

        <div
          class="rounded-1/2 color-white absolute left-1/2 -bottom-36px -translate-x-1/2 flex justify-center items-center cursor-pointer text-24px"
          onMouseDown={onRotateMouseDown}
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
            width: '1px',
            transform: 'translateX(-50%)',
            height: `${props.adsorb?.height ?? 0}px`,
          }}
        />
      </Show>
      <Show when={adsorbLine()?.right}>
        <div
          class="absolute -left-1px bg-[--ant-color-primary]"
          style={{
            width: '1px',
            transform: `translateX(calc(${props.adsorb?.width ?? 0}px - 50%))`,
            height: `${props.adsorb?.height ?? 0}px`,
          }}
        />
      </Show>
      <Show when={adsorbLine()?.centerX}>
        <div
          class="absolute bg-[--ant-color-primary]"
          style={{
            width: '1px',
            transform: `translateX(calc(${(props.adsorb?.width ?? 0) / 2}px - 50%))`,
            height: `${props.adsorb?.height ?? 0}px`,
          }}
        />
      </Show>
      <Show when={adsorbLine()?.top}>
        <div
          class="absolute bg-[--ant-color-primary]"
          style={{
            height: '1px',
            transform: 'translateY(-50%)',
            width: `${props.adsorb?.width ?? 0}px`,
          }}
        />
      </Show>
      <Show when={adsorbLine()?.bottom}>
        <div
          class="absolute bg-[--ant-color-primary]"
          style={{
            height: '1px',
            transform: `translateY(calc(${props.adsorb?.height ?? 0}px - 50%))`,
            width: `${props.adsorb?.width ?? 0}px`,
          }}
        />
      </Show>
      <Show when={adsorbLine()?.centerY}>
        <div
          class="absolute bg-[--ant-color-primary]"
          style={{
            height: '1px',
            transform: `translateY(calc(${(props.adsorb?.height ?? 0) / 2}px - 50%))`,
            width: `${props.adsorb?.width ?? 0}px`,
          }}
        />
      </Show>
    </Element>
  )
}

export default Transformer
