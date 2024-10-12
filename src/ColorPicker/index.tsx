import cs from 'classnames'
import { type Component, createMemo, createRenderEffect, createSignal, Show } from 'solid-js'
import Color from './color'
import Element from '../Element'
import Popover from '../Popover'
import createControllableValue from '../hooks/createControllableValue'
import ColorPickerSelect from './ColorPickerSelect'
import ColorPickerContext from './context'
import ColorPickerSlider from './ColorPickerSlider'
import ColorPickerInput from './ColorPickerInput'
import { type ComponentSize } from '../types'
import useComponentSize from '../hooks/useComponentSize'

export interface ColorPickerProps {
  defaultValue?: string | null
  value?: string | null
  /**
   * @param value Hex 格式
   * @returns
   */
  onChange?: (value: string | null) => void
  allowClear?: boolean
  disabled?: boolean
  /**
   * 禁止透明度
   */
  disabledAlpha?: boolean
  /**
   * 大小，提供 large middle 和 small 三种大小
   * 默认 'middle'
   */
  size?: ComponentSize
}

const ColorPicker: Component<ColorPickerProps> = props => {
  const [colorStr] = createControllableValue<string>(props, {
    trigger: null,
  })
  const [color, _setColor] = createSignal(new Color())
  createRenderEffect(() => {
    _setColor(new Color(colorStr()))
  })
  const disabledAlpha = createMemo(() => !!props.disabledAlpha)
  const setColor = (value: Color) => {
    _setColor(value)
    props.onChange?.(
      value.isValid ? (disabledAlpha() ? value.toHexString() : value.toHex8String()) : null,
    )
  }
  const [open, setOpen] = createSignal(false)
  const size = useComponentSize(() => props.size)

  const getPopoverContent = (close: () => void) => (
    <ColorPickerContext.Provider
      value={{
        color,
        setColor,
        disabledAlpha,
      }}
    >
      <Show when={props.allowClear}>
        <div class="flex justify-end mb-[--ant-margin-xs]">
          <div
            class="w-24px h-24px rounded-[--ant-border-radius-sm] relative overflow-hidden border-1px border-solid border-[--ant-color-split] cursor-pointer hover:border-[--ant-color-border]"
            onClick={() => {
              setColor(new Color())
              close()
            }}
          >
            <div class="absolute top-1/2 left-1/2 -translate-1/2 w-200% h-2px bg-[--ant-color-error] rotate-135deg" />
          </div>
        </div>
      </Show>

      <div class="w-234px flex flex-col gap-[--ant-margin-sm]">
        <ColorPickerSelect />

        <ColorPickerSlider />

        <ColorPickerInput />
      </div>
    </ColorPickerContext.Provider>
  )

  return (
    <Popover
      open={open()}
      onOpenChange={setOpen}
      trigger={props.disabled ? [] : ['click']}
      content={getPopoverContent}
      placement="bottomLeft"
    >
      <Element class={cs('inline-block', props.disabled && 'cursor-not-allowed')}>
        <div
          class={cs(
            'p-[calc(var(--ant-padding-xxs)-var(--border-width))] border-width-[--border-width] border-[--ant-color-border] border-solid rounded-[--ant-border-radius] cursor-pointer hover:border-[--ant-color-primary-hover]',
            open() && '!border-[--ant-color-primary-active]',
            props.disabled && 'pointer-events-none bg-[--ant-color-bg-container-disabled]',
          )}
          style={{
            '--border-width': '1px',
            '--inner-size': {
              small: '16px',
              middle: '24px',
              large: '32px',
            }[size()],
          }}
        >
          <Show
            when={color().isValid}
            fallback={
              <div
                class={cs(
                  'w-[--inner-size] h-[--inner-size] rounded-[--ant-border-radius-sm] relative overflow-hidden border-1px border-solid border-[--ant-color-split]',
                )}
              >
                <div class="absolute top-1/2 left-1/2 -translate-1/2 w-200% h-2px bg-[--ant-color-error] rotate-135deg" />
              </div>
            }
          >
            <div
              class={cs(
                'w-[--inner-size] h-[--inner-size] rounded-[--ant-border-radius-sm] overflow-hidden',
              )}
              style={{
                'box-shadow': 'inset 0 0 1px 0 var(--ant-color-text-quaternary)',
                'background-image':
                  'conic-gradient(var(--ant-color-fill-secondary) 0 25%, transparent 0 50%, var(--ant-color-fill-secondary) 0 75%, transparent 0)',
                'background-size': '50% 50%',
              }}
            >
              <div
                class="w-full h-full"
                style={{
                  'box-shadow': 'inset 0 0 0 var(--ant-line-width) var(--ant-color-fill-secondary)',
                  'background-color': color().toRgbString(),
                }}
              />
            </div>
          </Show>
        </div>
      </Element>
    </Popover>
  )
}

export default ColorPicker
