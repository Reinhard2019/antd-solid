import {
  type JSXElement,
  type JSX,
  For,
  createSignal,
  Show,
  createMemo,
  mergeProps,
  useContext,
} from 'solid-js'
import cs from 'classnames'
import { compact, isUndefined, pick } from 'lodash-es'
import { Dynamic } from 'solid-js/web'
import Tooltip, { type TooltipProps } from '../Tooltip'
import createControllableValue from '../hooks/createControllableValue'
import { useClickAway } from '../hooks'
import Element from '../Element'
import useComponentSize from '../hooks/useComponentSize'
import CompactContext from '../Compact/context'

export interface SelectInputProps<T>
  extends Pick<TooltipProps, 'getPopupContainer' | 'defaultOpen' | 'open' | 'onOpenChange'> {
  multiple?: boolean
  defaultValue?: T[] | null
  value?: T[] | null
  onChange?: (value: T[]) => void
  labelRender?: (value: T) => JSXElement
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
  /**
   * 形态变体
   * 默认 'outlined'
   */
  variant?: 'outlined' | 'borderless' | 'filled'
  /**
   * 自定义的选择框后缀图标
   */
  suffixIcon?: JSXElement
  /**
   * 选择框弹出的位置
   * 默认 'bottomLeft'
   */
  placement?: 'bottomLeft' | 'bottom' | 'bottomRight' | 'topLeft' | 'top' | 'topRight'
}

