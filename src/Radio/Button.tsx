import { type Component } from 'solid-js'
import cs from 'classnames'
import createControllableValue from '../hooks/createControllableValue'
import { type RadioProps } from '.'
import { wave } from '../utils/animation'

const Button: Component<RadioProps> = props => {
  const [checked, setChecked] = createControllableValue(props, {
    defaultValue: false,
    defaultValuePropName: 'defaultChecked',
    valuePropName: 'checked',
    trigger: null,
  })

  return (
    <label
      class={cs(
        'relative h-32px [border:1px_solid_rgb(217,217,217)] first:rounded-l-6px last:rounded-r-6px cursor-pointer flex-grow not[:first-child]:-ml-1px',
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
    >
      <input
        class="hidden"
        checked={checked()}
        type="radio"
        disabled={props.disabled}
        onInput={e => {
          setChecked(e.target.checked)
          props.onChange?.(e)
        }}
      />
      <span
        class="inline-flex items-center justify-center px-15px absolute inset-0 rounded-inherit"
        onClick={e => {
          wave(e.currentTarget, 'var(--ant-color-primary)')
        }}
      >
        {props.children}
      </span>
    </label>
  )
}

export default Button
