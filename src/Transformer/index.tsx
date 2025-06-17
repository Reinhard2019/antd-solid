import { type Ref, Show, createMemo, createSignal, type Component, type JSX } from 'solid-js'
import { inRange } from 'lodash-es'
import { Portal } from 'solid-js/web'
import NP from 'number-precision'
import cs from 'classnames'
import createControllableValue from '../hooks/createControllableValue'
import ResizeSvg from '../assets/svg/Resize'
import Element from '../Element'
import { radToDeg } from '../utils/math'
import RotateArrowSvg from '../assets/svg/RotateArrow'
import CrosshairSvg from '../assets/svg/Crosshair'
import { setRef } from '../utils/solid'
import { setupGlobalDrag } from '../utils/setupGlobalDrag'
import { subDOMPoint } from '../utils/domPoint'

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

export type LayoutPoint<T = DOMPoint> = T | null | [T | null, T | null]

export interface Layout<T = LayoutPoint> {
  topLeftPoint: T
  topRightPoint: T
  bottomLeftPoint: T
  bottomRightPoint: T
  // x 轴中心线
  xCenterLine?: [DOMPoint, DOMPoint]
  // y 轴中心线
  yCenterLine?: [DOMPoint, DOMPoint]
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
     * 吸附容器（通常是父级）宽度
     */
    width: number
    /**
     * 吸附容器（通常是父级）高度
     */
    height: number
    /**
     * 吸附误差，鼠标位于吸附误差范围内时，吸附
     * 默认 5
     */
    gap?: number
  }
  localToParentPoint?: (
    point: DOMPoint,
    transformValue: TransformValue,
    transformOrigin: DOMPoint,
  ) => DOMPoint | undefined
  parentToLocalPoint?: (
    point: DOMPoint,
    transformValue: TransformValue,
    transformOrigin: DOMPoint,
  ) => DOMPoint | undefined
  parentToWorldPoint?: (point: DOMPoint) => DOMPoint | undefined
  worldToParentPoint?: (point: DOMPoint) => DOMPoint | undefined
  localToWorldLayout?: (value: Layout<DOMPoint>) => Layout
  parentToWorldLayout?: (value: Layout<DOMPoint>) => Layout
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
  /**
   * 设置 svg 的 viewBox
   * 默认不需要设置，不设置时 svg 的宽高为 1*1，overflow 为 visible（此时显示范围不限制）
   * 为什么要设置？某些极端情况下，如在 3d perspective 的情况下，某些点可能 x、y 值超级超级大，此时如果没有限制显示范围，显示会出现异常
   */
  viewBox?: DOMRect
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

  const localToParent = (
    point: DOMPoint,
    transformValue?: TransformValue,
    transformOrigin?: DOMPoint,
  ) => {
    transformValue = transformValue ?? value()
    transformOrigin =
      transformOrigin ?? parseTransformOrigin(transformValue.width, transformValue.height)

    if (props.localToParentPoint) {
      return props.localToParentPoint(point, transformValue, transformOrigin)
    }

    return point.matrixTransform(getTransform(transformValue, transformOrigin))
  }
  const worldToParent = (point: DOMPoint) => {
    if (ref) {
      const rect = ref.getBoundingClientRect()
      point = new DOMPoint(point.x - rect.x, point.y - rect.y)
    }

    if (props.worldToParentPoint) return props.worldToParentPoint(point)

    return point
  }
  const localToWorld = (
    point: DOMPoint,
    transformValue?: TransformValue,
    transformOrigin?: DOMPoint,
  ) => {
    const newPoint = localToParent(point, transformValue, transformOrigin)
    if (!newPoint) return
    return props.parentToWorldPoint ? props.parentToWorldPoint(newPoint) : newPoint
  }
  const worldToLocal = (
    point: DOMPoint,
    transformValue?: TransformValue,
    transformOrigin?: DOMPoint,
  ) => {
    transformValue = transformValue ?? value()
    transformOrigin =
      transformOrigin ?? parseTransformOrigin(transformValue.width, transformValue.height)

    const newPoint = worldToParent(point)

    if (!newPoint) return

    if (props.parentToLocalPoint) {
      return props.parentToLocalPoint(newPoint, transformValue, transformOrigin)
    }

    return newPoint.matrixTransform(getTransform(transformValue, transformOrigin).inverse())
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
    console.log('onMoveMouseDown')
    if (!isMainButton(e)) return

    e.stopPropagation()

    const startValue = value()
    const startPoint = worldToParent(new DOMPoint(e.clientX, e.clientY))

    if (!startPoint) return

    setupGlobalDrag(
      // eslint-disable-next-line solid/reactivity
      (_e: MouseEvent) => {
        const currentMousePoint = worldToParent(new DOMPoint(_e.clientX, _e.clientY))

        if (!currentMousePoint) return

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
    const startPoint = worldToLocal(new DOMPoint(e.clientX, e.clientY))

    if (!startPoint) return

    const getVertex = (width: number, height: number): DOMPoint =>
      new DOMPoint(
        direction === 'right' || direction === 'bottomRight' || direction === 'topRight'
          ? 0
          : width,
        direction === 'bottom' || direction === 'bottomRight' || direction === 'bottomLeft'
          ? 0
          : height,
      )
    const startVertex = localToParent(getVertex(value().width, value().height))

    if (!startVertex) return

    const startTransformOrigin = parseTransformOrigin(value().width, value().height)

    resizing = true

    setupGlobalDrag(
      // eslint-disable-next-line solid/reactivity
      (_e: MouseEvent) => {
        const changedValue = value()

        const currentPoint = worldToLocal(
          new DOMPoint(_e.clientX, _e.clientY),
          startValue,
          startTransformOrigin,
        )

        if (!currentPoint) return

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
        const endVertex = localToParent(
          getVertex(endWidth, endHeight),
          startValue,
          endTransformOrigin,
        )

        if (!endVertex) return

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
  const getResizeHandlerProps = (
    direction: ResizeDirection,
    getMouseRotate: () => number,
  ): JSX.HTMLAttributes<any> => {
    return {
      onMouseDown: e => {
        onResizeMouseDown(e, direction)
      },
      onMouseEnter: e => {
        if (resizing) return
        setResizeDirection(direction)
        setMouseRotate(getMouseRotate())
        updateResizeArrowPosition(e)
      },
      onMouseMove: e => {
        if (resizing) return
        updateResizeArrowPosition(e)
      },
      onMouseLeave: () => {
        if (resizing) return
        setResizeDirection(false)
        setMouseRotate(0)
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

    const startPoint = worldToLocal(new DOMPoint(e.clientX, e.clientY))

    if (!startPoint) return

    const startAngle = Math.atan2(
      startPoint.y - transformOrigin.y,
      startPoint.x - transformOrigin.x,
    )

    setupGlobalDrag(
      // eslint-disable-next-line solid/reactivity
      (_e: MouseEvent) => {
        const currentPoint = worldToLocal(new DOMPoint(_e.clientX, _e.clientY))

        if (!currentPoint) return

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
  const getRotateHandlerProps = (
    direction: ResizeDirection,
    getMouseRotate: () => number,
  ): JSX.HTMLAttributes<any> => {
    return {
      onMouseDown: e => {
        onRotateMouseDown(e)
      },
      onMouseEnter: e => {
        if (rotating) return
        setRotateDirection(direction)
        setMouseRotate(getMouseRotate())
        updateRotateArrowPosition(e)
      },
      onMouseMove: e => {
        if (rotating) return
        updateRotateArrowPosition(e)
      },
      onMouseLeave: () => {
        if (rotating) return
        setRotateDirection(false)
        setMouseRotate(0)
      },
    }
  }

  const [mouseRotate, setMouseRotate] = createSignal(0)

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

  const convertLayout = (
    width: number,
    height: number,
    convertPoint: (point: DOMPoint) => DOMPoint | undefined,
    _convertLayout: ((layout: Layout<DOMPoint>) => Layout) | undefined,
  ): Layout => {
    const topLeftPoint = new DOMPoint(0, 0)
    const topRightPoint = new DOMPoint(width, 0)
    const bottomRightPoint = new DOMPoint(width, height)
    const bottomLeftPoint = new DOMPoint(0, height)
    const leftCenterPoint = new DOMPoint(
      (topLeftPoint.x + bottomLeftPoint.x) / 2,
      (topLeftPoint.y + bottomLeftPoint.y) / 2,
    )
    const rightCenterPoint = new DOMPoint(
      (topRightPoint.x + bottomRightPoint.x) / 2,
      (topRightPoint.y + bottomRightPoint.y) / 2,
    )
    const xCenterLine: [DOMPoint, DOMPoint] = [leftCenterPoint, rightCenterPoint]
    const topCenterPoint = new DOMPoint(
      (topLeftPoint.x + topRightPoint.x) / 2,
      (topLeftPoint.y + topRightPoint.y) / 2,
    )
    const bottomCenterPoint = new DOMPoint(
      (bottomLeftPoint.x + bottomRightPoint.x) / 2,
      (bottomLeftPoint.y + bottomRightPoint.y) / 2,
    )
    const yCenterLine: [DOMPoint, DOMPoint] = [topCenterPoint, bottomCenterPoint]

    const layoutValue: Layout<DOMPoint> = {
      topLeftPoint,
      topRightPoint,
      bottomRightPoint,
      bottomLeftPoint,
      xCenterLine,
      yCenterLine,
    }

    if (_convertLayout) return _convertLayout(layoutValue)

    return {
      topLeftPoint: convertPoint(layoutValue.topLeftPoint),
      topRightPoint: convertPoint(layoutValue.topRightPoint),
      bottomRightPoint: convertPoint(layoutValue.bottomRightPoint),
      bottomLeftPoint: convertPoint(layoutValue.bottomLeftPoint),
      xCenterLine: xCenterLine.map(point => convertPoint(point)),
      yCenterLine: yCenterLine.map(point => convertPoint(point)),
    } as Layout
  }

  const layoutInWorld = createMemo(() => {
    const { width, height } = value()
    return convertLayout(width, height, localToWorld, props.localToWorldLayout)
  })

  const parentToWorld = (point: DOMPoint) => {
    return props.parentToWorldPoint ? props.parentToWorldPoint(point) : point
  }

  const parentLayoutInWorld = createMemo(() => {
    const { width = 0, height = 0 } = props.adsorb ?? {}
    return convertLayout(width, height, parentToWorld, props.parentToWorldLayout)
  })

  const pathD = createMemo(() => {
    const { topLeftPoint, topRightPoint, bottomRightPoint, bottomLeftPoint } = layoutInWorld()
    const points = [topLeftPoint, topRightPoint, bottomRightPoint, bottomLeftPoint].flatMap(
      p => (Array.isArray(p) ? p : [p]).filter(v => v) as DOMPoint[],
    )
    return `${points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ')} Z`
  })

  const resizeArrowRotate = mouseRotate

  const rotateArrowRotate = createMemo(() => {
    return mouseRotate() + Math.PI / 4
  })

  const transformOrigin = createMemo(() =>
    localToWorld(parseTransformOrigin(value().width, value().height)),
  )

  setRef(props, {
    enterMove: onMoveMouseDown,
    enterResize: onResizeMouseDown,
    enterRotate: onRotateMouseDown,
  })

  const viewBoxStr = createMemo(() => {
    if (!props.viewBox) return
    const { x, y, width, height } = props.viewBox
    return [x, y, width, height].join(' ')
  })

  return (
    <Element ref={ref} class="relative">
      <svg
        class={cs('absolute pointer-events-none', !props.viewBox && 'overflow-visible w-1px h-1px')}
        viewBox={viewBoxStr()}
      >
        <path
          class="pointer-events-initial"
          d={pathD()}
          opacity="0"
          onMouseDown={onMoveMouseDown}
        />

        {/* 边框 */}
        <Edge
          direction="top"
          layout={layoutInWorld()}
          centerLine={layoutInWorld().yCenterLine}
          getResizeHandlerProps={getResizeHandlerProps}
        />
        <Edge
          direction="bottom"
          layout={layoutInWorld()}
          centerLine={layoutInWorld().yCenterLine}
          getResizeHandlerProps={getResizeHandlerProps}
        />
        <Edge
          direction="left"
          layout={layoutInWorld()}
          centerLine={layoutInWorld().xCenterLine}
          getResizeHandlerProps={getResizeHandlerProps}
        />
        <Edge
          direction="right"
          layout={layoutInWorld()}
          centerLine={layoutInWorld().xCenterLine}
          getResizeHandlerProps={getResizeHandlerProps}
        />

        {/* 顶点 */}
        <Show when={layoutInWorld().topLeftPoint instanceof DOMPoint}>
          <Vertex
            direction="topLeft"
            layout={layoutInWorld()}
            getResizeHandlerProps={getResizeHandlerProps}
            getRotateHandlerProps={getRotateHandlerProps}
          />
        </Show>
        <Show when={layoutInWorld().topRightPoint instanceof DOMPoint}>
          <Vertex
            direction="topRight"
            layout={layoutInWorld()}
            getResizeHandlerProps={getResizeHandlerProps}
            getRotateHandlerProps={getRotateHandlerProps}
          />
        </Show>
        <Show when={layoutInWorld().bottomLeftPoint instanceof DOMPoint}>
          <Vertex
            direction="bottomLeft"
            layout={layoutInWorld()}
            getResizeHandlerProps={getResizeHandlerProps}
            getRotateHandlerProps={getRotateHandlerProps}
          />
        </Show>
        <Show when={layoutInWorld().bottomRightPoint instanceof DOMPoint}>
          <Vertex
            direction="bottomRight"
            layout={layoutInWorld()}
            getResizeHandlerProps={getResizeHandlerProps}
            getRotateHandlerProps={getRotateHandlerProps}
          />
        </Show>

        {/* 父级边框 */}
        <Show when={adsorbLine()?.top}>
          <ParentEdge direction="top" layout={parentLayoutInWorld()} />
        </Show>
        <Show when={adsorbLine()?.bottom}>
          <ParentEdge direction="bottom" layout={parentLayoutInWorld()} />
        </Show>
        <Show when={adsorbLine()?.left}>
          <ParentEdge direction="left" layout={parentLayoutInWorld()} />
        </Show>
        <Show when={adsorbLine()?.right}>
          <ParentEdge direction="right" layout={parentLayoutInWorld()} />
        </Show>

        {/* 父级中心线 */}
        <Show when={adsorbLine()?.centerX}>
          <ParentCenterLine line={parentLayoutInWorld().xCenterLine} />
        </Show>
        <Show when={adsorbLine()?.centerY}>
          <ParentCenterLine line={parentLayoutInWorld().yCenterLine} />
        </Show>

        <Show when={props.transformOriginIcon && transformOrigin()}>
          <foreignObject class="overflow-visible">
            <CrosshairSvg
              class="absolute [font-size:var(--size)] text-black pointer-events-none"
              style={{
                '--size': '14px',
                top: `calc(${transformOrigin()!.y}px - var(--size) / 2)`,
                left: `calc(${transformOrigin()!.x}px - var(--size) / 2)`,
              }}
              innerColor="white"
              outerColor="black"
            />
          </foreignObject>
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
      </svg>
    </Element>
  )
}

/**
 * 根据 point 获取 angle
 * @param point
 * @returns
 */
const getAngleOfDOMPoint = (point: DOMPoint) => {
  const angle = Math.atan2(point.y, point.x)
  return angle < 0 ? Math.PI * 2 + angle : angle
}

const Edge: Component<{
  layout: Layout
  direction: 'top' | 'bottom' | 'right' | 'left'
  /** 中心线 */
  centerLine: [DOMPoint, DOMPoint] | undefined
  getResizeHandlerProps: (
    direction: ResizeDirection,
    getMouseRotate: () => number,
  ) => JSX.HTMLAttributes<any>
}> = props => {
  const startPoint = createMemo(() => {
    const layout = props.layout
    const p = {
      top: layout.topLeftPoint,
      right: layout.topRightPoint,
      bottom: layout.bottomRightPoint,
      left: layout.bottomLeftPoint,
    }[props.direction]

    return (Array.isArray(p) ? p[1] : p) ?? new DOMPoint()
  })
  const endPoint = createMemo(() => {
    const layout = props.layout
    const p = {
      top: layout.topRightPoint,
      right: layout.bottomRightPoint,
      bottom: layout.bottomLeftPoint,
      left: layout.topLeftPoint,
    }[props.direction]

    return (Array.isArray(p) ? p[0] : p) ?? new DOMPoint()
  })

  const getMouseRotate = () => {
    const centerLine = props.centerLine
    if (centerLine) {
      return getAngleOfDOMPoint(subDOMPoint(centerLine[0], centerLine[1]))
    }

    return getAngleOfDOMPoint(subDOMPoint(endPoint(), startPoint()))
  }

  return (
    <>
      <path
        d={`M ${startPoint().x},${startPoint().y} L ${endPoint().x},${endPoint().y}`}
        stroke="var(--ant-color-primary)"
        stroke-width={1}
      />

      <path
        class="pointer-events-initial cursor-none"
        d={`M ${startPoint().x},${startPoint().y} L ${endPoint().x},${endPoint().y}`}
        opacity={0}
        stroke="var(--ant-color-primary)"
        stroke-width={3}
        {...props.getResizeHandlerProps(props.direction, getMouseRotate)}
      />
    </>
  )
}

const Vertex: Component<{
  layout: Layout
  direction: 'topLeft' | 'bottomRight' | 'topRight' | 'bottomLeft'
  getRotateHandlerProps: (
    direction: ResizeDirection,
    getMouseRotate: () => number,
  ) => JSX.HTMLAttributes<any>
  getResizeHandlerProps: (
    direction: ResizeDirection,
    getMouseRotate: () => number,
  ) => JSX.HTMLAttributes<any>
}> = props => {
  const prevPoint = createMemo(() => {
    const layout = props.layout
    const point = {
      topLeft: layout.bottomLeftPoint,
      topRight: layout.topLeftPoint,
      bottomRight: layout.topRightPoint,
      bottomLeft: layout.bottomRightPoint,
    }[props.direction]

    return (Array.isArray(point) ? point[1] : point) ?? new DOMPoint()
  })
  const nextPoint = createMemo(() => {
    const layout = props.layout
    const point = {
      topLeft: layout.topRightPoint,
      topRight: layout.bottomRightPoint,
      bottomRight: layout.bottomLeftPoint,
      bottomLeft: layout.topLeftPoint,
    }[props.direction]

    return (Array.isArray(point) ? point[0] : point) ?? new DOMPoint()
  })
  const currentPoint = createMemo(() => {
    const layout = props.layout
    const point = {
      topLeft: layout.topLeftPoint,
      topRight: layout.topRightPoint,
      bottomRight: layout.bottomRightPoint,
      bottomLeft: layout.bottomLeftPoint,
    }[props.direction]

    // 如果 point 不是 DOMPoint 对象，则本组件不需要显示
    return point instanceof DOMPoint ? point : new DOMPoint()
  })

  const startAngle = createMemo(() => getAngleOfDOMPoint(subDOMPoint(nextPoint(), currentPoint())))

  const _endAngle = createMemo(() => getAngleOfDOMPoint(subDOMPoint(prevPoint(), currentPoint())))
  const endAngle = createMemo(() => {
    return _endAngle() < startAngle() ? _endAngle() + Math.PI * 2 : _endAngle()
  })

  const centerAngle = createMemo(() => (startAngle() + endAngle()) / 2)

  const getLayout = (size: number) => {
    const gap = endAngle() - startAngle()
    let _size = gap > Math.PI / 2 ? size / Math.tan(gap / 2) : size
    let translate = {
      x: Math.cos(centerAngle()) * _size,
      y: Math.sin(centerAngle()) * _size,
    }

    const { x, y } = currentPoint()
    const topLeftPoint = new DOMPoint(x + translate.x, y + translate.y)
    const bottomRightPoint = new DOMPoint(x - translate.x, y - translate.y)

    _size = gap > Math.PI / 2 ? size : size * Math.tan(gap / 2)
    const angle = centerAngle() + Math.PI / 2
    translate = {
      x: Math.cos(angle) * _size,
      y: Math.sin(angle) * _size,
    }

    const topRightPoint = new DOMPoint(x + translate.x, y + translate.y)
    const bottomLeftPoint = new DOMPoint(x - translate.x, y - translate.y)

    return {
      topLeftPoint,
      topRightPoint,
      bottomRightPoint,
      bottomLeftPoint,
    }
  }

  const layoutToPathD = (_layout: Layout<DOMPoint>) => {
    const { topLeftPoint, topRightPoint, bottomRightPoint, bottomLeftPoint } = _layout

    return `M ${topLeftPoint.x},${topLeftPoint.y} L ${topRightPoint.x},${topRightPoint.y} L ${bottomRightPoint.x},${bottomRightPoint.y} L ${bottomLeftPoint.x},${bottomLeftPoint.y} Z`
  }

  const rotateSize = 24
  // 旋转部份的 layout
  const rotateLayout = createMemo(() => getLayout(rotateSize))

  // 显示部份的 layout
  const displayLayout = createMemo(() => getLayout(8))

  // 调整尺寸部份的 layout
  const reseizLayout = createMemo(() => {
    const { topLeftPoint, topRightPoint, bottomRightPoint, bottomLeftPoint } = getLayout(
      rotateSize / 2,
    )
    const _rotateLayout = rotateLayout()

    const translate = subDOMPoint(_rotateLayout.bottomRightPoint, bottomRightPoint)

    return {
      topLeftPoint: subDOMPoint(topLeftPoint, translate),
      topRightPoint: subDOMPoint(topRightPoint, translate),
      bottomRightPoint: subDOMPoint(bottomRightPoint, translate),
      bottomLeftPoint: subDOMPoint(bottomLeftPoint, translate),
    }
  })

  const getMouseRotate = () => {
    const layout = props.layout
    // 相对的点
    const oppositePoint = {
      topLeft: layout.bottomRightPoint,
      topRight: layout.bottomLeftPoint,
      bottomRight: layout.topLeftPoint,
      bottomLeft: layout.topRightPoint,
    }[props.direction]

    if (oppositePoint instanceof DOMPoint) {
      return getAngleOfDOMPoint(subDOMPoint(oppositePoint, currentPoint())) + Math.PI / 2
    }

    return centerAngle() + Math.PI / 2
  }

  return (
    <>
      <path
        class="pointer-events-initial cursor-none"
        d={layoutToPathD(rotateLayout())}
        opacity={0}
        fill="red"
        {...props.getRotateHandlerProps(props.direction, getMouseRotate)}
      />

      <path
        class="pointer-events-initial cursor-none"
        d={layoutToPathD(displayLayout())}
        fill="var(--ant-color-white)"
        stroke="var(--ant-color-primary)"
        {...props.getResizeHandlerProps(props.direction, getMouseRotate)}
      />

      <path
        class="pointer-events-initial cursor-none"
        d={layoutToPathD(reseizLayout())}
        opacity={0}
        fill="blue"
        {...props.getResizeHandlerProps(props.direction, getMouseRotate)}
      />
    </>
  )
}

const ParentEdge: Component<{
  layout: Layout
  direction: 'top' | 'bottom' | 'right' | 'left'
}> = props => {
  const startPoint = createMemo(() => {
    const layout = props.layout
    const p = {
      top: layout.topLeftPoint,
      right: layout.topRightPoint,
      bottom: layout.bottomRightPoint,
      left: layout.bottomLeftPoint,
    }[props.direction]

    return (Array.isArray(p) ? p[1] : p) ?? new DOMPoint()
  })
  const endPoint = createMemo(() => {
    const layout = props.layout
    const p = {
      top: layout.topRightPoint,
      right: layout.bottomRightPoint,
      bottom: layout.bottomLeftPoint,
      left: layout.topLeftPoint,
    }[props.direction]

    return (Array.isArray(p) ? p[0] : p) ?? new DOMPoint()
  })

  return (
    <path
      d={`M ${startPoint().x},${startPoint().y} L ${endPoint().x},${endPoint().y}`}
      stroke="var(--ant-color-primary)"
      stroke-width={1}
    />
  )
}

const ParentCenterLine: Component<{
  line: [DOMPoint, DOMPoint] | undefined
}> = props => {
  return (
    <>
      {props.line ? (
        <path
          d={`M ${props.line[0].x},${props.line[0].y} L ${props.line[1].x},${props.line[1].y}`}
          stroke="var(--ant-color-primary)"
          stroke-width={1}
        />
      ) : null}
    </>
  )
}

export default Transformer
