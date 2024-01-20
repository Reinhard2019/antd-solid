import { isNil, omit } from 'lodash-es'
import { Show, createMemo, mergeProps, onMount, splitProps } from 'solid-js'
import type { JSX, JSXElement, Component } from 'solid-js'
import cs from 'classnames'
import { Dynamic } from 'solid-js/web'
import createControllableValue from '../hooks/createControllableValue'
import Compact from '../Compact'
import { setRef } from '../utils/solid'

type CommonInputProps<T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement> =
  JSX.CustomAttributes<T> & {
    textarea?: boolean
    defaultValue?: string | undefined
    value?: string | undefined
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
     * 默认 'default'
     * 高度分别为 40px、32px 和 24px
     */
    size?: 'small' | 'default' | 'large'
    autoFocus?: boolean
    onChange?: JSX.InputEventHandler<T, InputEvent>
    onPressEnter?: JSX.EventHandler<T, KeyboardEvent>
    onKeyDown?: JSX.EventHandler<T, KeyboardEvent>
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
        'hover:border-[var(--ant-light-error-color)] focus-within:[box-shadow:0_0_0_2px_rgba(255,38,5,.06)]',
    ),
  warning: (disabled: boolean) =>
    cs(
      '[border:1px_solid_var(--ant-warning-color)]',
      !disabled &&
        'hover:border-[var(--ant-color-warning-border-hover)] focus-within:[box-shadow:0_0_0_2px_rgba(255,215,5,.1)]',
    ),
}

export function CommonInput<T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement>(
  _props: CommonInputProps<T> &
  Omit<JSX.InputHTMLAttributes<T>, 'onChange' | 'onInput' | 'onKeyDown'>,
) {
  const props = mergeProps({ size: 'default' as const }, _props)
  const [{ style, onChange, onPressEnter, onKeyDown }, inputProps] = splitProps(props, [
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
    'style',
  ])

  let input: HTMLInputElement | HTMLTextAreaElement | undefined
  onMount(() => {
    if (props.autoFocus) {
      input?.focus()
    }
  })

  const [_, controllableProps] = splitProps(props, ['onChange'])
  const [value, setValue] = createControllableValue(controllableProps)

  const compactItemRoundedLeftClass = 'p[.ant-compact>:first-child]:rounded-l-6px'
  const compactItemRoundedRightClass = 'p[.ant-compact>:last-child]:rounded-r-6px'

  const inputWrapClass = createMemo(() =>
    cs(
      {
        small: 'px-7px py-0 rounded-[var(--ant-border-radius-sm)]',
        default: 'px-11px py-4px rounded-[var(--ant-border-radius)]',
        large: 'px-11px py-7px rounded-[var(--ant-border-radius-lg)]',
      }[props.size],
      !props.textarea &&
        {
          small: 'h-24px',
          default: 'h-32px',
          large: 'h-40px',
        }[props.size],
      props.addonBefore ? 'rounded-l-0' : compactItemRoundedLeftClass,
      props.addonAfter ? 'rounded-r-0' : compactItemRoundedRightClass,
      statusClassDict[props.status ?? 'default'](!!inputProps.disabled),
      Compact.compactItemRounded0Class,
      Compact.compactItemZIndexClass,
    ),
  )
  const hasPrefixOrSuffix = createMemo(
    () => !isNil(props.prefix) || !isNil(props.suffix) || !isNil(props.actions),
  )
  const inputJSX = (
    <Dynamic<Component<JSX.InputHTMLAttributes<HTMLInputElement>>>
      component={
        (props.textarea ? 'textarea' : 'input') as unknown as Component<
        JSX.InputHTMLAttributes<HTMLInputElement>
        >
      }
      {...(inputProps as JSX.InputHTMLAttributes<HTMLInputElement>)}
      ref={el => {
        setRef<HTMLInputElement | HTMLTextAreaElement>(inputProps, el)
        input = el
      }}
      class={cs(
        'w-full [outline:none] text-14px placeholder-text-[rgba(0,0,0,.25)]',
        !hasPrefixOrSuffix() && inputWrapClass(),
        inputProps.disabled && 'color-[var(--ant-color-text-disabled)] cursor-not-allowed',
      )}
      value={value() ?? ''}
      onInput={e => {
        setValue(e.target.value)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        onChange?.(e as any)
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
  )

  return (
    <div
      class={cs(
        'flex w-full',
        Compact.compactItemClass,
        inputProps.disabled &&
          'bg-[var(--ant-color-bg-container-disabled)] color-[var(--ant-color-text-disabled)] cursor-not-allowed',
      )}
      style={style}
    >
      <Show when={props.addonBefore}>
        <div
          class={cs(
            'shrink-0 flex justify-center items-center px-11px bg-[rgba(0,0,0,.02)] [border:1px_solid_var(--ant-color-border)] border-r-0 rounded-l-6px text-14px',
            Compact.compactItemRounded0Class,
            compactItemRoundedLeftClass,
          )}
        >
          {props.addonBefore}
        </div>
      </Show>

      <Show when={hasPrefixOrSuffix()} fallback={inputJSX}>
        <div
          class={cs(
            'flex items-center w-full relative p:hover-child[input]:border-[var(--ant-color-primary)]',
            inputWrapClass(),
            ['[--actions-display:none]', !inputProps.disabled && 'hover:[--actions-display:block]'],
          )}
        >
          <Show when={props.prefix}>
            <div class="mr-4px">{props.prefix}</div>
          </Show>

          {inputJSX}

          <Show when={props.suffix}>
            <div class="ml-4px">{props.suffix}</div>
          </Show>

          <Show when={props.actions}>
            <div class="[display:var(--actions-display)] absolute top-0 bottom-0 right-0 h-[calc(100%-2px)] translate-y-1px -translate-x-1px">
              {props.actions}
            </div>
          </Show>
        </div>
      </Show>

      <Show when={props.addonAfter}>
        <div
          class={cs(
            'shrink-0 flex justify-center items-center px-11px bg-[rgba(0,0,0,.02)] [border:1px_solid_var(--ant-color-border)] border-l-0 rounded-r-6px text-14px',
            Compact.compactItemRounded0Class,
            compactItemRoundedRightClass,
          )}
        >
          {props.addonAfter}
        </div>
      </Show>
    </div>
  )
}

export type InputProps = Omit<CommonInputProps, 'actions' | 'textarea'> &
Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onInput' | 'onKeyDown'>

export type TextAreaProps = Omit<
CommonInputProps<HTMLTextAreaElement>,
'prefix' | 'suffix' | 'textarea'
> &
Omit<
JSX.TextareaHTMLAttributes<HTMLTextAreaElement>,
'actions' | 'onChange' | 'onInput' | 'onKeyDown'
>

const Input: Component<InputProps> & {
  TextArea: Component<TextAreaProps>
} = props => {
  return <CommonInput {...omit(props, ['actions'])} />
}

Input.TextArea = props => {
  return (
    <CommonInput<HTMLTextAreaElement> textarea {...omit(props, ['prefix', 'suffix', 'actions'])} />
  )
}

export default Input
