import { type Component, For, createSelector, Show } from 'solid-js'
import cs from 'classnames'
import { type StringOrJSXElement, type Key, type ComponentSize, type StyleProps } from '../types'
import createControllableValue from '../hooks/createControllableValue'
import { unwrapStringOrJSXElement } from '../utils/solid'
import Element from '../Element'
import useComponentSize from '../hooks/useComponentSize'

export interface SegmentedProps extends StyleProps {
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
  /**
   * 大小，提供 large middle 和 small 三种大小
   * 默认 'middle'
   */
  size?: ComponentSize
}

const unWarpValue = (value: SegmentedProps['options'][0]) =>
  typeof value === 'object' ? value.value : value

const Segmented: Component<SegmentedProps> = props => {
  const [value, setValue] = createControllableValue<Key>(props, {
    defaultValue: unWarpValue(props.options[0]),
  })
  const isSelected = createSelector(value)
  const size = useComponentSize(() => props.size)

  const isDisabledValue = (v: SegmentedProps['options'][0]) => {
    if (props.disabled) return true
    return typeof v === 'object' ? v.disabled : false
  }

  return (
    <Element
      class={cs(
        'bg-[var(--ant-color-bg-layout)] rounded-[var(--ant-border-radius)] p-2px text-[var(--ant-color-text)] leading-[var(--ant-line-height)]',
        props.block ? 'flex' : 'inline-flex',
        props.class,
        {
          small: '[font-size:var(--ant-font-size)]',
          middle: '[font-size:var(--ant-font-size)]',
          large: '[font-size:var(--ant-font-size-lg)]',
        }[size()],
      )}
      style={props.style}
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
                'rounded-[var(--ant-border-radius-sm)] px-[var(--ant-padding-sm)] cursor-pointer',
                isSelected(unWarpValue(item)) && 'bg-[var(--ant-segmented-item-selected-bg)]',
                isDisabledValue(item)
                  ? '[pointer-events:none] text-[var(--ant-color-text-disabled)]'
                  : isSelected(unWarpValue(item))
                    ? 'shadow-[var(--ant-box-shadow-tertiary)] text-[var(--ant-segmented-item-selected-color)]'
                    : 'text-[var(--ant-segmented-item-color)] hover:text-[var(--ant-segmented-item-hover-color)] hover:bg-[var(--ant-segmented-item-hover-bg)] active:bg-[var(--ant-segmented-item-active-bg)]',
                props.block && 'flex justify-center',
                {
                  small: 'leading-20px',
                  middle: 'leading-28px',
                  large: 'leading-36px',
                }[size()],
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
    </Element>
  )
}

export default Segmented
