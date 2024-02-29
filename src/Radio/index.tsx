import { type Component, type ParentProps, type JSX, untrack, Show } from 'solid-js'
import cs from 'classnames'
import createControllableValue from '../hooks/createControllableValue'
import Button from './Button'
import Group from './Group'

export interface RadioProps extends ParentProps {
  defaultChecked?: boolean
  checked?: boolean
  onChange?: JSX.ChangeEventHandler<HTMLInputElement, Event>
  disabled?: boolean
}

const Radio: Component<RadioProps> & {
  Group: typeof Group
  Button: typeof Button
} = props => {
  const [checked, setChecked] = createControllableValue(props, {
    defaultValue: false,
    defaultValuePropName: 'defaultChecked',
    valuePropName: 'checked',
    trigger: null,
  })

  return (
    <label
      class={cs(
        'inline-flex cursor-pointer inline-flex items-center',
        props.disabled && 'text-[var(--ant-color-text-disabled)] cursor-not-allowed',
      )}
    >
      <span
        class={cs(
          'w-16px h-16px rounded-50% [border:1px_solid_var(--ant-color-border)]',
          checked() &&
            (props.disabled
              ? 'flex justify-center items-center before:content-empty before:block before:w-8px before:h-8px before:bg-[var(--ant-radio-dot-color-disabled)] before:rounded-50%'
              : '[border:5px_solid_var(--ant-color-primary)]'),
          props.disabled && 'bg-[var(--ant-color-bg-container-disabled)]',
        )}
      >
        <input
          class="m-0 hidden"
          checked={checked()}
          type="radio"
          disabled={props.disabled}
          onInput={e => {
            setChecked(e.target.checked)
            untrack(() => props.onChange?.(e))
          }}
        />
      </span>

      <Show when={props.children}>
        <span class="px-8px">{props.children}</span>
      </Show>
    </label>
  )
}

Radio.Button = Button
Radio.Group = Group

export default Radio
