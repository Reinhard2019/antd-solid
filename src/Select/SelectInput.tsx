import { type JSXElement, For, createSignal, Show, createMemo } from 'solid-js'
import Tooltip from '../Tooltip'
import createControllableValue from '../hooks/createControllableValue'
import cs from 'classnames'
import { useClickAway } from '../hooks'
import { compact } from 'lodash-es'
import Compact from '../Compact'

export interface SelectInputProps<T> {
  multiple?: boolean
  defaultValue?: T[]
  value?: T[]
  onChange?: (value: T[]) => void
  optionLabelRender: (v: T) => JSXElement
  placeholder?: string
  allowClear?: boolean
  disabled?: boolean
  class?: string
  content: (close: () => void) => JSXElement
}

function SelectInput<T>(props: SelectInputProps<T>) {
  let select: HTMLDivElement
  let tooltipContent: HTMLDivElement

  const [value, setValue] = createControllableValue<T[] | undefined>(props, {
    defaultValue: [],
  })
  const valueArr = createMemo(() => value() ?? [])

  const [open, setOpen] = createSignal(false)
  useClickAway(
    () => setOpen(false),
    () => compact([select, tooltipContent]),
  )

  const [width, setWidth] = createSignal(0)
  const [hover, setHover] = createSignal(false)
  const showClearBtn = createMemo(() => props.allowClear && hover() && valueArr().length > 0)

  return (
    <div
      class={cs(
        'rounded-6px',
        [
          Compact.compactItemClass,
          Compact.compactItemRounded0Class,
          'p[.ant-compact]:first:rounded-l-6px',
          'p[.ant-compact]:last:rounded-r-6px',
          Compact.compactItemZIndexClass,
        ],
        props.class,
        props.disabled && 'cursor-not-allowed',
      )}
      style={{
        '--ant-select-multiple-item-bg': 'rgba(0, 0, 0, 0.06)',
        '--ant-select-multiple-item-height': '24px',
      }}
    >
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
          <div
            ref={tooltipContent}
            class="bg-white w-200px max-h-400px overflow-auto"
            style={{ width: `${width()}px` }}
          >
            {props.content(close)}
          </div>
        )}
      >
        <div
          ref={select!}
          class={cs(
            'relative min-h-32px [border:1px_solid_var(--ant-color-border)] pr-25px hover:border-[var(--ant-color-primary)] focus:[border-color:var(--ant-color-primary)] focus:[box-shadow:0_0_0_2px_var(--ant-control-outline)] rounded-inherit',
            valueArr().length && props.multiple ? 'pl-4px' : 'pl-11px',
            props.multiple && 'py-1px',
            props.disabled &&
              '[pointer-events:none] bg-[var(--ant-color-bg-container-disabled)] color-[var(--ant-color-text-disabled)]',
          )}
          tabIndex="0"
          onClick={e => {
            setOpen(true)
            setWidth(e.currentTarget.offsetWidth)
            e.currentTarget.focus()
          }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <Show
            when={valueArr().length}
            fallback={
              <input
                class="h-28px [outline:none] bg-inherit placeholder-text-[rgba(0,0,0,.25)]"
                readOnly
                placeholder={props.placeholder}
              />
            }
          >
            <Show
              when={props.multiple}
              fallback={
                <div class="h-30px ellipsis leading-30px">
                  {props.optionLabelRender(valueArr()[0])}
                </div>
              }
            >
              <For each={valueArr()}>
                {item => (
                  <span class="inline-block">
                    <span class="inline-block my-2px mr-4px bg-[var(--ant-select-multiple-item-bg)] leading-[var(--ant-select-multiple-item-height)] h-[var(--ant-select-multiple-item-height)] pl-8px pr-4px rounded-[var(--ant-border-radius-sm)]">
                      {props.optionLabelRender(item)}
                      <span
                        class="i-ant-design:close-outlined text-[var(--ant-color-icon)] hover:text-[var(--ant-color-icon-hover)] text-12px cursor-pointer"
                        onClick={() => setValue(valueArr().filter(v => v !== item))}
                      />
                    </span>
                  </span>
                )}
              </For>
            </Show>
          </Show>

          <div class="absolute top-0 bottom-0 right-11px flex items-center">
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
                  setValue([])
                }}
              />
            </Show>
          </div>
        </div>
      </Tooltip>
    </div>
  )
}

export default SelectInput
