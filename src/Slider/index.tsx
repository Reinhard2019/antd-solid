import {
  createSignal,
  type Component,
  mergeProps,
  createMemo,
  createEffect,
  onCleanup,
  children,
  Show,
  type JSX,
  type JSXElement,
} from 'solid-js'
import cs from 'classnames'
import { clamp, isNil } from 'lodash-es'
import NP from 'number-precision'
import createControllableValue from '../hooks/createControllableValue'
import Tooltip from '../Tooltip'
import useHover from '../hooks/useHover'
import useFocus from '../hooks/useFocus'
import Element from '../Element'
import { type StringOrJSXElement, type StyleProps } from '../types'
import { unwrapStringOrJSXElement } from '../utils/solid'

export interface SliderProps extends StyleProps {
  defaultValue?: number | null
  value?: number | null
  /**
   * 当 Slider 的值发生改变时，会触发 onChange 事件，并把改变后的值作为参数传入
   */
  onChange?: (value: number) => void
  /**
   * 与 mouseup 和 keyup 触发时机一致，把当前值作为参数传入
   */
  onChangeComplete?: (value: number) => void
  disabled?: boolean
  /**
   * 最大值
   * 默认 100
   */
  max?: number
  /**
   * 最大值
   * 默认 0
   */
  min?: number
  /**
   * 步长
   * 默认 1
   */
  step?: number
  /**
   * 是否展示 tooltip
   * 默认 true
   */
  tooltip?:
  | boolean
  | {
    formatter?: (value: number) => JSXElement
  }
  /**
   * 抓取点元素
   */
  handle?: StringOrJSXElement
  /**
   * 轨道背景色元素的 style
   */
  railBgStyle?: JSX.CSSProperties
}

