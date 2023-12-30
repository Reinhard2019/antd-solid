import {
  type Component,
  type JSXElement,
  type ParentProps,
  type JSX,
  untrack,
  For,
  createSelector,
  mergeProps,
} from 'solid-js'
import { Dynamic } from 'solid-js/web'
import cs from 'classnames'
import createControllableValue from './hooks/createControllableValue'

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
  options: Array<{ label: JSXElement; value: string; disabled?: boolean }>
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
    <label class="ant-inline-flex ant-gap-4px ant-cursor-pointer ant-inline-flex ant-items-center">
      <span
        class={cs(
          'ant-w-16px ant-h-16px ant-rounded-50% ant-[border:1px_solid_var(--ant-color-border)]',
          checked() && 'ant-[border:5px_solid_var(--primary-color)]',
        )}
      >
        <input
          class="ant-m-0 ant-hidden"
          checked={checked()}
          value={props.value ?? ''}
          type="radio"
          onInput={e => {
            setChecked(e.target.checked)
            untrack(() => props.onChange?.(e))
          }}
        />
      </span>
      {props.children}
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
        'ant-px-15px ant-[border:1px_solid_rgb(217,217,217)] first:ant-rounded-l-6px last:ant-rounded-r-6px ant-h-32px ant-inline-flex ant-items-center hover:ant-text-[var(--primary-color)] not[:last-child]:ant-border-r-transparent ant-cursor-pointer ant-flex-grow ant-justify-center',
        checked() &&
          'ant-text-[var(--primary-color)] ant-[border:1px_solid_var(--primary-color)] !ant-border-r-[var(--primary-color)]',
      )}
    >
      <input
        class="ant-w-0 ant-h-0"
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
        props.block ? 'ant-flex' : 'ant-inline-flex',
        props.optionType === 'default' ? 'ant-gap-8px' : '',
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
            {option.label}
          </Dynamic>
        )}
      </For>
    </div>
  )
}

export default Radio
