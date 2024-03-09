import { type Component } from 'solid-js'
import cs from 'classnames'
import createControllableValue from '../hooks/createControllableValue'
import { type RadioProps } from '.'
import { wave } from '../utils/animation'

const Button: Component<RadioProps> = props => {
  let input: HTMLInputElement | undefined

  const [checked, setChecked] = createControllableValue(props, {
    defaultValue: false,
    defaultValuePropName: 'defaultChecked',
    valuePropName: 'checked',
    trigger: null,
  })

  return (
    <label
      class={cs(
        'relative px-15px h-32px [border:1px_solid_rgb(217,217,217)] first:rounded-l-6px last:rounded-r-6px cursor-pointer flex-grow not[:first-child]:-ml-1px flex justify-center items-center',
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
    </label>
  )
}

export default Button
