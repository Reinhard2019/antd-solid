import { createMemo, useContext, type Component } from 'solid-js'
import cs from 'classnames'
import ColorPickerContext from './context'
import Slider from '../Slider'
import Color from './color'

const ColorPickerSlider: Component = () => {
  const context = useContext(ColorPickerContext)
  const color = createMemo(() => context?.color() ?? new Color())

  return (
    <div class="flex gap-[--ant-margin-sm] items-center">
      <div class="flex flex-col gap-[--ant-margin-sm] w-full">
        <Slider
          value={color().toHsv().h / 3.55}
          onChange={v => {
            const hsv = color().toHsv()
            hsv.h = Math.round(v * 3.55)
            context?.setColor(new Color(hsv))
          }}
          tooltip={false}
          handle={() => getSliderHandle(color().toHueRgbString())}
          style={{
            '--ant-slider-rail-size': '8px',
            '--ant-slider-handle-size': '10px',
            '--ant-slider-rail-bg':
              'linear-gradient(90deg, rgb(255, 0, 0) 0%, rgb(255, 255, 0) 17%, rgb(0, 255, 0) 33%, rgb(0, 255, 255) 50%, rgb(0, 0, 255) 67%, rgb(255, 0, 255) 83%, rgb(255, 0, 0) 100%)',
            '--ant-slider-rail-hover-bg': 'var(--ant-slider-rail-bg)',
            '--ant-slider-track-bg': 'transparent',
            '--ant-slider-track-hover-bg': 'transparent',
          }}
          railBgStyle={{
            'box-shadow': 'inset 0 0 1px 0 var(--ant-color-text-quaternary)',
          }}
        />

        <Slider
          value={color().a * 100}
          onChange={v => {
            context?.setColor(
              color()
                .clone()
                .setAlpha(v / 100),
            )
          }}
          min={0}
          step={1}
          tooltip={false}
          handle={() => getSliderHandle(color().toRgbString())}
          style={{
            '--ant-slider-rail-size': '8px',
            '--ant-slider-handle-size': '10px',
            '--ant-slider-rail-bg': `linear-gradient(90deg, ${color().clone().setAlpha(0).toRgbString()} 0%, ${color().toHexString()} 100%)`,
            '--ant-slider-rail-hover-bg': 'var(--ant-slider-rail-bg)',
            '--ant-slider-track-bg': 'transparent',
            '--ant-slider-track-hover-bg': 'transparent',
            'background-image':
              'conic-gradient(var(--ant-color-fill-secondary) 0 25%, transparent 0 50%, var(--ant-color-fill-secondary) 0 75%, transparent 0)',
            'background-size': '8px 8px',
          }}
          railBgStyle={{
            'box-shadow': 'inset 0 0 1px 0 var(--ant-color-text-quaternary)',
          }}
        />
      </div>

      <div
        class="shrink-0 w-28px h-28px rounded-[--ant-border-radius-sm]"
        style={{
          'background-image':
            'conic-gradient(var(--ant-color-fill-secondary) 0 25%, transparent 0 50%, var(--ant-color-fill-secondary) 0 75%, transparent 0)',
          'background-size': '50% 50%',
          'box-shadow': 'inset 0 0 1px 0 var(--ant-color-text-quaternary)',
        }}
      >
        <div
          class="w-full h-full rounded-inherit"
          style={{
            'background-color': color().toRgbString(),
          }}
        />
      </div>
    </div>
  )
}

const getSliderHandle = (bgColor: string) => {
  return (
    <div
      class={cs(
        'box-border w-[--ant-slider-handle-size] h-[--ant-slider-handle-size] rounded-1/2 border-solid border-2px border-[--ant-color-bg-container-secondary] cursor-pointer',
        '[box-shadow:inset_0_0_1px_0_var(--ant-color-text-quaternary),0_0_0_1px_var(--ant-color-fill-secondary)]',
        'focus:[box-shadow:inset_0_0_1px_0_var(--ant-color-text-quaternary),0_0_0_1px_var(--ant-color-primary-active)]',
      )}
      style={{
        background: bgColor,
      }}
      tabIndex="0"
    />
  )
}

export default ColorPickerSlider
