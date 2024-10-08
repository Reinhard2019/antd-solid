import { type Component, type JSX } from 'solid-js'
import cs from 'classnames'
import createControllableValue from '../hooks/createControllableValue'
import { type RadioProps } from '.'
import { wave } from '../utils/animation'
import Element from '../Element'
import { type ComponentSize } from '../types'

const Button: Component<
RadioProps & {
  size: ComponentSize
}
> = props => {
  let input: HTMLInputElement | undefined

  const [checked, setChecked] = createControllableValue(props, {
    defaultValue: false,
    defaultValuePropName: 'defaultChecked',
    valuePropName: 'checked',
    trigger: null,
  })

  return (
    <Element<JSX.LabelHTMLAttributes<HTMLLabelElement>>
      tag="label"
      class={cs(
        'relative px-[--ant-radio-button-padding] h-[--ant-radio-button-height] [border:1px_solid_var(--ant-color-border)] first:rounded-l-[--ant-radio-button-border-radius] last:rounded-r-[--ant-radio-button-border-radius] cursor-pointer flex-grow not[:first-child]:-ml-1px flex justify-center items-center [font-size:var(--ant-radio-button-font-size)]',
        checked() &&
          cs(
            props.disabled
              ? 'bg-[var(--ant-radio-button-checked-bg-disabled)]'
              : 'text-[var(--ant-color-primary)] [border:1px_solid_var(--ant-color-primary)] z-1',
          ),
        props.disabled
          ? 'cursor-not-allowed [border:1px_solid_var(--ant-color-border)] bg-[var(--ant-color-bg-container-disabled)] text-[var(--ant-color-text-disabled)]'
          : 'hover:text-[var(--ant-color-primary)]',
      )}
      onClick={e => {
        if (e.target === input) return
        wave(e.currentTarget, 'var(--ant-color-primary)')
      }}
      style={{
        '--ant-radio-button-padding': {
          small: '7px',
          middle: '15px',
          large: '15px',
        }[props.size],
        '--ant-radio-button-height': {
          small: '24px',
          middle: '32px',
          large: '40px',
        }[props.size],
        '--ant-radio-button-font-size': {
          small: 'var(--ant-font-size)',
          middle: 'var(--ant-font-size)',
          large: 'var(--ant-font-size-lg)',
        }[props.size],
        '--ant-radio-button-border-radius': {
          small: 'var(--ant-border-radius-sm)',
          middle: 'var(--ant-border-radius)',
          large: 'var(--ant-border-radius-lg)',
        }[props.size],
      }}
    >
      <input
        ref={input}
        class="hidden"
        checked={checked()}
        type="radio"
        disabled={props.disabled}
        onInput={e => {
          setChecked(e.target.checked)
          props.onChange?.(e)
        }}
      />

      <span>{props.children}</span>
    </Element>
  )
}

export default Button