const Slider: Component<SliderProps> = _props => {
  let containerRef: HTMLDivElement | undefined
  let handleRef: HTMLDivElement | undefined

  const props = mergeProps({ min: 0, max: 100, step: 1, tooltip: true }, _props)
  const [_value, _setValue] = createControllableValue<number>(props)
  const value = createMemo(() =>
    clamp(typeof _value() === 'number' ? _value() : 0, props.min, props.max),
  )
  const setValue = (v: number) => {
    const _v = clamp(NP.times(Math.round(v / props.step), props.step), props.min, props.max)
    _setValue(_v)
  }
  const gap = createMemo(() => props.max - props.min)
  const progress = createMemo(() => (value() - props.min) / gap())
  const isHover = useHover(() => handleRef)
  const isFocus = useFocus(() => handleRef)
  const [isDragging, setIsDragging] = createSignal(false)
  const resolvedHandle = children(() => unwrapStringOrJSXElement(props.handle))

  // 注册键盘监听
  createEffect(() => {
    if (props.disabled) return

    const onKeydown = (e: KeyboardEvent) => {
      if (document.activeElement !== handleRef) return

      switch (e.code) {
        case 'ArrowLeft':
        case 'ArrowDown':
          e.preventDefault()
          setValue(NP.minus(value(), props.step))
          break
        case 'ArrowRight':
        case 'ArrowUp':
          e.preventDefault()
          setValue(NP.plus(value(), props.step))
          e.preventDefault()
          break
      }
    }

    window.addEventListener('keydown', onKeydown)

    onCleanup(() => {
      window.removeEventListener('keydown', onKeydown)
    })
  })

  return (
    <Element
      ref={containerRef}
      class={cs(props.class, 'relative cursor-pointer', props.disabled && 'cursor-not-allowed')}
      style={{
        '--ant-slider-rail-size': '4px', // 轨道高度
        '--ant-slider-handle-size': '14px', // 抓取点元素大小
        '--ant-slider-rail-bg': 'var(--ant-color-fill-tertiary)',
        '--ant-slider-rail-hover-bg': 'var(--ant-color-fill-secondary)',
        '--ant-slider-track-bg': 'var(--ant-color-primary-border)',
        '--ant-slider-track-hover-bg': 'var(--ant-color-primary-border-hover)',
        padding: 'calc((var(--ant-slider-handle-size) - var(--ant-slider-rail-size)) / 2) 0',
        ...props.style,
      }}
    >
      <div
        class={cs(props.disabled && 'pointer-events-none')}
        onClick={e => {
          const handleWidth = handleRef?.offsetWidth ?? 0
          const halfHandleWidth = handleWidth / 2
          const offsetX = clamp(
            e.offsetX - halfHandleWidth,
            0,
            containerRef!.offsetWidth - handleWidth,
          )
          setValue(props.min + (offsetX / (containerRef!.offsetWidth - handleWidth)) * gap())
        }}
      >
        {/* 背景轨道 */}
        <div
          class={cs(
            '[background:var(--ant-slider-rail-bg)] h-[--ant-slider-rail-size] rounded-[calc(var(--ant-slider-rail-size)/2)]',
            !props.disabled && 'hover:[background:var(--ant-slider-rail-hover-bg)]',
          )}
          style={props.railBgStyle}
        />
        {/* track 轨道 */}
        <div
          class={cs(
            'absolute left-0 top-1/2 -translate-y-1/2 h-[--ant-slider-rail-size] rounded-[calc(var(--ant-slider-rail-size)/2)]',
            props.disabled
              ? 'bg-[var(--ant-slider-track-bg-disabled)]'
              : ['bg-[var(--ant-slider-track-bg)] hover:bg-[var(--ant-slider-track-hover-bg)]'],
          )}
          style={{
            width: `${progress() * 100}%`,
          }}
        />
        {/* handle 轨道 */}
        <div class="absolute left-[calc(var(--ant-slider-handle-size)/2)] right-[calc(var(--ant-slider-handle-size)/2)] top-1/2 -translate-y-1/2">
          <Tooltip
            open={props.tooltip && (isHover() || isFocus() || isDragging())}
            content={
              typeof props.tooltip === 'object' && props.tooltip.formatter
                ? props.tooltip.formatter(value())
                : value()
            }
          >
            <div
              ref={handleRef}
              class="absolute top-1/2 -translate-1/2 w-[--ant-slider-handle-size] h-[--ant-slider-handle-size]"
              style={{
                left: `${progress() * 100}%`,
              }}
              onClick={e => {
                e.stopPropagation()
              }}
              onMouseDown={e => {
                const startX = e.clientX
                const startValue = value()
                setIsDragging(true)

                const handleWidth = handleRef!.offsetWidth

                const onMouseMove = (_e: MouseEvent) => {
                  const moveX = _e.clientX - startX
                  setValue(startValue + (moveX / (containerRef!.offsetWidth - handleWidth)) * gap())
                }
                window.addEventListener('mousemove', onMouseMove)

                const onMouseUp = () => {
                  window.removeEventListener('mousemove', onMouseMove)
                  window.removeEventListener('mouseup', onMouseUp)
                  props.onChangeComplete?.(value())
                  setIsDragging(false)
                }
                window.addEventListener('mouseup', onMouseUp)
              }}
            >
              <Show when={isNil(resolvedHandle())} fallback={resolvedHandle()}>
                <div
                  class={cs(
                    'box-border w-full h-full bg-[--ant-color-bg-container-secondary] rounded-1/2 border-solid border-2px cursor-pointer',
                    props.disabled
                      ? 'border-[var(--ant-slider-handle-color-disabled)]'
                      : [
                        'border-[var(--ant-slider-handle-color)]',
                        'hover:border-[var(--ant-slider-handle-active-color)] hover:[outline:4px_solid_var(--ant-control-outline)]',
                        'focus:border-[var(--ant-slider-handle-active-color)] focus:[outline:4px_solid_var(--ant-control-outline)]',
                      ],
                  )}
                  tabIndex={props.disabled ? undefined : '0'}
                />
              </Show>
            </div>
          </Tooltip>
        </div>
      </div>
    </Element>
  )
}

export default Slider
