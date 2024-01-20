import {
  type Component,
  type ParentProps,
  type JSX,
  untrack,
  For,
  createSelector,
  mergeProps,
  Show,
} from 'solid-js'
import { Dynamic } from 'solid-js/web'
import cs from 'classnames'
import createControllableValue from '../hooks/createControllableValue'
import { type StringOrJSXElement } from '../types'
import { unwrapStringOrJSXElement } from '../utils/solid'

export interface RadioProps extends ParentProps {
  defaultChecked?: boolean
  checked?: boolean
  /**
   * input 的 value
   */
  value?: string
  onChange?: JSX.ChangeEventHandler<HTMLInputElement, Event>
}

export interface RadioGroupProps {
  defaultValue?: string
  value?: string
  onChange?: JSX.ChangeEventHandler<HTMLInputElement, Event>
  optionType?: 'default' | 'button'
  options: Array<{ label: StringOrJSXElement; value: string; disabled?: boolean }>
  block?: boolean
}

const Radio: Component<RadioProps> & {
  Group: Component<RadioGroupProps>
  Button: Component<RadioProps>
} = props => {
  const [checked, setChecked] = createControllableValue(props, {
    defaultValue: false,
    defaultValuePropName: 'defaultChecked',
    valuePropName: 'checked',
    trigger: null,
  })

  return (
    <label class="inline-flex cursor-pointer inline-flex items-center">
      <span
        class={cs(
          'w-16px h-16px rounded-50% [border:1px_solid_var(--ant-color-border)]',
          checked() && '[border:5px_solid_var(--ant-color-primary)]',
        )}
      >
        <input
          class="m-0 hidden"
          checked={checked()}
          value={props.value ?? ''}
          type="radio"
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

Radio.Button = props => {
  const [checked, setChecked] = createControllableValue(props, {
    defaultValue: false,
    defaultValuePropName: 'defaultChecked',
    valuePropName: 'checked',
    trigger: null,
  })

  return (
    <label
      class={cs(
        'px-15px [border:1px_solid_rgb(217,217,217)] first:rounded-l-6px last:rounded-r-6px h-32px inline-flex items-center hover:text-[var(--ant-color-primary)] not[:last-child]:border-r-transparent cursor-pointer flex-grow justify-center',
        checked() &&
          'text-[var(--ant-color-primary)] [border:1px_solid_var(--ant-color-primary)] !border-r-[var(--ant-color-primary)]',
      )}
    >
      <input
        class="w-0 h-0"
        checked={checked()}
        value={props.value ?? ''}
        type="radio"
        onInput={e => {
          setChecked(e.target.checked)
          untrack(() => props.onChange?.(e))
        }}
      />
      {props.children}
    </label>
  )
}

Radio.Group = _props => {
  const props = mergeProps(
    {
      optionType: 'default',
    } as RadioGroupProps,
    _props,
  )
  const [value, setValue] = createControllableValue<string>(props, {
    trigger: null,
  })
  const isChecked = createSelector(value)

  return (
    <div
      class={cs(
        props.block ? 'flex' : 'inline-flex',
        props.optionType === 'default' ? 'gap-8px' : '',
      )}
    >
      <For each={props.options}>
        {option => (
          <Dynamic
            component={props.optionType === 'default' ? Radio : Radio.Button}
            checked={isChecked(option.value)}
            value={option.value}
            onChange={
              (e => {
                setValue(option.value)
                untrack(() => {
                  props.onChange?.(e)
                })
              }) as JSX.ChangeEventHandler<HTMLInputElement, Event>
            }
          >
            {unwrapStringOrJSXElement(option.label)}
          </Dynamic>
        )}
      </For>
    </div>
  )
}

export default Radio
