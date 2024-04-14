import {
  type JSXElement,
  type JSX,
  createSignal,
  Show,
  createMemo,
  createEffect,
  on,
  type Accessor,
} from 'solid-js'
import cs from 'classnames'
import { compact, isNil } from 'lodash-es'
import Tooltip from '../Tooltip'
import createControllableValue from '../hooks/createControllableValue'
import { useClickAway } from '../hooks'
import Compact from '../Compact'

export interface RangeInputProps<T> {
  multiple?: boolean
  defaultValue?: T[] | undefined | null
  value?: T[] | undefined | null
  onChange?: (value: T[]) => void
  optionLabelRender?: (v: T) => JSXElement
  placeholder?: [string?, string?]
  allowClear?: boolean
  disabled?: boolean
  class?: string
  content: (options: {
    currentFocusType: Accessor<'start' | 'end'>
    tempValue: Accessor<Array<T | undefined>>
    setSingleValue: (value: T) => void
  }) => JSXElement
  /**
   * 设置校验状态
   */
  status?: 'error' | 'warning'
}

const statusClassDict = {
  default: (disabled: boolean, focus: boolean) =>
    cs(
      '[border:1px_solid_var(--ant-color-border)]',
      !disabled &&
        'hover:border-[var(--ant-color-primary)] focus-within:border-[var(--ant-color-primary)] focus-within:[box-shadow:0_0_0_2px_var(--ant-control-outline)]',
      focus &&
        'border-[var(--ant-color-primary)] [box-shadow:0_0_0_2px_var(--ant-control-outline)]',
    ),
  error: (disabled: boolean, focus: boolean) =>
    cs(
      '[border:1px_solid_var(--ant-color-error)]',
      !disabled &&
        'hover:border-[var(--ant-color-error-border-hover)] focus-within:[box-shadow:0_0_0_2px_rgba(255,38,5,.06)]',
      focus && '[box-shadow:0_0_0_2px_rgba(255,38,5,.06)]',
    ),
  warning: (disabled: boolean, focus: boolean) =>
    cs(
      '[border:1px_solid_var(--ant-color-warning)]',
      !disabled &&
        'hover:border-[var(--ant-color-warning-border-hover)] focus-within:[box-shadow:0_0_0_2px_rgba(255,215,5,.1)]',
      focus && '[box-shadow:0_0_0_2px_rgba(255,215,5,.1)]',
    ),
}

function RangeInput<T = string>(props: RangeInputProps<T>) {
  let container: HTMLDivElement | undefined
  let startDom: HTMLDivElement | undefined
  let endDom: HTMLDivElement | undefined
  let tooltipContent: HTMLDivElement | undefined

  const [currentFocusType, setCurrentFocusType] = createSignal<'start' | 'end'>('start')
  const [value, setValue] = createControllableValue<T[] | undefined>(props, {
    defaultValue: [],
  })

  // 用于统计聚焦后的设置次数，大于等于 2 时退出聚焦
  let setSingleValueCount = 0
  const [tempValue, setTempValue] = createSignal<Array<T | undefined>>([])
  createEffect(() => {
    setTempValue(value() ?? [])
  })
  const setSingleValue = (v: T) => {
    setSingleValueCount++

    if (currentFocusType() === 'start') {
      setTempValue(arr => [v, arr[1]])
      if (setSingleValueCount > 1) {
        setOpen(false)
      } else {
        setCurrentFocusType('end')
      }
    } else {
      setTempValue(arr => [arr[0], v])
      if (setSingleValueCount > 1) {
        setOpen(false)
      } else {
        setCurrentFocusType('start')
      }
    }
  }

  const [open, setOpen] = createSignal(false)
  useClickAway(
    () => setOpen(false),
    () => compact([container, tooltipContent]),
  )
  createEffect(
    on(
      open,
      input => {
        setSingleValueCount = 0

        if (!input) {
          const [start, end] = tempValue()
          if (!isNil(start) && !isNil(end)) {
            setValue(tempValue() as T[])
          } else {
            setTempValue(value() ?? [])
          }
        }
      },
      {
        defer: true,
      },
    ),
  )

  const [width, setWidth] = createSignal(0)
  const [hover, setHover] = createSignal(false)
  const showClearBtn = createMemo(() => props.allowClear && hover() && tempValue().length > 0)

  const [activeBarStyle, setActiveBarStyle] = createSignal<JSX.CSSProperties>()
  const setActiveBarStyleByDom = (dom: HTMLElement) => {
    setActiveBarStyle({
      left: `${dom.offsetLeft}px`,
      width: `${dom.clientWidth}px`,
    })
  }
  createEffect(() => {
    if (!open()) return

    if (currentFocusType() === 'start') {
      setActiveBarStyleByDom(startDom!)
    } else {
      setActiveBarStyleByDom(endDom!)
    }
  })

  const optionLabelRender = (v: T) =>
    props.optionLabelRender ? props.optionLabelRender(v) : String(v)

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
      style={{}}
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
            {props.content({
              currentFocusType,
              tempValue,
              setSingleValue,
            })}
          </div>
        }
      >
        <div
          ref={container}
          class={cs(
            'relative min-h-32px pr-25px rounded-inherit grid [grid-template-columns:1fr_auto_1fr] items-center',
            tempValue().length && props.multiple ? 'pl-4px' : 'pl-11px',
            props.multiple && 'py-1px',
            props.disabled &&
              '[pointer-events:none] bg-[var(--ant-color-bg-container-disabled)] color-[var(--ant-color-text-disabled)]',
            statusClassDict[props.status ?? 'default'](!!props.disabled, open()),
          )}
          tabIndex="0"
          onClick={e => {
            setOpen(true)
            setWidth(e.currentTarget.offsetWidth)
            setCurrentFocusType(e.target !== endDom ? 'start' : 'end')
          }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <div ref={startDom} class="truncate">
            <Show
              when={!isNil(tempValue()[0])}
              fallback={
                <input
                  class="h-30px [outline:none] bg-inherit placeholder-text-[rgba(0,0,0,.25)]"
                  placeholder={props.placeholder?.[0]}
                  readOnly
                />
              }
            >
              {optionLabelRender(tempValue()[0]!)}
            </Show>
          </div>
          <span class="i-ant-design:swap-right-outlined w-32px" />
          <div ref={endDom} class="truncate">
            <Show
              when={!isNil(tempValue()[1])}
              fallback={
                <input
                  class="h-30px [outline:none] bg-inherit placeholder-text-[rgba(0,0,0,.25)]"
                  placeholder={props.placeholder?.[1]}
                  readOnly
                />
              }
            >
              {optionLabelRender(tempValue()[1]!)}
            </Show>
          </div>

          <div
            aria-label="active-bar"
            class="h-1px bg-[var(--ant-color-primary)] absolute bottom-0 transition-left"
            style={{
              display: open() ? 'block' : 'none',
              ...activeBarStyle(),
            }}
          />

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

export default RangeInput
