import { type Component, type JSX, For, mergeProps, createSelector, useContext } from 'solid-js'
import cs from 'classnames'
import { Dynamic } from 'solid-js/web'
import createControllableValue from '../hooks/createControllableValue'
import { type StyleProps, type StringOrJSXElement } from '../types'
import Radio from '.'
import { unwrapStringOrJSXElement } from '../utils/solid'
import ConfigProviderContext from '../ConfigProvider/context'

export interface RadioGroupProps extends StyleProps {
  defaultValue?: string
  value?: string
  onChange?: JSX.ChangeEventHandler<HTMLInputElement, Event>
  optionType?: 'default' | 'button'
  options: Array<{ label: StringOrJSXElement; value: string; disabled?: boolean }>
  block?: boolean
  disabled?: boolean
}

const Group: Component<RadioGroupProps> = _props => {
  const { cssVariables } = useContext(ConfigProviderContext)
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
        props.class,
        props.block ? 'flex' : 'inline-flex',
        props.optionType === 'default' && 'gap-8px',
      )}
      style={{
        ...cssVariables(),
        ...props.style,
      }}
    >
      <For each={props.options}>
        {option => (
          <Dynamic
            component={props.optionType === 'default' ? Radio : Radio.Button}
            disabled={option.disabled ?? props.disabled}
            checked={isChecked(option.value)}
            onChange={
              (e => {
                setValue(option.value)
                e.target.value = option.value
                props.onChange?.(e)
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

export default Group
