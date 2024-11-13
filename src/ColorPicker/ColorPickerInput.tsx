import {
  createMemo,
  createSignal,
  useContext,
  type Component,
  Switch,
  Match,
  createRenderEffect,
  Show,
} from 'solid-js'
import ColorPickerContext from './context'
import Select from '../Select'
import Input from '../Input'
import InputNumber from '../InputNumber'
import Color from './color'

const ColorPickerInput: Component = () => {
  const context = useContext(ColorPickerContext)
  const color = createMemo(() => context?.color() ?? new Color())
  const [type, setType] = createSignal<'HEX' | 'HSV' | 'RGB'>('HEX')
  const [hexInputValue, setHexInputValue] = createSignal('')
  createRenderEffect(() => {
    setHexInputValue(color().toHex())
  })

  return (
    <div class="flex">
      <Select
        value={type()}
        onChange={setType}
        options={[
          {
            label: 'HEX',
            value: 'HEX',
          },
          {
            label: 'HSV',
            value: 'HSV',
          },
          {
            label: 'RGB',
            value: 'RGB',
          },
        ]}
        size="small"
        variant="borderless"
        style={{
          'margin-right': 'var(--ant-margin-xs)',
          '--ant-select-font-size': '12px',
          '--ant-select-input-padding': '0',
          '--ant-select-input-addon-after-padding': '0 0 0 var(--ant-padding-xxs)',
          '--ant-select-popup-match-width': '60px',
        }}
      />
      <Switch>
        <Match when={type() === 'HEX'}>
          <Input
            size="small"
            value={hexInputValue()}
            onChange={e => {
              const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '')

              if (value.length > 6) return

              setHexInputValue(value)

              if (value.length !== 6) return

              const c = new Color(value)
              if (!c.isValid) return

              context?.setColor(new Color(value).setAlpha(color().a))
            }}
            onBlur={() => {
              setHexInputValue(color().toHex())
              context?.setColor(color(), true)
            }}
            prefix={<span class="text-[--ant-color-text-placeholder]">#</span>}
            style={{
              '--ant-input-font-size': '12px',
            }}
          />
        </Match>
        <Match when={type() === 'HSV'}>
          <div class="flex grow-1 gap-[var(--ant-margin-xxs)]">
            <InputNumber
              size="small"
              value={Math.round(color().toHsv().h)}
              onChange={value => {
                const hsv = color().toHsv()
                hsv.h = value ?? 0
                context?.setColor(new Color(hsv))
              }}
              onBlur={() => {
                context?.setColor(color(), true)
              }}
              min={0}
              max={359}
              precision={0}
              style={InputNumberStyle}
            />
            <InputNumber
              size="small"
              value={Math.round(color().toHsv().s * 100)}
              onChange={value => {
                const hsv = color().toHsv()
                hsv.s = (value ?? 0) / 100
                context?.setColor(new Color(hsv))
              }}
              onBlur={() => {
                context?.setColor(color(), true)
              }}
              min={0}
              max={100}
              precision={0}
              formatter={value => `${value || 0}%`}
              style={InputNumberStyle}
            />
            <InputNumber
              size="small"
              value={Math.round(color().toHsv().v * 100)}
              onChange={value => {
                const hsv = color().toHsv()
                hsv.v = (value ?? 0) / 100
                context?.setColor(new Color(hsv))
              }}
              onBlur={() => {
                context?.setColor(color(), true)
              }}
              min={0}
              max={100}
              precision={0}
              formatter={value => `${value || 0}%`}
              style={InputNumberStyle}
            />
          </div>
        </Match>
        <Match when={type() === 'RGB'}>
          <div class="flex grow-1 gap-[var(--ant-margin-xxs)]">
            <InputNumber
              size="small"
              value={Math.round(color().r as number)}
              onChange={value => {
                const rgb = color().toRgb()
                rgb.r = value ?? 0
                context?.setColor(new Color(rgb))
              }}
              onBlur={() => {
                context?.setColor(color(), true)
              }}
              min={0}
              max={255}
              precision={0}
              style={InputNumberStyle}
            />
            <InputNumber
              size="small"
              value={Math.round(color().g as number)}
              onChange={value => {
                const rgb = color().toRgb()
                rgb.g = value ?? 0
                context?.setColor(new Color(rgb))
              }}
              onBlur={() => {
                context?.setColor(color(), true)
              }}
              min={0}
              max={255}
              precision={0}
              style={InputNumberStyle}
            />
            <InputNumber
              size="small"
              value={Math.round(color().b as number)}
              onChange={value => {
                const rgb = color().toRgb()
                rgb.b = value ?? 0
                context?.setColor(new Color(rgb))
              }}
              onBlur={() => {
                context?.setColor(color(), true)
              }}
              min={0}
              max={255}
              precision={0}
              style={InputNumberStyle}
            />
          </div>
        </Match>
      </Switch>

      <Show when={!context?.disabledAlpha()}>
        <InputNumber
          value={Math.round(color().a * 100)}
          onChange={value => {
            context?.setColor(
              color()
                .clone()
                .setAlpha((value ?? 0) / 100),
            )
          }}
          onBlur={() => {
            context?.setColor(color(), true)
          }}
          size="small"
          min={0}
          max={100}
          precision={0}
          formatter={value => `${value || 0}%`}
          style={{
            ...InputNumberStyle,
            'margin-left': 'var(--ant-margin-xxs)',
          }}
        />
      </Show>
    </div>
  )
}

const InputNumberStyle = {
  width: '43px',
  'flex-shrink': 0,
  'flex-grow': 1,
  '--ant-input-number-handle-width': '16px',
  '--ant-input-padding': '0 0 0 4px',
  '--ant-input-font-size': '12px',
}

export default ColorPickerInput
