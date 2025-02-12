import {
  type Ref,
  Show,
  createMemo,
  createSignal,
  mergeProps,
  type Component,
  type JSX,
} from 'solid-js'
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
import { setRef } from '../utils/solid'

export interface TransformValue {
  x: number
  y: number
  width: number
  height: number
  rotate: number
}

export interface TransformerInstance {
  /** 手动进入移动状态 */
  enterMove: (e: MouseEvent) => void
  /** 手动进入调整大小状态 */
  enterResize: (e: MouseEvent) => void
  /** 手动进入旋转状态 */
  enterRotate: (e: MouseEvent) => void
}

export interface TransformerProps {
  ref?: Ref<TransformerInstance>
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
  onResize?: (value: Pick<TransformValue, 'x' | 'y' | 'width' | 'height'>) => void
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

// 判断是否鼠标左键触发
const isMainButton = (e: MouseEvent) => e.button === 0

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

  let transformOriginRef: HTMLDivElement | undefined
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
  // 围绕转换原点进行转换后的 Matrix
  const transformOriginMatrix = createMemo(() =>
    new DOMMatrix()
      .translate(...transformOrigin())
      .multiply(transformMatrix())
      .translate(-transformOrigin()[0], -transformOrigin()[1]),
  )
  const parentTransformMatrix = createMemo(() =>
    props.parentTransform
      ? new DOMMatrix([
        props.parentTransform.a,
        props.parentTransform.b,
        props.parentTransform.c,
        props.parentTransform.d,
        0,
        0,
      ])
      : new DOMMatrix(),
  )
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
    if (!isMainButton(e)) return
    e.stopPropagation()

    const originUserSelect = document.body.style.userSelect
    document.body.style.userSelect = 'none'

    const startValue = value()

    const abortController = new AbortController()

    window.addEventListener(
      'mousemove',
      (_e: MouseEvent) => {
        const m = parentTransformMatrix()
          .inverse()
          .translate(_e.clientX - e.clientX, _e.clientY - e.clientY)
        const offsetX = m.e
        const offsetY = m.f
        const changedValue = {
          x: startValue.x + offsetX,
          y: startValue.y + offsetY,
        }
        if (props.adsorb) {
          const _adsorbLine: AdsorbLine = {}

          // x 轴
          const right = props.adsorb.width - value().width
          const centerX = right / 2
          if (inRange(changedValue.x, centerX - adsorbGap(), centerX + adsorbGap())) {
            changedValue.x = centerX
            _adsorbLine.centerX = true
          } else if (inRange(changedValue.x, -adsorbGap(), adsorbGap())) {
            changedValue.x = 0
            _adsorbLine.left = true
          } else if (inRange(changedValue.x, right - adsorbGap(), right + adsorbGap())) {
            changedValue.x = right
            _adsorbLine.right = true
          }

          // y 轴
          const bottom = props.adsorb.height - value().height
          const centerY = bottom / 2
          if (inRange(changedValue.y, centerY - adsorbGap(), centerY + adsorbGap())) {
            changedValue.y = centerY
            _adsorbLine.centerY = true
          } else if (inRange(changedValue.y, -adsorbGap(), adsorbGap())) {
            changedValue.y = 0
            _adsorbLine.top = true
          } else if (inRange(changedValue.y, bottom - adsorbGap(), bottom + adsorbGap())) {
            changedValue.y = bottom
            _adsorbLine.bottom = true
          }

          setAdsorbLine(_adsorbLine)
        }
        setValue({
          ...value(),
          ...changedValue,
        })
        props.onMove?.(changedValue)
      },
      {
        capture: true,
        signal: abortController.signal,
      },
    )

