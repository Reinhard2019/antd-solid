import { Show, createMemo, createSignal, mergeProps, type Component, type JSX } from 'solid-js'
import cs from 'classnames'
import { inRange } from 'lodash-es'
import { Portal } from 'solid-js/web'
import NP from 'number-precision'
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
  const adsorbGap = createMemo(() => (props.adsorb ? props.adsorb.gap ?? 5 : 0))

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
  const rotateMove = (point: [number, number], _parentRotation: number) => {
    // 将超出[0, 360]范围的角度转换为[0, 360]
    const parentRotation =
      _parentRotation >= 0
        ? _parentRotation % (Math.PI * 2)
        : Math.PI * 2 + (_parentRotation % (Math.PI * 2))

    let x = point[0]
    let y = point[1]
    if (parentRotation !== 0) {
      const clientYRatio =
        inRange(parentRotation, 0, Math.PI / 2) || inRange(parentRotation, Math.PI, Math.PI * 1.5)
          ? 1
          : -1
      x = point[0] * Math.cos(parentRotation) + point[1] * Math.cos(parentRotation) * clientYRatio
      y = -point[0] * Math.sin(parentRotation) + point[1] * Math.sin(parentRotation) * clientYRatio
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
    const startOffsetX = startTranslateX - startClientX
    const startOffsetY = startTranslateY - startClientY

    const onMouseMove = (_e: MouseEvent) => {
      const [clientX, clientY] = rotateMove([_e.clientX, _e.clientY], parentRotation)
      const changedValue = {
        x: startOffsetX + clientX,
        y: startOffsetY + clientY,
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
      setAdsorbLine({})
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
      const changedValue: Partial<TransformValue> = {}
      const [_movementX, _movementY] = rotateMove([_e.movementX, _e.movementY], parentRotation)
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
            ? _movementX
            : -_movementX
        changedValue.x =
          value().x -
          (direction === 'left' || direction === 'topLeft' || direction === 'bottomLeft'
            ? movementX
            : 0)
        changedValue.width = value().width + movementX
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
            ? _movementY
            : -_movementY
        changedValue.y =
          value().y -
          (direction === 'top' || direction === 'topLeft' || direction === 'topRight'
            ? movementY
            : 0)
        changedValue.height = value().height + movementY
      }

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
      props.onRotate?.({ rotate })
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
    <Element class="absolute">
      <div
        ref={container}
        class={cs(
          'border-2px border-solid border-white shadow-[var(--ant-transformer-box-shadow)] absolute box-content',
        )}
        style={{
          '--ant-transformer-box-shadow':
            '2px 2px 2px 0 rgba(0,0,0,.12),-2px -2px 2px 0 rgba(0,0,0,.12)',
          width: `${value().width}px`,
          height: `${value().height}px`,
          'border-width': `${borderWidth}px`,
          'transform-origin': `${value().x + value().width / 2}px ${value().y + value().height / 2}px`,
          transform: `rotate(${value().rotate}deg) translate(${value().x - borderWidth}px, ${value().y - borderWidth}px)`,
        }}
        onMouseDown={onMoveMouseDown}
      >
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
      </div>

      <Show when={adsorbLine()?.left}>
        <div
          class="absolute w-2px bg-[--ant-color-primary]"
          style={{
            transform: 'translateX(-50%)',
            height: `${props.adsorb?.height ?? 0}px`,
          }}
        />
      </Show>
      <Show when={adsorbLine()?.right}>
        <div
          class="absolute -left-1px w-2px bg-[--ant-color-primary]"
          style={{
            transform: `translateX(calc(${props.adsorb?.width ?? 0}px - 50%))`,
            height: `${props.adsorb?.height ?? 0}px`,
          }}
        />
      </Show>
      <Show when={adsorbLine()?.centerX}>
        <div
          class="absolute w-2px bg-[--ant-color-primary]"
          style={{
            transform: `translateX(calc(${(props.adsorb?.width ?? 0) / 2}px - 50%))`,
            height: `${props.adsorb?.height ?? 0}px`,
          }}
        />
      </Show>
      <Show when={adsorbLine()?.top}>
        <div
          class="absolute h-2px bg-[--ant-color-primary]"
          style={{ transform: 'translateY(-50%)', width: `${props.adsorb?.width ?? 0}px` }}
        />
      </Show>
      <Show when={adsorbLine()?.bottom}>
        <div
          class="absolute h-2px bg-[--ant-color-primary]"
          style={{
            transform: `translateY(calc(${props.adsorb?.height ?? 0}px - 50%))`,
            width: `${props.adsorb?.width ?? 0}px`,
          }}
        />
      </Show>
      <Show when={adsorbLine()?.centerY}>
        <div
          class="absolute h-2px bg-[--ant-color-primary]"
          style={{
            transform: `translateY(calc(${(props.adsorb?.height ?? 0) / 2}px - 50%))`,
            width: `${props.adsorb?.width ?? 0}px`,
          }}
        />
      </Show>
    </Element>
  )
}

export default Transformer
