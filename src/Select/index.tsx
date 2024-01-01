import {
  type JSXElement,
  type Component,
  For,
  createSelector,
  createSignal,
  Show,
  createMemo,
} from 'solid-js'
import Tooltip from '../Tooltip'
import { type Key } from '../types'
import createControllableValue from '../hooks/createControllableValue'
import cs from 'classnames'
import { useClickAway } from '../hooks'
import { isNil } from 'lodash-es'

interface SelectOption {
  label: JSXElement
  value: Key
}

interface SelectProps {
  value?: Key
  onChange?: (value: Key) => void
  options: SelectOption[]
  placeholder?: string
  allowClear?: boolean
  class?: string
}

const Select: Component<SelectProps> = props => {
  let select: HTMLDivElement

  const [value, setValue] = createControllableValue<Key | undefined>(props)
  const selectedValue = createSelector(value)
  const selectedOption = createMemo(() =>
    !isNil(value()) ? props.options.find(option => option.value === value()) : undefined,
  )

  const [open, setOpen] = createSignal(false)
  useClickAway(
    () => setOpen(false),
    () => select!,
  )

  const [width, setWidth] = createSignal(0)
  const [hover, setHover] = createSignal(false)
  const showClearBtn = createMemo(() => props.allowClear && hover() && !isNil(value()))

  return (
    <Tooltip
      mode="light"
      open={open()}
      onOpenChange={setOpen}
      trigger={[]}
      placement="bottomLeft"
      arrow={false}
      contentStyle={{
        padding: 0,
      }}
      content={close => (
        <div class="bg-white w-200px" style={{ width: `${width()}px` }}>
          <For each={props.options}>
            {item => (
              <div
                class={cs(
                  'box-content px-12px py-5px h-22px leading-22px hover:bg-[var(--ant-hover-bg-color)]',
                  selectedValue(item.value) ? '!bg-[var(--ant-select-option-selected-bg)]' : '',
                )}
                onClick={() => {
                  setValue(item.value)
                  close()
                }}
              >
                {item.label}
              </div>
            )}
          </For>
        </div>
      )}
    >
      <div
        ref={select!}
        class={cs(
          'h-32px leading-32px rounded-6px [border:1px_solid_var(--ant-color-border)] px-11px focus:[border-color:var(--ant-color-primary)]',
          props.class,
        )}
        tabIndex="0"
        onClick={e => {
          setOpen(true)
          setWidth(e.currentTarget.offsetWidth)
          e.currentTarget.focus()
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          '--arrow-color': 'rgba(146, 146, 146, 1)',
          '--clear-color': 'rgba(146, 146, 146, 1)',
          '--clear-color-hover': 'rgba(194, 194, 194, 1)',
        }}
      >
        <div class="relative h-full">
          <Show
            when={!isNil(value())}
            fallback={
              <input
                class="h-full w-full float-left [outline:none]"
                readOnly
                placeholder={props.placeholder}
              />
            }
          >
            <div>{selectedOption()!.label ?? value()}</div>
          </Show>

          <div class="absolute top-0 bottom-0 right-0">
            <Show
              when={showClearBtn()}
              fallback={<span class="i-ant-design:down-outlined text-[var(--ant-allow-color)]" />}
            >
              <span
                class="i-ant-design:close-circle-filled cursor-pointer text-[var(--ant-clear-color)] hover:text-[var(--ant-clear-color-hover)]"
                onClick={e => {
                  e.stopPropagation()
                  setValue(undefined)
                }}
              />
            </Show>
          </div>
        </div>
      </div>
    </Tooltip>
  )
}

export default Select
