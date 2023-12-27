import { type Component, For, createSelector, type JSX, type JSXElement, Show } from 'solid-js'
import cs from 'classnames'
import { type Key } from '../types'
import createControllableValue from '../hooks/createControllableValue'

export interface SegmentedProps {
  block?: boolean
  disabled?: boolean
  options: Array<
  | string
  | number
  | {
    label: JSXElement
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
        'ant-bg-[var(--ant-color-bg-layout)] ant-rounded-[var(--ant-border-radius)] ant-p-2px',
        props.block ? 'ant-flex' : 'ant-inline-flex',
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
              props.block && 'ant-basis-0 ant-grow-1',
              isDisabledValue(item) && 'ant-cursor-not-allowed',
            )}
          >
            <div
              class={cs(
                'ant-rounded-[var(--ant-border-radius-sm)] ant-px-[var(--ant-padding-sm)] where:ant-cursor-pointer ant-leading-28px where:hover:ant-bg-[var(--ant-segmented-item-hover-bg)] where:active:ant-bg-[var(--ant-segmented-item-active-bg)]',
                isSelected(unWarpValue(item)) &&
                  'ant-bg-white ant-shadow-[var(--ant-box-shadow-tertiary)]',
                props.block && 'ant-flex ant-justify-center',
                isDisabledValue(item) &&
                  'ant-[pointer-events:none] ant-text-[var(--ant-color-text-disabled)]',
              )}
              onClick={e => {
                setValue(unWarpValue(item))
                typeof item === 'object' && item.onClick?.(e)
              }}
            >
              <Show
                when={typeof item !== 'object'}
                fallback={typeof item === 'object' && item.label}
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
