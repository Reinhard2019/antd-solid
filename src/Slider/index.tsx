import {
  createSignal,
  type Component,
  mergeProps,
  createMemo,
  createEffect,
  onCleanup,
  useContext,
} from 'solid-js'
import cs from 'classnames'
import { clamp } from 'lodash-es'
import NP from 'number-precision'
import createControllableValue from '../hooks/createControllableValue'
import Tooltip from '../Tooltip'
import useHover from '../hooks/useHover'
import useFocus from '../hooks/useFocus'
import ConfigProviderContext from '../ConfigProvider/context'

export interface SliderProps {
  defaultValue?: number
  value?: number
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
}

const Slider: Component<SliderProps> = _props => {
  const { cssVariables } = useContext(ConfigProviderContext)

  let container: HTMLDivElement | undefined
  let handle: HTMLDivElement | undefined

  const props = mergeProps({ min: 0, max: 100, step: 1 }, _props)
  const [_value, setValue] = createControllableValue<number>(props)
  const value = createMemo(() =>
    clamp(typeof _value() === 'number' ? _value() : 0, props.min, props.max),
  )
  const gap = createMemo(() => props.max - props.min)
  const progress = createMemo(() => ((value() - props.min) / gap()) * 100)
  const isHover = useHover(() => handle)
  const isFocus = useFocus(() => handle)
  const [isDragging, setIsDragging] = createSignal(false)

  const stepFormatter = (v: number) => NP.times(Math.floor(NP.divide(v, props.step)), props.step)

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
    <div
      ref={container}
      class={cs('py-4px mx-5px my-11px relative', props.disabled && 'cursor-not-allowed')}
      style={cssVariables()}
    >
      <div
        class={cs(
          'bg-[var(--ant-slider-rail-bg)] h-4px rounded-[var(--ant-border-radius-xs)]',
          !props.disabled && 'hover:bg-[var(--ant-slider-rail-hover-bg)]',
        )}
      />
      <div
        class={cs(
          'absolute left-0 top-1/2 -translate-y-1/2 h-4px rounded-[var(--ant-border-radius-xs)]',
          props.disabled
            ? 'bg-[var(--ant-slider-track-bg-disabled)]'
            : ['bg-[var(--ant-slider-track-bg)] hover:bg-[var(--ant-slider-track-hover-bg)]'],
        )}
        style={{
          width: `${progress()}%`,
        }}
      />
      <Tooltip open={isHover() || isFocus() || isDragging()} content={value()}>
        <div
          ref={handle}
          class={cs(
            'absolute top-1/2 -translate-1/2 box-content w-10px h-10px bg-[var(--ant-color-bg-elevated)] rounded-1/2 border-solid border-2px cursor-pointer',
            props.disabled
              ? 'border-[var(--ant-slider-handle-color-disabled)]'
              : [
                'border-[var(--ant-slider-handle-color)]',
                'hover:w-12px hover:h-12px hover:border-4px hover:border-[var(--ant-slider-handle-active-color)]',
                'focus:w-12px focus:h-12px focus:border-4px focus:border-[var(--ant-slider-handle-active-color)]',
              ],
          )}
          style={{
            left: `${progress()}%`,
          }}
          tabIndex={props.disabled ? undefined : '0'}
          onMouseDown={e => {
            if (props.disabled) return

            const startX = e.clientX
            const startValue = value()
            setIsDragging(true)

            const onMouseMove = (_e: MouseEvent) => {
              const moveX = _e.clientX - startX
              setValue(stepFormatter(startValue + (moveX / container!.clientWidth) * gap()))
            }
            window.addEventListener('mousemove', onMouseMove)

            const onMouseUp = () => {
              window.removeEventListener('mousemove', onMouseMove)
              window.removeEventListener('mouseup', onMouseUp)
              setIsDragging(false)
            }
            window.addEventListener('mouseup', onMouseUp)
          }}
        />
      </Tooltip>
    </div>
  )
}

export default Slider
