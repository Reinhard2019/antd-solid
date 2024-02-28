import { type ParentProps, type Component, type JSX, Show } from 'solid-js'
import cs from 'classnames'
import createControllableValue from '../hooks/createControllableValue'
import Group from './Group'

export interface CheckboxProps extends ParentProps {
  defaultChecked?: boolean
  indeterminate?: boolean
  checked?: boolean
  onChange?: JSX.ChangeEventHandler<HTMLInputElement, Event>
  class?: string
  style?: JSX.CSSProperties
}

const Checkbox: Component<CheckboxProps> & {
  Group: typeof Group
} = props => {
  const [checked, setChecked] = createControllableValue(props, {
    defaultValue: false,
    defaultValuePropName: 'defaultChecked',
    valuePropName: 'checked',
    trigger: false,
  })

  return (
    <label
      class={cs('inline-flex cursor-pointer inline-flex items-center', props.class)}
      style={props.style}
    >
      <span
        class={cs(
          'w-16px h-16px rounded-[var(--ant-border-radius-sm)] relative',
          (() => {
            if (props.indeterminate && !checked()) {
              return [
                '[border:1px_solid_var(--ant-color-border)]',
                'after:content-empty after:block after:absolute after:top-1/2 after:left-1/2 after:-translate-1/2 after:w-8px after:h-8px after:bg-[var(--ant-color-primary)]',
              ]
            }
            if (checked()) {
              return [
                'bg-[var(--ant-color-primary)]',
                'after:content-empty after:block after:absolute after:top-[calc(50%-1px)] after:left-1/2 after:-translate-1/2 after:-rotate-45 after:w-10px after:h-6px after:[border:var(--ant-line-width-bold)_solid_white] after:![border-top-width:0] after:![border-right-width:0]',
              ]
            }
            return '[border:1px_solid_var(--ant-color-border)]'
          })(),
        )}
      >
        <input
          class="m-0 hidden"
          type="checkbox"
          onChange={e => {
            e.target.checked = setChecked(v => !v)
            props.onChange?.(e)
          }}
        />
      </span>
      <Show when={props.children}>
        <span class="px-8px">{props.children}</span>
      </Show>
    </label>
  )
}

Checkbox.Group = Group

export default Checkbox
