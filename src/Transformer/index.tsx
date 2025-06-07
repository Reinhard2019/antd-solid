import { type Ref, Show, createMemo, createSignal, type Component, type JSX } from 'solid-js'
import { clamp, inRange } from 'lodash-es'
import { Portal } from 'solid-js/web'
import NP from 'number-precision'
import createControllableValue from '../hooks/createControllableValue'
import ResizeSvg from '../assets/svg/Resize'
import Element from '../Element'
import { distance, radToDeg } from '../utils/math'
import RotateArrowSvg from '../assets/svg/RotateArrow'
import CrosshairSvg from '../assets/svg/Crosshair'
import { setRef } from '../utils/solid'
import { setupGlobalDrag } from '../utils/setupGlobalDrag'

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
  project?: (point: DOMPoint, transformValue: TransformValue, transformOrigin: DOMPoint) => DOMPoint
  unproject?: (
    point: DOMPoint,
    transformValue: TransformValue,
    transformOrigin: DOMPoint,
  ) => DOMPoint
  parentProject?: (point: DOMPoint) => DOMPoint
  parentUnproject?: (point: DOMPoint) => DOMPoint
  /**
   * 转换中心
   * 默认为 ['50%', '50%']
   */
  transformOrigin?:
  | [x: number | `${number}%`, y: number | `${number}%`]
  | ((width: number, height: number) => [x: number, y: number])
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