function SelectInput<T>(_props: SelectInputProps<T>) {
  let select: HTMLDivElement | undefined
  let tooltipContent: HTMLDivElement | undefined

  const { compact: isCompact } = useContext(CompactContext)
  const props = mergeProps(
    {
      variant: 'outlined',
      placement: 'bottomLeft',
    } as const,
    _props,
  )
  const size = useComponentSize(() => props.size)
  const [value, setValue] = createControllableValue<T[] | undefined>(props, {
    defaultValue: [],
  })
  const valueArr = createMemo(() => value() ?? [])

  const [open, setOpen] = createControllableValue(_props, {
    defaultValue: false,
    defaultValuePropName: 'defaultOpen',
    valuePropName: 'open',
    trigger: 'onOpenChange',
  })
  useClickAway(
    () => setOpen(false),
    () => compact([select, tooltipContent]),
  )

  const [popupMatchWidth, setPopupMatchWidth] = createSignal(0)
  const [hover, setHover] = createSignal(false)
  const showClearBtn = createMemo(() => props.allowClear && hover() && valueArr().length > 0)

  const optionLabelRender = (v: T) => (props.labelRender ? props.labelRender(v) : String(v))

  const style = createMemo(() => ({
    '--ant-select-input-font-size': {
      small: 'var(--ant-font-size)',
      middle: 'var(--ant-font-size)',
      large: 'var(--ant-font-size-lg)',
    }[size()],
    '--ant-select-input-padding-right': {
      small: '7px',
      middle: '11px',
      large: '11px',
    }[size()],
    '--ant-select-input-padding-left':
      valueArr().length && props.multiple ? '4px' : 'var(--ant-select-input-padding-right)',
    '--ant-select-input-padding':
      '0 var(--ant-select-input-padding-right) 0 var(--ant-select-input-padding-left)',
    '--ant-select-input-addon-after-padding': '0 0 0 var(--ant-padding-xs)',
    '--ant-select-popup-match-width': `${popupMatchWidth()}px`,
    '--ant-select-popup-font-size': {
      small: 'var(--ant-font-size)',
      middle: 'var(--ant-font-size)',
      large: 'var(--ant-font-size-lg)',
    }[size()],
    ...props.style,
  }))

  return (
    <Element
      ref={select!}
      class={cs(
        '!p[.ant-input-addon]:my--1px !p[.ant-input-addon]:mx--12px',
        'rounded-6px cursor-pointer inline-block text-[var(--ant-color-text)] leading-[var(--ant-line-height)]',
        isCompact && 'ant-compact-item',
        props.class,
        props.disabled && 'cursor-not-allowed',
      )}
      style={style()}
    >
      <Tooltip
        plain
        open={open()}
        onOpenChange={setOpen}
        trigger={false}
        placement={props.placement}
        arrow={false}
        contentStyle={{
          padding: 0,
        }}
        content={() => (
          <div
            ref={tooltipContent}
            class="w-[--ant-select-popup-match-width] max-h-400px overflow-auto [font-size:var(--ant-select-popup-font-size)]"
            style={{
              ...pick(style(), ['--ant-select-popup-font-size', '--ant-select-popup-match-width']),
            }}
          >
            {props.content(() => setOpen(false))}
          </div>
        )}
        getPopupContainer={props.getPopupContainer}
      >
        <div
          class={cs(
            'p[.ant-input-addon]:border-transparent p[.ant-input-addon]:bg-transparent p[.ant-input-addon]:focus-within:border-transparent p[.ant-input-addon]:hover:border-transparent p[.ant-input-addon]:focus-within:[box-shadow:none]',
            'relative h-[--ant-select-input-height] rounded-inherit py-1px flex items-center [font-size:var(--ant-select-input-font-size)] p-[--ant-select-input-padding]',
            props.disabled &&
              '[pointer-events:none] bg-[var(--ant-color-bg-container-disabled)] color-[var(--ant-color-text-disabled)]',
            props.variant === 'outlined' &&
              {
                default: cs(
                  'border-1px border-solid border-[--ant-color-border] bg-[--ant-color-bg-container]',
                  !props.disabled &&
                    'hover:border-[var(--ant-color-primary)] focus-within:border-[var(--ant-color-primary)] focus-within:[box-shadow:0_0_0_2px_var(--ant-control-outline)]',
                ),
                error: cs(
                  'border-1px border-solid border-[--ant-color-error] bg-[--ant-color-bg-container]',
                  !props.disabled &&
                    'hover:border-[var(--ant-color-error-border-hover)] focus-within:[box-shadow:0_0_0_2px_rgba(255,38,5,.06)]',
                ),
                warning: cs(
                  'border-1px border-solid border-[--ant-color-warning] bg-[--ant-color-bg-container]',
                  !props.disabled &&
                    'hover:border-[var(--ant-color-warning-border-hover)] focus-within:[box-shadow:0_0_0_2px_rgba(255,215,5,.1)]',
                ),
              }[props.status ?? 'default'],
            props.variant === 'filled' &&
              {
                default: cs(
                  'bg-[--ant-color-fill-tertiary]',
                  !props.disabled && 'hover:bg-[--ant-color-fill-secondary]',
                ),
                error: cs(
                  'bg-[--ant-color-error-bg]',
                  !props.disabled && 'hover:bg-[--ant-color-error-bg-hover]',
                ),
                warning: cs(
                  'bg-[--ant-color-warning-bg]',
                  !props.disabled && 'hover:bg-[--ant-color-warning-bg-hover]',
                ),
              }[props.status ?? 'default'],
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
            setOpen(v => !v)
            setPopupMatchWidth(e.currentTarget.offsetWidth)
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
                <Dynamic
                  component={() => {
                    const optionLabel = createMemo(() => optionLabelRender(valueArr()[0]))
                    return (
                      <div
                        class="w-full h-[calc(var(--ant-select-input-height)-2px)] leading-[calc(var(--ant-select-input-height)-2px)] ellipsis"
                        title={
                          typeof optionLabel() === 'string' ? (optionLabel() as string) : undefined
                        }
                      >
                        {optionLabel()}
                      </div>
                    )
                  }}
                />
              }
            >
              <div class="w-full">
                <For each={valueArr()}>
                  {item => {
                    const optionLabel = createMemo(() => optionLabelRender(valueArr()[0]))
                    return (
                      <span
                        class="inline-block my-2px mr-4px bg-[var(--ant-select-multiple-item-bg)] leading-[var(--ant-select-multiple-item-height)] h-[var(--ant-select-multiple-item-height)] pl-8px pr-4px rounded-[var(--ant-border-radius-sm)]"
                        title={
                          typeof optionLabel() === 'string' ? (optionLabel() as string) : undefined
                        }
                      >
                        {optionLabel()}
                        <span
                          class="i-ant-design:close-outlined text-[var(--ant-color-icon)] hover:text-[var(--ant-color-icon-hover)] text-12px cursor-pointer"
                          onClick={() => setValue(valueArr().filter(v => v !== item))}
                        />
                      </span>
                    )
                  }}
                </For>
              </div>
            </Show>
          </Show>

          <div
            class={cs(
              'shrink-0 flex justify-end items-center p-[--ant-select-input-addon-after-padding] empty:hidden',
            )}
          >
            <Show
              when={showClearBtn()}
              fallback={
                <Show when={isUndefined(props.suffixIcon)} fallback={props.suffixIcon}>
                  <span class="i-ant-design:down-outlined text-[var(--ant-color-text-quaternary)] text-12px" />
                </Show>
              }
            >
              <span
                class="right-[--ant-select-input-padding-right] i-ant-design:close-circle-filled cursor-pointer text-[var(--ant-color-text-quaternary)] hover:text-[var(--ant-color-text-tertiary)] active:text-[var(--ant-color-text)]"
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
