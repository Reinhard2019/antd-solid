import { isNil, omit } from 'lodash-es'
import { Show, createMemo, onMount, splitProps, useContext } from 'solid-js'
import type { JSX, Component } from 'solid-js'
import cs from 'classnames'
import createControllableValue from '../hooks/createControllableValue'
import Compact from '../Compact'
import { setRef, unwrapStringOrJSXElement } from '../utils/solid'
import ConfigProviderContext from '../ConfigProvider/context'
import { type RootStyleProps, type StringOrJSXElement } from '../types'
import TextArea from './TextArea'

type CommonInputProps = JSX.CustomAttributes<HTMLInputElement> &
RootStyleProps & {
  defaultValue?: string | null | undefined
  value?: string | null | undefined
  addonBefore?: StringOrJSXElement
  addonAfter?: StringOrJSXElement
  prefix?: StringOrJSXElement
  suffix?: StringOrJSXElement
  placeholder?: string
  /**
     * 仅供 InputNumber 使用
     */
  actions?: StringOrJSXElement
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

export function CommonInput(
  props: Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'onInput' | 'onKeyDown' | 'prefix' | 'suffix'
  > &
  CommonInputProps,
) {
  const { componentSize } = useContext(ConfigProviderContext)
  const size = createMemo(() => props.size ?? componentSize())
  const [{ onChange, onPressEnter, onKeyDown }, inputProps] = splitProps(props, [
    'defaultValue',
    'value',
    'class',
    'addonBefore',
    'addonAfter',
    'suffix',
    'onChange',
    'onPressEnter',
    'onKeyDown',
    'actions',
    'rootClass',
    'rootStyle',
  ])

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

  const addonBefore = createMemo(() => unwrapStringOrJSXElement(props.addonBefore))
  const addonAfter = createMemo(() => unwrapStringOrJSXElement(props.addonAfter))
  const prefix = createMemo(() => unwrapStringOrJSXElement(props.prefix))
  const suffix = createMemo(() => unwrapStringOrJSXElement(props.suffix))
  const actions = createMemo(() => unwrapStringOrJSXElement(props.actions))

  return (
    <Compact
      block
      class={props.rootClass}
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
        ...props.rootStyle,
      }}
    >
      <Show when={!isNil(addonBefore())}>
        <div
          class={cs(
            'ant-input-addon',
            'shrink-0 flex justify-center items-center px-11px bg-[rgba(0,0,0,.02)] [border:1px_solid_var(--ant-color-border)] border-r-0 rounded-l-6px',
            Compact.compactItemClass,
          )}
        >
          {addonBefore()}
        </div>
      </Show>

      <div
        class={cs(
          'flex items-center w-full relative p:hover-child[input]:border-[var(--ant-color-primary)]',
          ['[--actions-display:none]', !inputProps.disabled && 'hover:[--actions-display:block]'],
          'p-[--ant-input-padding]',
          {
            small: 'rounded-[var(--ant-border-radius-sm)]',
            middle: 'rounded-[var(--ant-border-radius)]',
            large: 'rounded-[var(--ant-border-radius-lg)]',
          }[size()],
          {
            small: 'h-24px',
            middle: 'h-32px',
            large: 'h-40px',
          }[size()],
          statusClassDict[props.status ?? 'default'](!!inputProps.disabled),
          Compact.compactItemClass,
        )}
      >
        <Show when={!isNil(prefix())}>
          <div class="mr-4px">{prefix()}</div>
        </Show>

        <input
          {...(inputProps as JSX.InputHTMLAttributes<HTMLInputElement>)}
          ref={el => {
            setRef(inputProps, el)
            input = el
          }}
          class={cs(
            'w-full h-full [font-size:var(--ant-input-font-size)] [outline:none] placeholder-text-[var(--ant-color-text-placeholder)] bg-transparent',
            inputProps.disabled && 'color-[var(--ant-color-text-disabled)] cursor-not-allowed',
            props.class,
          )}
          value={value() ?? ''}
          onInput={e => {
            setValue(e.target.value)
            try {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              onChange?.(e as any)
            } finally {
              if (isControlled() && e.target.value !== props.value) {
                e.target.value = props.value ?? ''
              }
            }
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              onPressEnter?.(e as any)
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            onKeyDown?.(e as any)
          }}
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
            'shrink-0 flex justify-center items-center px-11px bg-[rgba(0,0,0,.02)] [border:1px_solid_var(--ant-color-border)] border-l-0 rounded-r-6px',
            Compact.compactItemClass,
          )}
        >
          {addonAfter()}
        </div>
      </Show>
    </Compact>
  )
}

export type InputProps = Omit<
JSX.InputHTMLAttributes<HTMLInputElement>,
'onChange' | 'onInput' | 'onKeyDown' | 'prefix' | 'suffix'
> &
Omit<CommonInputProps, 'actions' | 'textarea'>

const Input: Component<InputProps> & {
  TextArea: typeof TextArea
} = props => {
  return <CommonInput {...omit(props, ['actions'])} />
}

export type { TextAreaProps } from './TextArea'

Input.TextArea = TextArea

export default Input
