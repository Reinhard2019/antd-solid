import { For, useContext } from 'solid-js'
import type { Component, JSX } from 'solid-js'
import cs from 'classnames'
import ConfigProviderContext from '../ConfigProvider/context'
import { type StringOrJSXElement, type Key } from '../types'
import createControllableValue from '../hooks/createControllableValue'
import Checkbox from '.'
import { unwrapStringOrJSXElement } from '../utils/solid'

interface CheckboxOption {
  label: StringOrJSXElement
  value: Key
  disabled?: boolean
}

export interface CheckboxGroupProps {
  defaultValue?: Key[]
  value?: Key[]
  onChange?: (values: Key[]) => void
  options: string[] | number[] | CheckboxOption[]
  block?: boolean
  class?: string
  style?: JSX.CSSProperties
  disabled?: boolean
}

const getOptionValue = (option: string | number | CheckboxOption) =>
  typeof option === 'object' ? option.value : option

const Group: Component<CheckboxGroupProps> = props => {
  const { cssVariables } = useContext(ConfigProviderContext)
  const [value, setValue] = createControllableValue<Key[]>(props, {
    defaultValue: [],
  })

  return (
    <div
      class={cs(props.block ? 'flex' : 'inline-flex', props.class)}
      style={{ ...cssVariables(), ...props.style }}
    >
      <For each={props.options}>
        {option => (
          <Checkbox
            checked={value().includes(getOptionValue(option))}
            onChange={e => {
              if (e.target.checked) {
                setValue(l => [...l, getOptionValue(option)])
              } else {
                setValue(l => l.filter(v => getOptionValue(v) !== getOptionValue(option)))
              }
            }}
            disabled={props.disabled}
          >
            {typeof option === 'object' ? unwrapStringOrJSXElement(option.label) : option}{' '}
          </Checkbox>
        )}
      </For>
    </div>
  )
}

export default Group
