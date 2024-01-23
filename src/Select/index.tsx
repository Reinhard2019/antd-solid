import {
  type JSXElement,
  type Component,
  For,
  createSelector,
  createMemo,
  splitProps,
} from 'solid-js'
import { type Key } from '../types'
import createControllableValue from '../hooks/createControllableValue'
import cs from 'classnames'
import { keyBy } from 'lodash-es'
import { toArray } from '../utils/array'
import SelectInput, { type SelectInputProps } from './SelectInput'

interface SelectOption {
  label: JSXElement
  value: Key
}

interface SelectProps
  extends Omit<
  SelectInputProps<Key>,
  'defaultValue' | 'value' | 'onChange' | 'optionLabelRender' | 'content'
  > {
  defaultValue?: Key | Key[]
  value?: Key | Key[]
  onChange?: (value: Key | Key[]) => void
  options: SelectOption[]
}

const Select: Component<SelectProps> = props => {
  const [selectInputProps] = splitProps(props, [
    'multiple',
    'allowClear',
    'class',
    'disabled',
    'placeholder',
  ])
  const [value, setValue] = createControllableValue<Key | Key[] | undefined>(props)
  const valueArr = createMemo(() => toArray(value(), false) as Key[])
  const selectedValue = createSelector<Map<Key, true>, Key>(
    () => new Map(valueArr().map(v => [v, true])),
    (a, b) => b.has(a),
  )
  const optionDict = createMemo(() => keyBy(props.options, v => v.value))

  return (
    <SelectInput<Key>
      {...selectInputProps}
      optionLabelRender={v => optionDict()[v]?.label ?? v}
      value={valueArr()}
      onChange={v => {
        setValue(props.multiple ? v : v[0])
      }}
      content={close => (
        <div class="p-2px">
          <For each={props.options}>
            {item => (
              <div
                class={cs(
                  'ellipsis box-content px-12px py-5px h-22px leading-22px hover:bg-[var(--ant-hover-bg-color)] cursor-pointer rounded-[var(--ant-border-radius-sm)]',
                  selectedValue(item.value) ? '!bg-[var(--ant-select-option-selected-bg)]' : '',
                )}
                onClick={() => {
                  if (!props.multiple) {
                    setValue(item.value)
                    close()
                    return
                  }

                  if (valueArr().includes(item.value)) {
                    setValue(valueArr().filter(v => v !== item.value))
                  } else {
                    setValue([...valueArr(), item.value])
                  }
                }}
              >
                {item.label}
              </div>
            )}
          </For>
        </div>
      )}
    />
  )
}

export default Select
