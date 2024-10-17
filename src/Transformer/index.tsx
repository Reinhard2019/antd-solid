import { Show, createMemo, createSignal, mergeProps, type Component, type JSX } from 'solid-js'
import cs from 'classnames'
import { inRange } from 'lodash-es'
import { Portal } from 'solid-js/web'
import NP from 'number-precision'
import createControllableValue from '../hooks/createControllableValue'
import ResizeSvg from '../assets/svg/Resize'
import Element from '../Element'
import { createSkewDOMMatrix, distance, radToDeg } from '../utils/math'
import RotateArrowSvg from '../assets/svg/RotateArrow'
import CrosshairSvg from '../assets/svg/Crosshair'

export interface TransformValue {
  x: number
  y: number
  width: number
  height: number
  rotate: number
  /** 为空时，默认为 [50%, 50%] */
  transformOrigin?: [x: number, y: number]
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
   * 单位：deg
   */
  skewX?: number
  /**
   * 单位：deg
   */
  skewY?: number
  /**
   * 单位：deg
   */
  scaleX?: number
  /**
   * 单位：deg
   */
  scaleY?: number
  /**
   * 单位：px
   * 默认为 ['50%', '50%']
   */
  transformOrigin?:
  | [x: number | `${number}%`, y: number | `${number}%`]
  | ((width: number, height: number) => [x: number, y: number])
  /**
   * 当父元素存在 transform 时，需要将父元素的 transform 传入，保证 Transformer 显示正常
   */
  parentTransform?: DOMMatrix
  /**
   * 是否显示 transformOriginIcon
   */
  transformOriginIcon?: boolean
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
      scaleX: 1,
      scaleY: 1,
    } as const,
    _props,
  )
  const adsorbGap = createMemo(() => (props.adsorb ? props.adsorb.gap ?? 5 : 0))

  let containerRef: HTMLDivElement | undefined
  let transformOriginRef: SVGSVGElement | undefined
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
  const parseTransformOrigin = (width: number, height: number): [number, number] => {
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
  const skewMatrix = createMemo(() => createSkewDOMMatrix(props.skewX, props.skewY))
  const transformMatrix = createMemo(() =>
    new DOMMatrix().rotate(value().rotate).scale(props.scaleX, props.scaleY).multiply(skewMatrix()),
  )
  // 围绕转换远点进行转换后的 Matrix
  const transformOriginMatrix = createMemo(() =>
    new DOMMatrix()
      .translate(...transformOrigin())
      .multiply(transformMatrix())
      .translate(-transformOrigin()[0], -transformOrigin()[1]),
  )
  const parentTransformMatrix = createMemo(() => props.parentTransform ?? new DOMMatrix())
  const inverseParentTransformMatrix = createMemo(() => parentTransformMatrix().inverse())

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
    e.stopPropagation()

    const originUserSelect = document.body.style.userSelect
    document.body.style.userSelect = 'none'

    const startClientX = e.clientX
    const startClientY = e.clientY
    const { x: startTranslateX, y: startTranslateY } = value()

    const onMouseMove = (_e: MouseEvent) => {
      const clientX = _e.clientX
      const clientY = _e.clientY
      const offsetX = clientX - startClientX
      const offsetY = clientY - startClientY
      const m = parentTransformMatrix().inverse().translate(offsetX, offsetY)
      const transformedOffsetX = m.e
      const transformedOffsetY = m.f
      const changedValue = {
        x: startTranslateX + transformedOffsetX,
        y: startTranslateY + transformedOffsetY,
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
    if (rotating) return

    e.stopPropagation()

    const originUserSelect = document.body.style.userSelect
    document.body.style.userSelect = 'none'
    const originCursor = document.body.style.cursor
    document.body.style.cursor = 'none'

    const onMouseMove = (_e: MouseEvent) => {
      const changedValue: Partial<TransformValue> = {}
      const m = parentTransformMatrix()
        .multiply(transformMatrix())
        .inverse()
        .translate(_e.movementX, _e.movementY)
      const movementX = m.e
      const movementY = m.f

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

      const newTransformOrigin = parseTransformOrigin(
        changedValue.width ?? value().width,
        changedValue.height ?? value().height,
      )
      const newTransformOriginPoint = new DOMPoint(
        newTransformOrigin[0] - xOffset,
        newTransformOrigin[1] - yOffset,
      ).matrixTransform(transformOriginMatrix())
      const newTransformMatrix = new DOMMatrix()
        .translate(newTransformOriginPoint.x, newTransformOriginPoint.y)
        .multiply(transformMatrix())
        .translate(-newTransformOriginPoint.x, -newTransformOriginPoint.y)
        .translate(xOffset, yOffset)
        .inverse()

      const offsetPoint = new DOMPoint()
        .matrixTransform(transformOriginMatrix())
        .matrixTransform(newTransformMatrix)
      changedValue.x = value().x + offsetPoint.x
      changedValue.y = value().y + offsetPoint.y

      setValue({
        ...value(),
        ...changedValue,
      })
      props.onResize?.(changedValue)

      updateResizeArrowPosition(_e)
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
        updateResizeArrowPosition(e)
      },
      onMouseMove: e => {
        if (resizing) return
        updateResizeArrowPosition(e)
      },
      onMouseLeave: () => {
        if (resizing) return
        setResizeDirection(false)
      },
    }
  }

  let rotating = false
  const onRotateMouseDown = (
    e: MouseEvent & {
      currentTarget: HTMLDivElement
    },
  ) => {
    if (!transformOriginRef) return
    e.stopPropagation()

    rotating = true
    const originUserSelect = document.body.style.userSelect
    document.body.style.userSelect = 'none'
    const originCursor = document.body.style.cursor
    document.body.style.cursor = 'none'

    const { x, y, width, height } = transformOriginRef.getBoundingClientRect()

    const centerX = x + width / 2
    const centerY = y + height / 2
    const startRotate = value().rotate
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX)

    const onMouseMove = (_e: MouseEvent) => {
      const angle = Math.atan2(_e.clientY - centerY, _e.clientX - centerX)
      const rotate = startRotate + radToDeg(angle - startAngle)
      setValue({
        ...value(),
        rotate,
      })
      props.onRotate?.({ rotate })

      updateRotateArrowPosition(_e)
    }
    window.addEventListener('mousemove', onMouseMove)

    const onMouseUp = () => {
      rotating = false
      setRotateDirection(false)
      document.body.style.userSelect = originUserSelect
      document.body.style.cursor = originCursor
      props.onTransformEnd?.()
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
    window.addEventListener('mouseup', onMouseUp)
  }
  const getRotateHandlerProps = (
    direction: ResizeDirection,
  ): JSX.HTMLAttributes<HTMLDivElement> => {
    return {
      onMouseDown: e => {
        onRotateMouseDown(e)
      },
      onMouseEnter: e => {
        if (rotating) return
        setRotateDirection(direction)
        updateRotateArrowPosition(e)
      },
      onMouseMove: e => {
        if (rotating) return
        updateRotateArrowPosition(e)
      },
      onMouseLeave: () => {
        if (rotating) return
        setRotateDirection(false)
      },
    }
  }

  const [resizeDirection, setResizeDirection] = createSignal<ResizeDirection | false>(false)
  const [resizeArrowPosition, setResizeArrowPosition] = createSignal({
    x: 0,
    y: 0,
  })
  const updateResizeArrowPosition = (e: MouseEvent) => {
    setResizeArrowPosition({
      x: e.pageX,
      y: e.pageY,
    })
  }

  const [rotateDirection, setRotateDirection] = createSignal<ResizeDirection | false>(false)
  const [rotateArrowPosition, setRotateArrowPosition] = createSignal({
    x: 0,
    y: 0,
  })
  const updateRotateArrowPosition = (e: MouseEvent) => {
    setRotateArrowPosition({
      x: e.pageX,
      y: e.pageY,
    })
  }

  const topLeftPoint = createMemo(() => new DOMPoint(0, 0).matrixTransform(transformOriginMatrix()))
  const topRightPoint = createMemo(() =>
    new DOMPoint(value().width, 0).matrixTransform(transformOriginMatrix()),
  )
  const bottomLeftPoint = createMemo(() =>
    new DOMPoint(0, value().height).matrixTransform(transformOriginMatrix()),
  )
  const bottomRightPoint = createMemo(() =>
    new DOMPoint(value().width, value().height).matrixTransform(transformOriginMatrix()),
  )
  const topPoint = createMemo(() =>
    new DOMPoint(value().width / 2, 0).matrixTransform(transformOriginMatrix()),
  )
  const bottomPoint = createMemo(() =>
    new DOMPoint(value().width / 2, value().height).matrixTransform(transformOriginMatrix()),
  )
  const leftPoint = createMemo(() =>
    new DOMPoint(0, value().height / 2).matrixTransform(transformOriginMatrix()),
  )
  const rightPoint = createMemo(() =>
    new DOMPoint(value().width, value().height / 2).matrixTransform(transformOriginMatrix()),
  )
  const transformOriginPoint = createMemo(() =>
    new DOMPoint(...transformOrigin()).matrixTransform(transformOriginMatrix()),
  )
  const transformedSize = createMemo(() => {
    const start = new DOMPoint(0, 0).matrixTransform(
      parentTransformMatrix().multiply(transformOriginMatrix()),
    )
    const right = new DOMPoint().matrixTransform(
      parentTransformMatrix().multiply(transformOriginMatrix()).translate(value().width, 0),
    )
    const bottom = new DOMPoint().matrixTransform(
      parentTransformMatrix().multiply(transformOriginMatrix()).translate(0, value().height),
    )
    return {
      width: distance([start.x, start.y], [right.x, right.y]),
      height: distance([start.x, start.y], [bottom.x, bottom.y]),
    }
  })

  const getAxisRotate = (x: number, y: number) => {
    const m = parentTransformMatrix().multiply(transformMatrix()).translate(x, y)
    return radToDeg(Math.atan2(m.f, m.e))
  }
  const xAxisRotate = createMemo(() => getAxisRotate(1, 0))
  const yAxisRotate = createMemo(() => getAxisRotate(0, 1))

  const directionRotateDict = createMemo(() => {
    const top = yAxisRotate() - 90
    const left = xAxisRotate() + 90
    const bottomRight = getAxisRotate(value().width, value().height) - 90
    const topRight = getAxisRotate(-value().width, value().height) + 90

    return {
      top,
      bottom: top,
      left,
      right: left,
      topLeft: bottomRight + 180,
      bottomRight,
      topRight,
      bottomLeft: topRight + 180,
    }
  })

  const resizeArrowRotate = createMemo(() => {
    const _resizeDirection = resizeDirection()
    return _resizeDirection ? directionRotateDict()[_resizeDirection] : 0
  })

  const rotateArrowRotate = createMemo(() => {
    const _rotateDirection = rotateDirection()
    return _rotateDirection ? directionRotateDict()[_rotateDirection] + 45 : 0
  })

  const getEdge = (direction: 'top' | 'bottom' | 'right' | 'left') => {
    const point = {
      top: topPoint,
      bottom: bottomPoint,
      right: rightPoint,
      left: leftPoint,
    }[direction]
    return (
      <div
        class={cs(
          'w-[--edge-length] h-[--edge-width] cursor-none rounded-3px absolute pointer-events-initial',
          'after:content-empty after:absolute after:left-0 after:right-0 after:top-1/2 after:h-1px after:bg-[--ant-color-primary]',
        )}
        {...getResizeHandlerProps(direction)}
        style={{
          '--edge-length':
            direction === 'top' || direction === 'bottom' ? 'var(--width)' : 'var(--height)',
          top: `calc(${point().y}px - var(--edge-width) / 2)`,
          left: `calc(${point().x}px - var(--edge-length) / 2)`,
          transform: inverseParentTransformMatrix()
            .multiply(
              new DOMMatrix().rotate(
                direction === 'top' || direction === 'bottom' ? xAxisRotate() : yAxisRotate(),
              ),
            )
            .toString(),
        }}
      />
    )
  }

  const getVertex = (direction: 'topLeft' | 'bottomRight' | 'topRight' | 'bottomLeft') => {
    const point = {
      topLeft: topLeftPoint,
      bottomRight: bottomRightPoint,
      topRight: topRightPoint,
      bottomLeft: bottomLeftPoint,
    }[direction]
    return (
      <div
        class="w-[--vertex-size] h-[--vertex-size] absolute pointer-events-initial"
        style={{
          top: `calc(${point().y}px - var(--vertex-size) / 2`,
          left: `calc(${point().x}px - var(--vertex-size) / 2`,
          transform: inverseParentTransformMatrix()
            .multiply(new DOMMatrix().rotate(xAxisRotate()))
            .toString(),
        }}
      >
        <div class="w-[--vertex-inner-size] h-[--vertex-inner-size] border-1px border-solid border-[--ant-color-primary] absolute top-1/2 left-1/2 -translate-1/2 pointer-events-none" />
        <div
          class="w-[--vertex-size] h-[--vertex-size] cursor-none absolute"
          {...getRotateHandlerProps(direction)}
        />
        <div
          class={cs(
            'w-[--vertex-resize-handler-size] h-[--vertex-resize-handler-size] cursor-none absolute',
            direction === 'topLeft' && 'right-0 bottom-0',
            direction === 'topRight' && 'left-0 bottom-0',
            direction === 'bottomLeft' && 'right-0 top-0',
            direction === 'bottomRight' && 'left-0 top-0',
          )}
          {...getResizeHandlerProps(direction)}
        />
      </div>
    )
  }

  return (
    <Element class="relative pointer-events-none">
      <div
        ref={containerRef}
        class={cs('absolute')}
        style={{
          '--ant-transformer-box-shadow':
            '2px 2px 2px 0 rgba(0,0,0,.12),-2px -2px 2px 0 rgba(0,0,0,.12)',
          '--vertex-size': '32px',
          '--vertex-inner-size': '8px',
          '--vertex-resize-handler-size':
            'calc(var(--vertex-size) / 2 + var(--vertex-inner-size) / 2)',
          '--width': `calc(${transformedSize().width}px - var(--vertex-inner-size))`,
          '--height': `calc(${transformedSize().height}px - var(--vertex-inner-size))`,
          '--edge-width': '8px',
          width: `${value().width}px`,
          height: `${value().height}px`,
          transform: `translate(${value().x}px, ${value().y}px)`,
          'transform-origin': `${transformOrigin()[0]}px ${transformOrigin()[1]}px`,
        }}
        onMouseDown={onMoveMouseDown}
      >
        {/* 边框 */}
        {getEdge('top')}
        {getEdge('bottom')}
        {getEdge('left')}
        {getEdge('right')}

        {/* 顶点 */}
        {getVertex('topLeft')}
        {getVertex('topRight')}
        {getVertex('bottomLeft')}
        {getVertex('bottomRight')}

        <CrosshairSvg
          ref={transformOriginRef}
          class="absolute [font-size:var(--size)] text-black"
          style={{
            '--size': '14px',
            top: `calc(${transformOriginPoint().y}px - var(--size) / 2)`,
            left: `calc(${transformOriginPoint().x}px - var(--size) / 2)`,
            transform: inverseParentTransformMatrix().toString(),
            opacity: props.transformOriginIcon ? 1 : 0,
          }}
        />
      </div>

      <Show when={!resizeDirection() && rotateDirection()}>
        <Portal>
          <RotateArrowSvg
            class="absolute pointer-events-none text-24px"
            style={{
              top: `${rotateArrowPosition().y}px`,
              left: `${rotateArrowPosition().x}px`,
              transform: `translate(-50%, -50%) rotate(${rotateArrowRotate()}deg)`,
            }}
          />
        </Portal>
      </Show>

      <Show when={resizeDirection()}>
        <Portal>
          <ResizeSvg
            class="absolute pointer-events-none text-24px"
            style={{
              top: `${resizeArrowPosition().y}px`,
              left: `${resizeArrowPosition().x}px`,
              transform: `translate(-50%, -50%) rotate(${resizeArrowRotate()}deg)`,
            }}
          />
        </Portal>
      </Show>

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
