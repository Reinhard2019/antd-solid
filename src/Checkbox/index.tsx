import { type ParentProps, type Component, type JSX, Show } from 'solid-js'
import cs from 'classnames'
import createControllableValue from '../hooks/createControllableValue'
import Group from './Group'
import Element from '../Element'

export interface CheckboxProps extends ParentProps {
  defaultChecked?: boolean
  indeterminate?: boolean
  checked?: boolean
  onChange?: JSX.ChangeEventHandler<HTMLInputElement, Event>
  class?: string
  style?: JSX.CSSProperties
  disabled?: boolean
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
    <Element<JSX.LabelHTMLAttributes<HTMLLabelElement>>
      tag="label"
      class={cs(
        'inline-flex cursor-pointer inline-flex items-center [font-size:var(--ant-font-size)] leading-[var(--ant-line-height)]',
        props.class,
        props.disabled && 'cursor-not-allowed',
      )}
      style={props.style}
    >
      <span
        class={cs(
          'w-16px h-16px rounded-[var(--ant-border-radius-sm)] relative',
          (() => {
            if (checked()) {
              return [
                'after:content-empty after:block after:absolute after:top-[calc(50%-1px)] after:left-1/2 after:-translate-1/2 after:-rotate-45 after:w-10px after:h-6px',
                'after:border-solid after:border-2px after:border-t-0px after:border-r-0px',
                props.disabled
                  ? 'bg-[var(--ant-color-bg-container-disabled)] [border:1px_solid_var(--ant-color-border)] after:border-[var(--ant-color-text-disabled)]'
                  : 'bg-[var(--ant-color-primary)] after:border-white',
              ]
            }
            if (props.indeterminate) {
              return [
                '[border:1px_solid_var(--ant-color-border)]',
                'after:content-empty after:block after:absolute after:top-1/2 after:left-1/2 after:-translate-1/2 after:w-8px after:h-8px',
                props.disabled
                  ? 'after:bg-[var(--ant-color-text-disabled)]'
                  : 'after:bg-[var(--ant-color-primary)]',
              ]
            }
            return [
              '[border:1px_solid_var(--ant-color-border)]',
              props.disabled && 'bg-[var(--ant-color-bg-container-disabled)]',
            ]
          })(),
        )}
      >
        <input
          class="m-0 hidden"
          type="checkbox"
          onChange={e => {
            if (props.disabled) return
            e.target.checked = setChecked(v => !v)
            props.onChange?.(e)
          }}
        />
      </span>
      <Show when={props.children}>
        <span class={cs('px-8px', props.disabled && 'text-[var(--ant-color-text-disabled)]')}>
          {props.children}
        </span>
      </Show>
    </Element>
  )
}

Checkbox.Group = Group

export default Checkbox
