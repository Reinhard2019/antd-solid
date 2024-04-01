import { type JSXElement, type JSX, For, createSignal, Show, createMemo } from 'solid-js'
import cs from 'classnames'
import { compact } from 'lodash-es'
import Tooltip from '../Tooltip'
import createControllableValue from '../hooks/createControllableValue'
import { useClickAway } from '../hooks'
import Compact from '../Compact'

export interface SelectInputProps<T> {
  multiple?: boolean
  defaultValue?: T[] | null
  value?: T[] | null
  onChange?: (value: T[]) => void
  optionLabelRender?: (v: T) => JSXElement
  placeholder?: string
  allowClear?: boolean
  disabled?: boolean
  class?: string
  style?: JSX.CSSProperties
  content: (close: () => void) => JSXElement
  /**
   * 设置校验状态
   */
  status?: 'error' | 'warning'
}

const statusClassDict = {
  default: (disabled: boolean) =>
    cs(
      '[border:1px_solid_var(--ant-color-border)]',
      !disabled &&
        'hover:border-[var(--ant-color-primary)] focus-within:border-[var(--ant-color-primary)] focus-within:[box-shadow:0_0_0_2px_var(--ant-control-outline)]',
    ),
  error: (disabled: boolean) =>
    cs(
      '[border:1px_solid_var(--ant-color-error)]',
      !disabled &&
        'hover:border-[var(--ant-color-error-border-hover)] focus-within:[box-shadow:0_0_0_2px_rgba(255,38,5,.06)]',
    ),
  warning: (disabled: boolean) =>
    cs(
      '[border:1px_solid_var(--ant-color-warning)]',
      !disabled &&
        'hover:border-[var(--ant-color-warning-border-hover)] focus-within:[box-shadow:0_0_0_2px_rgba(255,215,5,.1)]',
    ),
}

function SelectInput<T>(props: SelectInputProps<T>) {
  let select: HTMLDivElement | undefined
  let tooltipContent: HTMLDivElement | undefined

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

  const optionLabelRender = (v: T) =>
    props.optionLabelRender ? props.optionLabelRender(v) : String(v)

  return (
    <div
      ref={select!}
      class={cs(
        'p[.ant-input-addon]:my--1px p[.ant-input-addon]:mx--12px',
        'rounded-6px [font-size:var(--ant-font-size)] cursor-pointer inline-block',
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
        ...props.style,
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
        content={
          <div
            ref={tooltipContent}
            class="bg-white w-200px max-h-400px overflow-auto"
            style={{ width: `${width()}px` }}
          >
            {props.content(() => setOpen(false))}
          </div>
        }
      >
        <div
          class={cs(
            'p[.ant-input-addon]:border-transparent p[.ant-input-addon]:focus-within:border-transparent p[.ant-input-addon]:hover:border-transparent p[.ant-input-addon]:focus-within:[box-shadow:none]',
            'relative h-32px pr-29px rounded-inherit py-1px flex',
            valueArr().length && props.multiple ? 'pl-4px' : 'pl-11px',
            props.disabled &&
              '[pointer-events:none] bg-[var(--ant-color-bg-container-disabled)] color-[var(--ant-color-text-disabled)]',
            statusClassDict[props.status ?? 'default'](!!props.disabled),
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
              // <input
              //   class="absolute w-full h-28px leading-28px [outline:none] bg-transparent placeholder-text-[rgba(0,0,0,.25)]"
              //   readOnly
              //   placeholder={props.placeholder}
              // />
              <span class="block w-full h-28px leading-28px text-[var(--ant-color-text-placeholder)]">
                {props.placeholder}
              </span>
            }
          >
            <Show
              when={props.multiple}
              fallback={
                <div class="h-28px leading-28px ellipsis">{optionLabelRender(valueArr()[0])}</div>
              }
            >
              <For each={valueArr()}>
                {item => (
                  <span class="inline-block my-2px mr-4px bg-[var(--ant-select-multiple-item-bg)] leading-[var(--ant-select-multiple-item-height)] h-[var(--ant-select-multiple-item-height)] pl-8px pr-4px rounded-[var(--ant-border-radius-sm)]">
                    {optionLabelRender(item)}
                    <span
                      class="i-ant-design:close-outlined text-[var(--ant-color-icon)] hover:text-[var(--ant-color-icon-hover)] text-12px cursor-pointer"
                      onClick={() => setValue(valueArr().filter(v => v !== item))}
                    />
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
                class="i-ant-design:close-circle-filled cursor-pointer text-[var(--ant-color-text-quaternary)] hover:text-[var(--ant-color-text-tertiary)] active:text-[var(--ant-color-text)]"
                onClick={e => {
                  e.stopPropagation()
                  setValue([])
                  setOpen(false)
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
