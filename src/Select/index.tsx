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
import { compact, isNil, keyBy } from 'lodash-es'
import { toArray } from '../utils/array'

interface SelectOption {
  label: JSXElement
  value: Key
}

interface SelectProps {
  multiple?: boolean
  defaultValue?: Key | Key[]
  value?: Key | Key[]
  onChange?: (value: Key | Key[]) => void
  options: SelectOption[]
  placeholder?: string
  allowClear?: boolean
  class?: string
}

const Select: Component<SelectProps> = props => {
  let select: HTMLDivElement
  let tooltipContent: HTMLDivElement

  const [value, setValue] = createControllableValue<Key | Key[] | undefined>(props)
  const valueArr = createMemo(() => toArray(value(), false) as Key[])
  const selectedValue = createSelector<Map<Key, true>, Key>(
    () => new Map(valueArr().map(v => [v, true])),
    (a, b) => b.has(a),
  )
  const optionDict = createMemo(() => keyBy(props.options, v => v.value))
  const getOptionLabel = (v: Key) => optionDict()[v]?.label ?? v

  const [open, setOpen] = createSignal(false)
  useClickAway(
    () => setOpen(false),
    () => compact([select, tooltipContent]),
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
        <div ref={tooltipContent} class="bg-white w-200px p-2px" style={{ width: `${width()}px` }}>
          <For each={props.options}>
            {item => (
              <div
                class={cs(
                  'box-content px-12px py-5px h-22px leading-22px hover:bg-[var(--ant-hover-bg-color)] cursor-pointer rounded-[var(--ant-border-radius-sm)]',
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
          '--ant-select-multiple-item-bg': 'rgba(0, 0, 0, 0.06)',
          '--ant-select-multiple-item-height': '24px',
        }}
      >
        <div class="relative h-full">
          <Show
            when={valueArr().length}
            fallback={
              <input
                class="h-full w-full float-left [outline:none]"
                readOnly
                placeholder={props.placeholder}
              />
            }
          >
            <Show when={props.multiple} fallback={getOptionLabel(valueArr()[0])}>
              <div class="flex gap-4px h-full items-center ml--7px">
                <For each={valueArr()}>
                  {item => (
                    <span class="bg-[var(--ant-select-multiple-item-bg)] leading-[var(--ant-select-multiple-item-height)] h-[var(--ant-select-multiple-item-height)] pl-8px pr-4px rounded-[var(--ant-border-radius-sm)]">
                      {getOptionLabel(item)}
                      <span
                        class="i-ant-design:close-outlined text-[var(--ant-color-icon)] hover:text-[var(--ant-color-icon-hover)] text-12px cursor-pointer"
                        onClick={() => setValue(valueArr().filter(v => v !== item))}
                      />
                    </span>
                  )}
                </For>
              </div>
            </Show>
          </Show>

          <div class="absolute top-0 bottom-0 right-0">
            <Show
              when={showClearBtn()}
              fallback={
                <span class="i-ant-design:down-outlined text-[var(--ant-color-text-quaternary)]" />
              }
            >
              <span
                class="i-ant-design:close-circle-filled cursor-pointer text-[var(--ant-color-text-quaternary)] hover:text-[var(--ant-color-text-tertiary)]"
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
