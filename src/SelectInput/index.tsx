import {
  type JSXElement,
  type JSX,
  For,
  createSignal,
  Show,
  createMemo,
  useContext,
} from 'solid-js'
import cs from 'classnames'
import { compact } from 'lodash-es'
import Tooltip from '../Tooltip'
import createControllableValue from '../hooks/createControllableValue'
import { useClickAway } from '../hooks'
import Compact from '../Compact'
import Element from '../Element'
import ConfigProviderContext from '../ConfigProvider/context'

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
  /**
   * 默认: middle
   */
  size?: 'small' | 'middle' | 'large'
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

  const { componentSize } = useContext(ConfigProviderContext)
  const size = createMemo(() => props.size ?? componentSize())
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
    <Element
      ref={select!}
      class={cs(
        'p[.ant-input-addon]:my--1px p[.ant-input-addon]:mx--12px',
        'rounded-6px cursor-pointer inline-block text-[var(--ant-color-text)] leading-[var(--ant-line-height)]',
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
      style={props.style}
    >
      <Tooltip
        plain
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
            class="w-200px max-h-400px overflow-auto"
            style={{ width: `${width()}px` }}
          >
            {props.content(() => setOpen(false))}
          </div>
        }
      >
        <div
          class={cs(
            'p[.ant-input-addon]:border-transparent p[.ant-input-addon]:focus-within:border-transparent p[.ant-input-addon]:hover:border-transparent p[.ant-input-addon]:focus-within:[box-shadow:none]',
            'relative h-[--ant-select-input-height] rounded-inherit py-1px flex',
            {
              small: 'pr-25px [font-size:var(--ant-font-size)]',
              middle: 'pr-29px [font-size:var(--ant-font-size)]',
              large: 'pr-29px [font-size:var(--ant-font-size-lg)]',
            }[size()],
            valueArr().length && props.multiple
              ? 'pl-4px'
              : {
                small: 'pl-7px',
                middle: 'pl-11px',
                large: 'pl-11px',
              }[size()],
            props.disabled &&
              '[pointer-events:none] bg-[var(--ant-color-bg-container-disabled)] color-[var(--ant-color-text-disabled)]',
            statusClassDict[props.status ?? 'default'](!!props.disabled),
          )}
          style={{
            '--ant-select-input-height': {
              small: '24px',
              middle: '32px',
              large: '40px',
            }[size()],
            '--ant-select-multiple-item-height': {
              small: '16px',
              middle: '24px',
              large: '32px',
            }[size()],
          }}
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
              <span class="block w-full h-[calc(var(--ant-select-input-height)-2px)] leading-[calc(var(--ant-select-input-height)-2px)] text-[var(--ant-color-text-placeholder)]">
                {props.placeholder}

                {/* 防止为空的时候，与其它 inline 节点并排显示时不能对齐 */}
                <Show when={!props.placeholder}>
                  <span class="inline-block w-0"> </span>
                </Show>
              </span>
            }
          >
            <Show
              when={props.multiple}
              fallback={
                <div class="h-[calc(var(--ant-select-input-height)-2px)] leading-[calc(var(--ant-select-input-height)-2px)] ellipsis">
                  {optionLabelRender(valueArr()[0])}
                </div>
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

          <div
            class={cs(
              'absolute top-0 bottom-0 flex items-center',
              {
                small: 'right-7px',
                middle: 'right-11px',
                large: 'right-11px',
              }[size()],
            )}
          >
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
    </Element>
  )
}

export default SelectInput