    window.addEventListener(
      'mouseup',
      () => {
        document.body.style.userSelect = originUserSelect
        props.onTransformEnd?.()
        setAdsorbLine({})
        abortController.abort()
      },
      {
        capture: true,
        once: true,
      },
    )
  }

  let resizing = false
  const onResizeMouseDown = (e: MouseEvent, direction: ResizeDirection) => {
    if (!isMainButton(e)) return
    if (rotating) return
    e.stopPropagation()

    const originUserSelect = document.body.style.userSelect
    document.body.style.userSelect = 'none'
    const originCursor = document.body.style.cursor
    document.body.style.cursor = 'none'

    const startValue = value()

    const getVertex = (width: number, height: number): DOMPoint =>
      new DOMPoint(
        direction === 'right' || direction === 'bottomRight' || direction === 'topRight'
          ? 0
          : width,
        direction === 'bottom' || direction === 'bottomRight' || direction === 'bottomLeft'
          ? 0
          : height,
      )
    const startVertex = getVertex(value().width, value().height).matrixTransform(
      new DOMMatrix()
        .translate(...transformOrigin())
        .multiply(transformMatrix())
        .translate(-transformOrigin()[0], -transformOrigin()[1]),
    )

    const abortController = new AbortController()
    window.addEventListener(
      'mousemove',
      (_e: MouseEvent) => {
        const changedValue = value()

        const m = parentTransformMatrix()
          .multiply(transformMatrix())
          .inverse()
          .translate(_e.clientX - e.clientX, _e.clientY - e.clientY)
        const offsetX = m.e
        const offsetY = m.f

        const _adsorbLine: AdsorbLine = {}

        if (
          direction === 'left' ||
          direction === 'right' ||
          direction === 'topLeft' ||
          direction === 'topRight' ||
          direction === 'bottomLeft' ||
          direction === 'bottomRight'
        ) {
          const isLeft =
            direction === 'left' || direction === 'topLeft' || direction === 'bottomLeft'
          let widthOffset = isLeft ? -offsetX : offsetX
          widthOffset = Math.max(-startValue.width, widthOffset)
          changedValue.width = startValue.width + widthOffset

          if (props.adsorb) {
            if (isLeft) {
              let xOffset = isLeft ? -widthOffset : 0
              if (inRange(startValue.x + xOffset, -adsorbGap(), +adsorbGap())) {
                xOffset = -startValue.x
                changedValue.width = NP.minus(startValue.width, xOffset)
              }
            } else {
              if (
                inRange(
                  startValue.x + changedValue.width,
                  props.adsorb.width - adsorbGap(),
                  props.adsorb.width + adsorbGap(),
                )
              ) {
                changedValue.width = NP.minus(props.adsorb.width, startValue.x)
              }
            }
          }
        }
        if (
          direction === 'top' ||
          direction === 'bottom' ||
          direction === 'topLeft' ||
          direction === 'topRight' ||
          direction === 'bottomLeft' ||
          direction === 'bottomRight'
        ) {
          const isTop = direction === 'top' || direction === 'topLeft' || direction === 'topRight'
          let heightOffset = isTop ? -offsetY : offsetY
          heightOffset = Math.max(-startValue.height, heightOffset)
          changedValue.height = startValue.height + heightOffset

          if (props.adsorb) {
            if (isTop) {
              let yOffset = isTop ? -heightOffset : 0
              if (inRange(startValue.y + yOffset, -adsorbGap(), +adsorbGap())) {
                yOffset = -startValue.y
                changedValue.height = NP.minus(startValue.height, yOffset)
              }
            } else {
              if (
                inRange(
                  startValue.y + changedValue.height,
                  props.adsorb.height - adsorbGap(),
                  props.adsorb.height + adsorbGap(),
                )
              ) {
                changedValue.height = NP.minus(props.adsorb.height, startValue.y)
              }
            }
          }
        }

        setAdsorbLine(_adsorbLine)

        const endWidth = changedValue.width ?? value().width
        const endHeight = changedValue.height ?? value().height
        const endTransformOrigin = parseTransformOrigin(endWidth, endHeight)
        const endVertex = getVertex(endWidth, endHeight).matrixTransform(
          new DOMMatrix()
            .translate(endTransformOrigin[0], endTransformOrigin[1])
            .multiply(transformMatrix())
            .translate(-endTransformOrigin[0], -endTransformOrigin[1]),
        )
        changedValue.x = startValue.x + startVertex.x - endVertex.x
        changedValue.y = startValue.y + startVertex.y - endVertex.y

        setValue({
          ...value(),
          ...changedValue,
        })
        props.onResize?.(changedValue)

        updateResizeArrowPosition(_e)
      },
      {
        capture: true,
        signal: abortController.signal,
      },
    )

    resizing = true
    window.addEventListener(
      'mouseup',
      () => {
        resizing = false
        setResizeDirection(false)
        props.onTransformEnd?.()
        document.body.style.userSelect = originUserSelect
        document.body.style.cursor = originCursor
        abortController.abort()
      },
      {
        capture: true,
        once: true,
      },
    )
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
    if (!isMainButton(e)) return
    if (!transformOriginRef) return
    e.stopPropagation()

    rotating = true
    const originUserSelect = document.body.style.userSelect
    document.body.style.userSelect = 'none'
    const originCursor = document.body.style.cursor
    document.body.style.cursor = 'none'

    const { x, y } = transformOriginRef.getBoundingClientRect()

    const startRotate = value().rotate
    const startAngle = Math.atan2(e.clientY - y, e.clientX - x)

    const abortController = new AbortController()

    window.addEventListener(
      'mousemove',
      (_e: MouseEvent) => {
        const angle = Math.atan2(_e.clientY - y, _e.clientX - x)
        const rotate = startRotate + radToDeg(angle - startAngle)
        setValue({
          ...value(),
          rotate,
        })
        props.onRotate?.({ rotate })

        updateRotateArrowPosition(_e)
      },
      {
        capture: true,
        signal: abortController.signal,
      },
    )

    window.addEventListener(
      'mouseup',
      () => {
        rotating = false
        setRotateDirection(false)
        document.body.style.userSelect = originUserSelect
        document.body.style.cursor = originCursor
        props.onTransformEnd?.()
        abortController.abort()
      },
      {
        capture: true,
        once: true,
      },
    )
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

  const getEdgeDom = (direction: 'top' | 'bottom' | 'right' | 'left') => {
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
          'after:content-empty after:absolute after:left-0 after:right-0 after:top-1/2 after:-translate-y-1/2 after:h-1px after:bg-[--ant-color-primary]',
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

  const getVertexDom = (direction: 'topLeft' | 'bottomRight' | 'topRight' | 'bottomLeft') => {
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

  setRef(props, {
    enterMove: onMoveMouseDown,
    enterResize: onResizeMouseDown,
    enterRotate: onRotateMouseDown,
  })

  return (
    <Element class="relative">
      <div
        class="absolute"
        style={{
          width: `${value().width}px`,
          height: `${value().height}px`,
          transform: `translate(${value().x}px, ${value().y}px) rotate(${value().rotate}deg) scale(${props.scaleX},${props.scaleY}) skew(${props.skewX}deg,${props.skewY}deg)`,
          'transform-origin': `${transformOrigin()[0]}px ${transformOrigin()[1]}px`,
        }}
        onMouseDown={onMoveMouseDown}
      >
        <div
          ref={transformOriginRef}
          class="absolute w-0px h-0px"
          style={{
            top: `${transformOrigin()[1]}px`,
            left: `${transformOrigin()[0]}px`,
          }}
        />
      </div>

      <div
        class="absolute"
        style={{
          '--ant-transformer-box-shadow':
            '2px 2px 2px 0 rgba(0,0,0,.12),-2px -2px 2px 0 rgba(0,0,0,.12)',
          '--vertex-size': '32px',
          '--vertex-inner-size': '8px',
          '--vertex-resize-handler-size':
            'calc(var(--vertex-size) / 2 + var(--vertex-inner-size) / 2 + 4px)',
          '--width': `calc(${transformedSize().width}px - var(--vertex-inner-size))`,
          '--height': `calc(${transformedSize().height}px - var(--vertex-inner-size))`,
          '--edge-width': '8px',
          transform: `translate(${value().x}px, ${value().y}px)`,
          'transform-origin': `${transformOrigin()[0]}px ${transformOrigin()[1]}px`,
        }}
      >
        {/* 边框 */}
        {getEdgeDom('top')}
        {getEdgeDom('bottom')}
        {getEdgeDom('left')}
        {getEdgeDom('right')}

        {/* 顶点 */}
        {getVertexDom('topLeft')}
        {getVertexDom('topRight')}
        {getVertexDom('bottomLeft')}
        {getVertexDom('bottomRight')}

        <Show when={props.transformOriginIcon}>
          <CrosshairSvg
            class="absolute [font-size:var(--size)] text-black pointer-events-none"
            style={{
              '--size': '14px',
              top: `calc(${transformOrigin()[1]}px - var(--size) / 2)`,
              left: `calc(${transformOrigin()[0]}px - var(--size) / 2)`,
              transform: inverseParentTransformMatrix().toString(),
            }}
          />
        </Show>
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
