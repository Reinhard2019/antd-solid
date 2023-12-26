import { type Component, For, createSelector } from 'solid-js'
import cs from 'classnames'
import { type Key } from '../types'
import createControllableValue from '../hooks/createControllableValue'

export interface SegmentedProps {
  block?: boolean
  options: string[] | number[]
  value?: Key
  onChange?: (value: Key) => void
}

const Segmented: Component<SegmentedProps> = props => {
  const [value, setValue] = createControllableValue<Key>(props, {
    defaultValue: props.options[0],
  })
  const isSelected = createSelector(value)

  return (
    <div
      class={cs(
        'ant-bg-[var(--ant-color-bg-layout)] ant-rounded-[var(--ant-border-radius)] ant-p-2px',
        props.block ? 'ant-flex' : 'ant-inline-flex',
      )}
      style={{
        '--ant-segmented-item-color': 'rgba(0, 0, 0, 0.65)',
        '--ant-segmented-item-hover-bg': 'rgba(0, 0, 0, 0.06)',
        '--ant-segmented-item-active-bg': 'rgba(0, 0, 0, 0.15)',
      }}
    >
      <For each={props.options}>
        {item => (
          <div
            class={cs(
              'ant-rounded-[var(--ant-border-radius-sm)] ant-px-[var(--ant-padding-sm)] ant-cursor-pointer ant-leading-28px where:hover:ant-bg-[var(--ant-segmented-item-hover-bg)] where:active:ant-bg-[var(--ant-segmented-item-active-bg)]',
              isSelected(item) && 'ant-bg-white ant-shadow-[var(--ant-box-shadow-tertiary)]',
              props.block && 'ant-basis-0 ant-grow-1 ant-flex ant-justify-center',
            )}
            onClick={() => setValue(item)}
          >
            {item as string | number}
          </div>
        )}
      </For>
    </div>
  )
}

export default Segmented
