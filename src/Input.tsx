import { isNil, omit } from 'lodash-es'
import { Show, createMemo, splitProps } from 'solid-js'
import type { JSX, JSXElement, Component } from 'solid-js'
import cs from 'classnames'
import createControllableValue from './hooks/createControllableValue'
import { Dynamic } from 'solid-js/web'
import Compact from './Compact'

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
    onChange?: JSX.InputEventHandler<T, InputEvent>
    onPressEnter?: JSX.EventHandler<T, KeyboardEvent>
    onKeyDown?: JSX.EventHandler<T, KeyboardEvent>
  }

const statusClassDict = {
  default: (disabled: boolean) =>
    cs(
      'ant-[border:1px_solid_var(--ant-color-border)]',
      !disabled &&
        'hover:ant-border-[var(--primary-color)] focus-within:ant-border-[var(--primary-color)] focus-within:ant-[box-shadow:0_0_0_2px_rgba(5,145,255,0.1)]',
    ),
  error: (disabled: boolean) =>
    cs(
      'ant-[border:1px_solid_var(--ant-color-error)]',
      !disabled &&
        'hover:ant-border-[var(--light-error-color)] focus-within:ant-[box-shadow:0_0_0_2px_rgba(255,38,5,.06)]',
    ),
  warning: (disabled: boolean) =>
    cs(
      'ant-[border:1px_solid_var(--warning-color)]',
      !disabled &&
        'hover:ant-border-[var(--color-warning-border-hover)] focus-within:ant-[box-shadow:0_0_0_2px_rgba(255,215,5,.1)]',
    ),
}

export function CommonInput<T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement>(
  props: CommonInputProps<T> &
  Omit<JSX.InputHTMLAttributes<T>, 'onChange' | 'onInput' | 'onKeyDown'>,
) {
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

  const [_, controllableProps] = splitProps(props, ['onChange'])
  const [value, setValue] = createControllableValue(controllableProps)

  const inputWrapClass = createMemo(() =>
    cs(
      'ant-px-11px ant-py-4px ant-rounded-6px',
      !props.textarea && 'ant-h-32px',
      props.addonBefore ? 'ant-rounded-l-0' : Compact.compactItemRoundedLeftClass,
      props.addonAfter ? 'ant-rounded-r-0' : Compact.compactItemRoundedRightClass,
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
      class={cs(
        'ant-w-full ant-[outline:none] ant-text-14px',
        !hasPrefixOrSuffix() && inputWrapClass(),
        inputProps.disabled &&
          'ant-bg-[var(--ant-color-bg-container-disabled)] ant-cursor-not-allowed',
      )}
      value={value() ?? ''}
      onInput={e => {
        setValue(e.target.value)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        onChange?.(e as any)

        if (Object.keys(props).includes('value')) {
          e.target.value = value()
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
  )

  return (
    <div class={cs('ant-flex ant-w-full', Compact.compactItemClass)} style={style}>
      <Show when={props.addonBefore}>
        <div
          class={cs(
            'ant-shrink-0 ant-flex ant-justify-center ant-items-center ant-px-11px ant-bg-[rgba(0,0,0,.02)] ant-[border:1px_solid_var(--ant-color-border)] ant-border-r-0 ant-rounded-l-6px ant-text-14px',
            Compact.compactItemRounded0Class,
            Compact.compactItemRoundedLeftClass,
          )}
        >
          {props.addonBefore}
        </div>
      </Show>

      <Show when={hasPrefixOrSuffix()} fallback={inputJSX}>
        <div
          class={cs(
            'ant-flex ant-items-center ant-w-full ant-relative ant-[--input-after-display:none] hover:ant-[--input-after-display:block] p:hover-child[input]:ant-border-[var(--primary-color)]',
            inputWrapClass(),
          )}
        >
          <Show when={props.prefix}>
            <div class="ant-mr-4px">{props.prefix}</div>
          </Show>

          {inputJSX}

          <Show when={props.suffix}>
            <div class="ant-ml-4px">{props.suffix}</div>
          </Show>

          <Show when={props.actions}>
            <div class="ant-[display:var(--input-after-display)] ant-absolute ant-top-0 ant-bottom-0 ant-right-0 ant-h-[calc(100%-2px)] ant-translate-y-1px -ant-translate-x-1px">
              {props.actions}
            </div>
          </Show>
        </div>
      </Show>

      <Show when={props.addonAfter}>
        <div
          class={cs(
            'ant-shrink-0 ant-flex ant-justify-center ant-items-center ant-px-11px ant-bg-[rgba(0,0,0,.02)] ant-[border:1px_solid_var(--ant-color-border)] ant-border-l-0 ant-rounded-r-6px ant-text-14px',
            Compact.compactItemRounded0Class,
            Compact.compactItemRoundedRightClass,
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
