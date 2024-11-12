import { isNil, omit } from 'lodash-es'
import { Show, createMemo, onMount } from 'solid-js'
import type { JSX, Component, JSXElement, Ref } from 'solid-js'
import cs from 'classnames'
import createControllableValue from '../hooks/createControllableValue'
import { setRef } from '../utils/solid'
import Element from '../Element'
import TextArea from './TextArea'
import useComponentSize from '../hooks/useComponentSize'
import './index.scss'
import { type StyleProps } from '../types'

type CommonInputProps = StyleProps & {
  ref?: Ref<HTMLInputElement>
  defaultValue?: string | null | undefined
  value?: string | null | undefined
  addonBefore?: JSXElement
  addonAfter?: JSXElement
  prefix?: JSXElement
  suffix?: JSXElement
  placeholder?: string
  /**
   * 仅供 InputNumber 使用
   */
  actions?: JSXElement
  /**
   * 设置校验状态
   */
  status?: 'error' | 'warning'
  /**
   * 设置尺寸
   * 默认 'middle'
   * 高度分别为 40px、32px 和 24px
   */
  size?: 'small' | 'middle' | 'large'
  autoFocus?: boolean
  allowClear?: boolean
  onChange?: JSX.InputEventHandler<HTMLInputElement, InputEvent>
  onPressEnter?: JSX.EventHandler<HTMLInputElement, KeyboardEvent>
  onKeyDown?: JSX.EventHandler<HTMLInputElement, KeyboardEvent>
  onFocus?: JSX.EventHandler<HTMLInputElement, FocusEvent>
  onBlur?: JSX.EventHandler<HTMLInputElement, FocusEvent>
  disabled?: boolean
  /**
   * 声明 input 类型，同原生 input 标签的 type 属性
   */
  type?: string
  maxLength?: number
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

export function CommonInput(props: CommonInputProps) {
  const size = useComponentSize(() => props.size)

  let input: HTMLInputElement | undefined
  onMount(() => {
    if (props.autoFocus) {
      input?.focus()
    }
  })

  const isControlled = () => Object.keys(props).includes('value')

  const [value, setValue] = createControllableValue(props, {
    trigger: null,
  })
  const showClearBtn = createMemo(() => !props.disabled && props.allowClear && value())

  const addonBefore = createMemo(() => props.addonBefore)
  const addonAfter = createMemo(() => props.addonAfter)
  const prefix = createMemo(() => props.prefix)
  const suffix = createMemo(() => props.suffix)
  const actions = createMemo(() => props.actions)

  return (
    <Element
      block
      class={cs(props.class, 'flex', 'ant-input-group', 'p[.ant-compact>]:not-first:ml--1px')}
      style={{
        '--ant-input-padding': {
          small: '0 7px',
          middle: '4px 11px',
          large: '7px 11px',
        }[size()],
        '--ant-input-font-size': {
          small: 'var(--ant-font-size)',
          middle: 'var(--ant-font-size)',
          large: 'var(--ant-font-size-lg)',
        }[size()],
        '--ant-input-border-radius': {
          small: 'var(--ant-border-radius-sm)',
          middle: 'var(--ant-border-radius)',
          large: 'var(--ant-border-radius-lg)',
        }[size()],
        ...props.style,
      }}
    >
      <Show when={!isNil(addonBefore())}>
        <div
          class={cs(
            'ant-input-addon',
            'shrink-0 flex justify-center items-center px-11px bg-[rgba(0,0,0,.02)] [border:1px_solid_var(--ant-color-border)] border-r-0',
          )}
        >
          {addonBefore()}
        </div>
      </Show>

      <div
        class={cs(
          'ant-input-affix-wrapper',
          'flex items-center w-full relative p:hover-child[input]:border-[--ant-color-primary] bg-[--ant-color-bg-container]',
          ['[--actions-display:none]', !props.disabled && 'hover:[--actions-display:block]'],
          'p-[--ant-input-padding]',
          {
            small: 'h-24px',
            middle: 'h-32px',
            large: 'h-40px',
          }[size()],
          statusClassDict[props.status ?? 'default'](!!props.disabled),
        )}
      >
        <Show when={!isNil(prefix())}>
          <div class="mr-4px">{prefix()}</div>
        </Show>

        <input
          ref={el => {
            setRef(props, el)
            input = el
          }}
          class={cs(
            'w-full h-full [font-size:var(--ant-input-font-size)] [outline:none] placeholder-text-[var(--ant-color-text-placeholder)] bg-transparent',
            props.disabled && 'color-[var(--ant-color-text-disabled)] cursor-not-allowed',
          )}
          type={props.type}
          value={value() ?? ''}
          onInput={e => {
            setValue(e.target.value)
            try {
              props.onChange?.(e)
            } finally {
              if (isControlled() && e.target.value !== props.value) {
                e.target.value = props.value ?? ''
              }
            }
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              props.onPressEnter?.(e)
            }

            props.onKeyDown?.(e)
          }}
          onFocus={e => props.onFocus?.(e)}
          onBlur={e => props.onBlur?.(e)}
          maxLength={props.maxLength}
          disabled={props.disabled}
          placeholder={props.placeholder}
        />

        <Show when={showClearBtn()}>
          <span
            class="ml-4px i-ant-design:close-circle-filled cursor-pointer text-[var(--ant-color-text-quaternary)] hover:text-[var(--ant-color-text-tertiary)] active:text-[var(--ant-color-text)]"
            onClick={e => {
              e.stopPropagation()

              input!.value = ''
              const inputEvent = new InputEvent('input', { bubbles: true })
              input!.dispatchEvent(inputEvent)

              input?.focus()
            }}
          />
        </Show>

        <Show when={!isNil(suffix())}>
          <div class="ml-4px">{suffix()}</div>
        </Show>

        <Show when={!isNil(actions())}>
          <div class="[display:var(--actions-display)] absolute top-0 bottom-0 right-0 h-[calc(100%-2px)] translate-y-1px -translate-x-1px">
            {actions()}
          </div>
        </Show>
      </div>

      <Show when={!isNil(addonAfter())}>
        <div
          class={cs(
            'ant-input-addon',
            'shrink-0 flex justify-center items-center px-11px bg-[rgba(0,0,0,.02)] [border:1px_solid_var(--ant-color-border)] border-l-0',
          )}
        >
          {addonAfter()}
        </div>
      </Show>
    </Element>
  )
}

export type InputProps = Omit<CommonInputProps, 'actions' | 'textarea'>

const Input: Component<InputProps> & {
  TextArea: typeof TextArea
} = props => {
  return <CommonInput {...omit(props, ['actions'])} />
}

export type { TextAreaProps } from './TextArea'

Input.TextArea = TextArea

export default Input
