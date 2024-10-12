import { For, createSelector, createMemo, splitProps, Show, type JSXElement } from 'solid-js'
import cs from 'classnames'
import { isEmpty } from 'lodash-es'
import { type Key } from '../types'
import createControllableValue from '../hooks/createControllableValue'
import { toArray } from '../utils/array'
import SelectInput, { type SelectInputProps } from '../SelectInput'
import Empty from '../Empty'

interface SelectOption<T = Key> {
  label: JSXElement
  value: T
}

export interface SelectProps<T = Key>
  extends Pick<
  SelectInputProps<T>,
  | 'multiple'
  | 'allowClear'
  | 'class'
  | 'style'
  | 'disabled'
  | 'placeholder'
  | 'status'
  | 'size'
  | 'variant'
  | 'suffixIcon'
  | 'placement'
  | 'getPopupContainer'
  > {
  defaultValue?: T | T[] | null
  value?: T | T[] | null
  onChange?: (value: T | T[] | undefined) => void
  options?: Array<SelectOption<T>>
  labelRender?: (options: SelectOption<T> | undefined) => JSXElement
}

function Select<T = Key>(props: SelectProps<T>) {
  const [selectInputProps] = splitProps(props, [
    'multiple',
    'allowClear',
    'class',
    'style',
    'disabled',
    'placeholder',
    'status',
    'size',
    'variant',
    'suffixIcon',
    'placement',
    'getPopupContainer',
  ])
  const [value, setValue] = createControllableValue<T | T[] | undefined>(props)
  const valueArr = createMemo(() => toArray(value(), false) as T[])
  const selectedValue = createSelector<Map<T, true>, T>(
    () => new Map(valueArr().map(v => [v, true])),
    (a, b) => b.has(a),
  )
  const optionDict = createMemo(() => new Map(props.options?.map(o => [o.value, o])))

  return (
    <SelectInput<T>
      {...selectInputProps}
      labelRender={v =>
        props.labelRender
          ? props.labelRender(optionDict().get(v))
          : optionDict().get(v)?.label ?? (v as string)
      }
      value={valueArr()}
      onChange={v => {
        setValue(props.multiple ? v : (v[0] as any))
      }}
      content={close => (
        <Show when={!isEmpty(props.options)} fallback={<Empty.PRESENTED_IMAGE_SIMPLE />}>
          <div class="p-2px">
            <For each={props.options}>
              {item => (
                <div
                  class={cs(
                    'ellipsis box-content px-12px py-5px min-h-22px leading-22px hover:bg-[var(--ant-select-option-active-bg)] cursor-pointer rounded-[var(--ant-border-radius-sm)]',
                    selectedValue(item.value) ? '!bg-[var(--ant-select-option-selected-bg)]' : '',
                  )}
                  onClick={() => {
                    if (!props.multiple) {
                      setValue(item.value as any)
                      close()
                      return
                    }

                    if (valueArr().includes(item.value)) {
                      setValue(valueArr().filter(v => v !== item.value))
                    } else {
                      setValue([...valueArr(), item.value])
                    }
                  }}
                  title={
                    typeof item.label === 'string' || typeof item.label === 'number'
                      ? item.label.toString()
                      : undefined
                  }
                >
                  {item.label}
                </div>
              )}
            </For>
          </div>
        </Show>
      )}
    />
  )
}

export default Select
