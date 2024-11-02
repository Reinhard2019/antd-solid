import { type Component, type JSX, For, mergeProps, createSelector } from 'solid-js'
import cs from 'classnames'
import { Dynamic } from 'solid-js/web'
import createControllableValue from '../hooks/createControllableValue'
import { type StyleProps, type ComponentSize } from '../types'
import Radio from '.'
import Element from '../Element'
import useComponentSize from '../hooks/useComponentSize'

export interface RadioGroupProps extends StyleProps {
  defaultValue?: string
  value?: string
  onChange?: JSX.ChangeEventHandler<HTMLInputElement, Event>
  optionType?: 'default' | 'button'
  options: Array<{ label: JSX.Element; value: string; disabled?: boolean }>
  block?: boolean
  disabled?: boolean
  size?: ComponentSize
}

const Group: Component<RadioGroupProps> = _props => {
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
  const size = useComponentSize(() => props.size)

  return (
    <Element
      class={cs(
        props.class,
        props.block ? 'flex' : 'inline-flex',
        props.optionType === 'default' && 'gap-8px',
      )}
      style={props.style}
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
            size={size()}
          >
            {option.label}
          </Dynamic>
        )}
      </For>
    </Element>
  )
}

export default Group
