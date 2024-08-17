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
  onChange?: (value: number) => void
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
  tooltip?: boolean
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
  let container: HTMLDivElement | undefined
  let handle: HTMLDivElement | undefined

  const props = mergeProps({ min: 0, max: 100, step: 1, tooltip: true }, _props)
  const [_value, setValue] = createControllableValue<number>(props)
  const value = createMemo(() =>
    clamp(typeof _value() === 'number' ? _value() : 0, props.min, props.max),
  )
  const gap = createMemo(() => props.max - props.min)
  const progress = createMemo(() => ((value() - props.min) / gap()) * 100)
  const isHover = useHover(() => handle)
  const isFocus = useFocus(() => handle)
  const [isDragging, setIsDragging] = createSignal(false)
  const resolvedHandle = children(() => unwrapStringOrJSXElement(props.handle))

  const stepFormatter = (v: number) => NP.times(Math.floor(v / props.step), props.step)

  // 注册键盘监听
  createEffect(() => {
    if (props.disabled) return

    const onKeydown = (e: KeyboardEvent) => {
      if (document.activeElement !== handle) return

      switch (e.code) {
        case 'ArrowLeft':
        case 'ArrowDown':
          e.preventDefault()
          setValue(stepFormatter(NP.minus(value(), props.step)))
          break
        case 'ArrowRight':
        case 'ArrowUp':
          e.preventDefault()
          setValue(stepFormatter(NP.plus(value(), props.step)))
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
      ref={container}
      class={cs(props.class, 'relative', props.disabled && 'cursor-not-allowed')}
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
          width: `${progress()}%`,
        }}
      />
      {/* handle 轨道 */}
      <div class="absolute left-[calc(var(--ant-slider-handle-size)/2)] right-[calc(var(--ant-slider-handle-size)/2)] top-1/2 -translate-y-1/2">
        <Tooltip open={props.tooltip && (isHover() || isFocus() || isDragging())} content={value()}>
          <div
            ref={handle}
            class="absolute top-1/2 -translate-1/2 w-[--ant-slider-handle-size] h-[--ant-slider-handle-size]"
            style={{
              left: `${progress()}%`,
            }}
            onMouseDown={e => {
              if (props.disabled) return

              const startX = e.clientX
              const startValue = value()
              setIsDragging(true)

              const handleClientWidth = e.currentTarget.clientWidth

              const onMouseMove = (_e: MouseEvent) => {
                const moveX = _e.clientX - startX
                console.log('handleClientWidth', handleClientWidth)
                setValue(
                  stepFormatter(
                    startValue + (moveX / (container!.clientWidth - handleClientWidth)) * gap(),
                  ),
                )
              }
              window.addEventListener('mousemove', onMouseMove)

              const onMouseUp = () => {
                window.removeEventListener('mousemove', onMouseMove)
                window.removeEventListener('mouseup', onMouseUp)
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
    </Element>
  )
}

export default Slider