const Transformer: Component<TransformerProps> = props => {
  let ref: HTMLDivElement | undefined

  const adsorbGap = createMemo(() => (props.adsorb ? props.adsorb.gap ?? 5 : 0))

  const getTransform = (value: TransformValue, transformOrigin: DOMPoint) =>
    new DOMMatrix()
      .translate(value.x, value.y)
      .translate(transformOrigin.x, transformOrigin.y)
      .rotate(value.rotate)
      .translate(-transformOrigin.x, -transformOrigin.y)

  const [_value, setValue] = createControllableValue<TransformValue | undefined>(props)
  const value = createMemo(
    () =>
      _value() ?? {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        rotate: 0,
      },
  )

  const parseTransformOrigin = (width: number, height: number) => {
    if (typeof props.transformOrigin === 'function') {
      return new DOMPoint(...props.transformOrigin(width, height))
    }
    const [x, y] = props.transformOrigin ?? ['50%', '50%']
    return new DOMPoint(
      typeof x === 'string' ? (width * parseFloat(x)) / 100 : x,
      typeof y === 'string' ? (height * parseFloat(y)) / 100 : y,
    )
  }

  const project = (
    point: DOMPoint,
    transformValue?: TransformValue,
    transformOrigin?: DOMPoint,
  ) => {
    point = parentProject(point, transformValue, transformOrigin)
    return props.parentProject ? props.parentProject(point) : point
  }
  const parentProject = (
    point: DOMPoint,
    transformValue?: TransformValue,
    transformOrigin?: DOMPoint,
  ) => {
    transformValue = transformValue ?? value()
    transformOrigin =
      transformOrigin ?? parseTransformOrigin(transformValue.width, transformValue.height)

    if (props.project) {
      return props.project(point, transformValue, transformOrigin)
    }

    return point.matrixTransform(getTransform(transformValue, transformOrigin))
  }
  const parentUnproject = (point: DOMPoint) => {
    if (ref) {
      const rect = ref.getBoundingClientRect()
      point = new DOMPoint(point.x - rect.x, point.y - rect.y)
    }

    if (props.parentUnproject) return props.parentUnproject(point)

    return point
  }
  const unproject = (
    point: DOMPoint,
    transformValue?: TransformValue,
    transformOrigin?: DOMPoint,
  ) => {
    transformValue = transformValue ?? value()
    transformOrigin =
      transformOrigin ?? parseTransformOrigin(transformValue.width, transformValue.height)

    point = parentUnproject(point)

    if (props.unproject) {
      return props.unproject(point, transformValue, transformOrigin)
    }

    return point.matrixTransform(getTransform(transformValue, transformOrigin).inverse())
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
    if (!isMainButton(e)) return
    e.stopPropagation()

    const startValue = value()
    const startPoint = parentUnproject(new DOMPoint(e.clientX, e.clientY))

    setupGlobalDrag(
      // eslint-disable-next-line solid/reactivity
      (_e: MouseEvent) => {
        const currentMousePoint = parentUnproject(new DOMPoint(_e.clientX, _e.clientY))
        const changedValue = {
          x: startValue.x + (currentMousePoint.x - startPoint.x),
          y: startValue.y + (currentMousePoint.y - startPoint.y),
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
      // eslint-disable-next-line solid/reactivity
      () => {
        props.onTransformEnd?.()
        setAdsorbLine({})
      },
    )
  }

  let resizing = false
  const onResizeMouseDown = (e: MouseEvent, direction: ResizeDirection) => {
    if (!isMainButton(e)) return
    if (rotating) return
    e.stopPropagation()

    const startValue = { ...value() }

    const getVertex = (width: number, height: number): DOMPoint =>
      new DOMPoint(
        direction === 'right' || direction === 'bottomRight' || direction === 'topRight'
          ? 0
          : width,
        direction === 'bottom' || direction === 'bottomRight' || direction === 'bottomLeft'
          ? 0
          : height,
      )
    const startVertex = parentProject(getVertex(value().width, value().height))
    const startPoint = unproject(new DOMPoint(e.clientX, e.clientY))
    const startTransformOrigin = parseTransformOrigin(value().width, value().height)

    resizing = true

    setupGlobalDrag(
      // eslint-disable-next-line solid/reactivity
      (_e: MouseEvent) => {
        const changedValue = value()

        const currentPoint = unproject(
          new DOMPoint(_e.clientX, _e.clientY),
          startValue,
          startTransformOrigin,
        )
        const offsetX = currentPoint.x - startPoint.x
        const offsetY = currentPoint.y - startPoint.y

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
        const endVertex = parentProject(
          getVertex(endWidth, endHeight),
          startValue,
          endTransformOrigin,
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
      // eslint-disable-next-line solid/reactivity
      () => {
        resizing = false
        setResizeDirection(false)
        props.onTransformEnd?.()
      },
      'none',
    )
  }
  const getResizeHandlerProps = (direction: ResizeDirection): JSX.HTMLAttributes<any> => {
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
    e.stopPropagation()

    rotating = true

    const transformOrigin = parseTransformOrigin(value().width, value().height)

    const startPoint = unproject(new DOMPoint(e.clientX, e.clientY))
    const startAngle = Math.atan2(
      startPoint.y - transformOrigin.y,
      startPoint.x - transformOrigin.x,
    )

    setupGlobalDrag(
      // eslint-disable-next-line solid/reactivity
      (_e: MouseEvent) => {
        const currentPoint = unproject(new DOMPoint(_e.clientX, _e.clientY))
        const angle = Math.atan2(
          currentPoint.y - transformOrigin.y,
          currentPoint.x - transformOrigin.x,
        )
        const rotate = value().rotate + radToDeg(angle - startAngle)
        setValue({
          ...value(),
          rotate,
        })
        props.onRotate?.({ rotate })

        updateRotateArrowPosition(_e)
      },
      // eslint-disable-next-line solid/reactivity
      () => {
        rotating = false
        setRotateDirection(false)
        props.onTransformEnd?.()
      },
      'none',
    )
  }
  const getRotateHandlerProps = (direction: ResizeDirection): JSX.HTMLAttributes<any> => {
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

  const topLeftPoint = createMemo(() => project(new DOMPoint(0, 0)))
  const topRightPoint = createMemo(() => project(new DOMPoint(value().width, 0)))
  const bottomLeftPoint = createMemo(() => project(new DOMPoint(0, value().height)))
  const bottomRightPoint = createMemo(() => project(new DOMPoint(value().width, value().height)))

  const getRotate = (direction: ResizeDirection) => {
    const point = {
      top: topLeftPoint,
      bottom: bottomLeftPoint,
      right: topRightPoint,
      left: topLeftPoint,
      topLeft: bottomRightPoint,
      topRight: bottomLeftPoint,
      bottomLeft: topRightPoint,
      bottomRight: topLeftPoint,
    }[direction]
    const point2 = {
      top: topRightPoint,
      bottom: bottomRightPoint,
      right: bottomRightPoint,
      left: bottomLeftPoint,
      topLeft: topLeftPoint,
      topRight: topRightPoint,
      bottomLeft: bottomLeftPoint,
      bottomRight: bottomRightPoint,
    }[direction]

    let extraAngle = 0
    if (
      direction === 'topLeft' ||
      direction === 'topRight' ||
      direction === 'bottomLeft' ||
      direction === 'bottomRight'
    ) {
      extraAngle = Math.PI / 2
    }

    return Math.atan2(point().y - point2().y, point().x - point2().x) + extraAngle
  }

  const resizeArrowRotate = createMemo(() => {
    const direction = resizeDirection()

    if (!direction) return 0

    return getRotate(direction)
  })

  const rotateArrowRotate = createMemo(() => {
    const direction = rotateDirection()

    if (!direction) return 0

    return getRotate(direction) + Math.PI / 4
  })

  const getEdgeDom = (direction: 'top' | 'bottom' | 'right' | 'left') => {
    const point = {
      top: topLeftPoint,
      bottom: bottomLeftPoint,
      right: topRightPoint,
      left: topLeftPoint,
    }[direction]
    const point2 = {
      top: topRightPoint,
      bottom: bottomRightPoint,
      right: bottomRightPoint,
      left: bottomLeftPoint,
    }[direction]

    return (
      <>
        <line
          x1={point().x}
          y1={point().y}
          x2={point2().x}
          y2={point2().y}
          stroke="var(--ant-color-primary)"
          stroke-width={1}
        />

        <line
          class="pointer-events-initial cursor-none"
          x1={point().x}
          y1={point().y}
          x2={point2().x}
          y2={point2().y}
          opacity={0}
          stroke="var(--ant-color-primary)"
          stroke-width={3}
          {...getResizeHandlerProps(direction)}
        />
      </>
    )
  }

  const getVertexDom = (direction: 'topLeft' | 'bottomRight' | 'topRight' | 'bottomLeft') => {
    const point = {
      topLeft: topLeftPoint,
      topRight: topRightPoint,
      bottomRight: bottomRightPoint,
      bottomLeft: bottomLeftPoint,
    }[direction]
    const point2 = {
      topLeft: topRightPoint,
      topRight: topLeftPoint,
      bottomLeft: bottomRightPoint,
      bottomRight: bottomLeftPoint,
    }[direction]

    const size = 32
    const halfSize = size / 2
    const innerSize = 8

    const vertex = createMemo(() => {
      const halfW = (value().width * halfSize) / distance(topLeftPoint(), topRightPoint())
      const halfH = (value().height * halfSize) / distance(topLeftPoint(), bottomLeftPoint())

      const v = {
        topLeft: new DOMPoint(),
        topRight: new DOMPoint(value().width, 0),
        bottomRight: new DOMPoint(value().width, value().height),
        bottomLeft: new DOMPoint(0, value().height),
      }[direction]

      return {
        tl: new DOMPoint(v.x - halfW, v.y - halfH),
        tr: new DOMPoint(v.x + halfW, v.y - halfH),
        bl: new DOMPoint(v.x - halfW, v.y + halfH),
        br: new DOMPoint(v.x + halfW, v.y + halfH),
      }
    })

    const rotatePathD = createMemo(() => {
      const tl = project(vertex().tl)
      const tr = project(vertex().tr)
      const bl = project(vertex().bl)
      const br = project(vertex().br)

      return `M ${tl.x},${tl.y} L ${tr.x},${tr.y} L ${br.x},${br.y} L ${bl.x},${bl.y} Z`
    })

    const clampDOMPoint = (p: DOMPoint) =>
      new DOMPoint(clamp(p.x, 0, value().width), clamp(p.y, 0, value().height))

    const resizePathD = createMemo(() => {
      const tl = project(clampDOMPoint(vertex().tl))
      const tr = project(clampDOMPoint(vertex().tr))
      const bl = project(clampDOMPoint(vertex().bl))
      const br = project(clampDOMPoint(vertex().br))

      return `M ${tl.x},${tl.y} L ${tr.x},${tr.y} L ${br.x},${br.y} L ${bl.x},${bl.y} Z`
    })

    return (
      <>
        <path
          class="pointer-events-initial cursor-none"
          d={rotatePathD()}
          opacity={0}
          fill="red"
          {...getRotateHandlerProps(direction)}
        />

        <rect
          class="pointer-events-initial cursor-none"
          x={point().x - innerSize / 2}
          y={point().y - innerSize / 2}
          width={innerSize}
          height={innerSize}
          fill="var(--ant-color-white)"
          stroke="var(--ant-color-primary)"
          style={{
            'transform-origin': `${point().x}px ${point().y}px`,
            transform: `rotate(${Math.atan2(point().y - point2().y, point().x - point2().x)}rad)`,
          }}
          {...getResizeHandlerProps(direction)}
        />

        <path
          class="pointer-events-initial cursor-none"
          d={resizePathD()}
          opacity={0}
          fill="blue"
          {...getResizeHandlerProps(direction)}
        />
      </>
    )
  }

  const transformOrigin = createMemo(() =>
    project(parseTransformOrigin(value().width, value().height)),
  )

  setRef(props, {
    enterMove: onMoveMouseDown,
    enterResize: onResizeMouseDown,
    enterRotate: onRotateMouseDown,
  })

  return (
    <Element ref={ref} class="relative">
      <svg class="absolute overflow-visible w-1px h-1px pointer-events-none">
        <path
          class="pointer-events-initial"
          d={`M ${topLeftPoint().x},${topLeftPoint().y} L ${topRightPoint().x},${topRightPoint().y} L ${bottomRightPoint().x},${bottomRightPoint().y} L ${bottomLeftPoint().x},${bottomLeftPoint().y} Z`}
          fill-opacity={0}
          onMouseDown={onMoveMouseDown}
        />

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
      </svg>

      <Show when={props.transformOriginIcon}>
        <CrosshairSvg
          class="absolute [font-size:var(--size)] text-black pointer-events-none"
          style={{
            '--size': '14px',
            top: `calc(${transformOrigin().y}px - var(--size) / 2)`,
            left: `calc(${transformOrigin().x}px - var(--size) / 2)`,
          }}
        />
      </Show>

      <Show when={!resizeDirection() && rotateDirection()}>
        <Portal>
          <RotateArrowSvg
            class="absolute pointer-events-none text-24px"
            style={{
              top: `${rotateArrowPosition().y}px`,
              left: `${rotateArrowPosition().x}px`,
              transform: `translate(-50%, -50%) rotate(${rotateArrowRotate()}rad)`,
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
              transform: `translate(-50%, -50%) rotate(${resizeArrowRotate()}rad)`,
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
