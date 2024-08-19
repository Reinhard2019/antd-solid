import cs from 'classnames'
import { type Component, createRenderEffect, createSignal, Show } from 'solid-js'
import Color from './color'
import Element from '../Element'
import Popover from '../Popover'
import createControllableValue from '../hooks/createControllableValue'
import ColorPickerSelect from './ColorPickerSelect'
import ColorPickerContext from './context'
import ColorPickerSlider from './ColorPickerSlider'
import ColorPickerInput from './ColorPickerInput'

export interface ColorPickerProps {
  defaultValue?: string | null
  value?: string | null
  /**
   * @param value Hex 格式
   * @returns
   */
  onChange?: (value: string | null) => void
  allowClear?: boolean
}

const ColorPicker: Component<ColorPickerProps> = props => {
  const [colorStr] = createControllableValue<string>(props, {
    trigger: null,
  })
  const [color, _setColor] = createSignal(new Color())
  createRenderEffect(() => {
    _setColor(new Color(colorStr()))
  })
  const setColor = (value: Color) => {
    _setColor(value)
    props.onChange?.(value.isValid ? value.toHex8String() : null)
  }
  const [open, setOpen] = createSignal(false)

  const getPopoverContent = (close: () => void) => (
    <ColorPickerContext.Provider
      value={{
        color,
        setColor,
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
      trigger={'click'}
      content={getPopoverContent}
      placement="bottomLeft"
    >
      <Element
        class={cs(
          'p-[--ant-padding-xxs] inline-block border-1px border-[--ant-color-border] border-solid rounded-[--ant-border-radius] cursor-pointer',
          'hover:border-[--ant-color-primary-hover]',
          open() && '!border-[--ant-color-primary-active]',
        )}
      >
        <Show
          when={color().isValid}
          fallback={
            <div class="w-24px h-24px rounded-[--ant-border-radius-sm] relative overflow-hidden border-1px border-solid border-[--ant-color-split]">
              <div class="absolute top-1/2 left-1/2 -translate-1/2 w-200% h-2px bg-[--ant-color-error] rotate-135deg" />
            </div>
          }
        >
          <div
            class="w-24px h-24px rounded-[--ant-border-radius-sm] overflow-hidden"
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
      </Element>
    </Popover>
  )
}

export default ColorPicker
