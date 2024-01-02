import { type Component, For, createSelector, type JSX, Show } from 'solid-js'
import cs from 'classnames'
import { type StringOrJSXElement, type Key } from '../types'
import createControllableValue from '../hooks/createControllableValue'
import { unwrapStringOrJSXElement } from '../utils/solid'

export interface SegmentedProps {
  block?: boolean
  disabled?: boolean
  options: Array<
  | string
  | number
  | {
    label: StringOrJSXElement
    value: string
    disabled?: boolean
    onClick?: (
      e: MouseEvent & {
        currentTarget: HTMLDivElement
        target: Element
      },
    ) => void
  }
  >
  value?: Key
  onChange?: (value: Key) => void
  class?: string
  style?: JSX.CSSProperties
}

const unWarpValue = (value: SegmentedProps['options'][0]) =>
  typeof value === 'object' ? value.value : value

const Segmented: Component<SegmentedProps> = props => {
  const [value, setValue] = createControllableValue<Key>(props, {
    defaultValue: unWarpValue(props.options[0]),
  })
  const isSelected = createSelector(value)

  const isDisabledValue = (v: SegmentedProps['options'][0]) => {
    if (props.disabled) return true
    return typeof v === 'object' ? v.disabled : false
  }

  return (
    <div
      class={cs(
        'bg-[var(--ant-color-bg-layout)] rounded-[var(--ant-border-radius)] p-2px',
        props.block ? 'flex' : 'inline-flex',
        props.class,
      )}
      style={{
        '--ant-segmented-item-color': 'rgba(0, 0, 0, 0.65)',
        '--ant-segmented-item-hover-bg': 'rgba(0, 0, 0, 0.06)',
        '--ant-segmented-item-active-bg': 'rgba(0, 0, 0, 0.15)',
        ...props.style,
      }}
    >
      <For each={props.options}>
        {item => (
          <div
            class={cs(
              props.block && 'basis-0 grow-1',
              isDisabledValue(item) && 'cursor-not-allowed',
            )}
          >
            <div
              class={cs(
                'rounded-[var(--ant-border-radius-sm)] px-[var(--ant-padding-sm)] where:cursor-pointer leading-28px where:hover:bg-[var(--ant-segmented-item-hover-bg)] where:active:bg-[var(--ant-segmented-item-active-bg)]',
                isSelected(unWarpValue(item)) && 'bg-white shadow-[var(--ant-box-shadow-tertiary)]',
                props.block && 'flex justify-center',
                isDisabledValue(item) &&
                  '[pointer-events:none] text-[var(--ant-color-text-disabled)]',
              )}
              onClick={e => {
                setValue(unWarpValue(item))
                typeof item === 'object' && item.onClick?.(e)
              }}
            >
              <Show
                when={typeof item !== 'object'}
                fallback={typeof item === 'object' && unwrapStringOrJSXElement(item.label)}
              >
                {item as string | number}
              </Show>
            </div>
          </div>
        )}
      </For>
    </div>
  )
}

export default Segmented
