import { omit } from 'lodash-es'
import { Show, splitProps } from 'solid-js'
import type { JSX, JSXElement, Component } from 'solid-js'
import cs from 'classnames'
import createControllableValue from './hooks/createControllableValue'
import { Dynamic } from 'solid-js/web'

type CommonInputProps<T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement> = JSX.CustomAttributes<T> & {
  textarea?: boolean
  defaultValue?: string | undefined
  value?: string | undefined
  addonBefore?: JSXElement
  addonAfter?: JSXElement
  /**
   * 仅供 InputNumber 使用
   */
  inputAfter?: JSXElement
  placeholder?: string
  onChange?: JSX.InputEventHandler<T, InputEvent>
  onPressEnter?: JSX.EventHandler<T, KeyboardEvent>
  onKeyDown?: JSX.EventHandler<T, KeyboardEvent>
}

export function CommonInput<T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement>(props: CommonInputProps<T> &
Omit<JSX.InputHTMLAttributes<T>, 'onChange' | 'onInput' | 'onKeyDown'>) {
  const [{ onChange, onPressEnter, onKeyDown }, inputProps] = splitProps(props, [
    'defaultValue',
    'value',
    'class',
    'addonBefore',
    'addonAfter',
    'inputAfter',
    'onChange',
    'onPressEnter',
    'onKeyDown',
  ])

  const [_, controllableProps] = splitProps(props, ['onChange'])
  const [value, setValue] = createControllableValue(controllableProps)

  return (
    <div class="ant-flex ant-w-full">
      <Show when={props.addonBefore}>
        <div class="ant-shrink-0 ant-flex ant-justify-center ant-items-center ant-px-11px ant-bg-[rgba(0,0,0,.02)] ant-[border:1px_solid_var(--border-color)] ant-border-r-0 ant-rounded-l-6px ant-text-14px">
          {props.addonBefore}
        </div>
      </Show>

      <div class="ant-w-full ant-relative ant-[--input-after-display:none] hover:ant-[--input-after-display:block] p-hover-child[input]:ant-border-[var(--primary-color)]">
        <Dynamic<Component<JSX.InputHTMLAttributes<HTMLInputElement>>>
          component={
            (props.textarea ? 'textarea' : 'input') as unknown as Component<
            JSX.InputHTMLAttributes<HTMLInputElement>
            >
          }
          {...inputProps as JSX.InputHTMLAttributes<HTMLInputElement>}
          class={cs(
            'ant-w-full ant-py-0 ant-px-11px ant-[outline:none] ant-text-14px ant-rounded-6px ant-[border:1px_solid_var(--border-color)] focus:ant-border-[var(--primary-color)] focus:ant-[box-shadow:0_0_0_2px_rgba(5,145,255,0.1)] ant-py-8px',
            !props.textarea && 'ant-h-32px',
            props.class,
            props.addonBefore && 'ant-rounded-l-0',
            props.addonAfter && 'ant-rounded-r-0',
          )}
          value={value() ?? ''}
          onInput={e => {
            setValue(e.target.value)
            onChange?.(e as any)
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              onPressEnter?.(e as any)
            }

            onKeyDown?.(e as any)
          }}
        />

        <Show when={props.inputAfter}>
          <div class="ant-[display:var(--input-after-display)] ant-absolute ant-top-0 ant-bottom-0 ant-right-0 ant-h-[calc(100%-2px)] ant-translate-y-1px -ant-translate-x-1px">
            {props.inputAfter}
          </div>
        </Show>
      </div>

      <Show when={props.addonAfter}>
        <div class="ant-shrink-0 ant-flex ant-justify-center ant-items-center ant-px-11px ant-bg-[rgba(0,0,0,.02)] ant-[border:1px_solid_var(--border-color)] ant-border-l-0 ant-rounded-r-6px ant-text-14px">
          {props.addonAfter}
        </div>
      </Show>
    </div>
  )
}

export type InputProps = Omit<CommonInputProps, 'inputAfter' | 'textarea'> &
Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onInput' | 'onKeyDown'>

export type TextAreaProps = Omit<CommonInputProps<HTMLTextAreaElement>, 'inputAfter' | 'textarea'> &
Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'onInput' | 'onKeyDown'>

const Input: Component<InputProps> & {
  TextArea: Component<TextAreaProps>
} = props => {
  return <CommonInput {...omit(props, ['inputAfter'])} />
}

Input.TextArea = props => {
  return <CommonInput<HTMLTextAreaElement> textarea {...omit(props, ['inputAfter'])} />
}

export default Input
