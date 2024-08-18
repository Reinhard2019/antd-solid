import { isNil, omit } from 'lodash-es'
import { Show, createMemo, onMount, splitProps, useContext } from 'solid-js'
import type { JSX, Component } from 'solid-js'
import cs from 'classnames'
import { Dynamic } from 'solid-js/web'
import createControllableValue from '../hooks/createControllableValue'
import Compact from '../Compact'
import { setRef, unwrapStringOrJSXElement } from '../utils/solid'
import Element from '../Element'
import ConfigProviderContext from '../ConfigProvider/context'
import { type RootStyleProps, type StringOrJSXElement } from '../types'

type CommonInputProps<T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement> =
  JSX.CustomAttributes<T> &
  RootStyleProps & {
    textarea?: boolean
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
    style?: JSX.CSSProperties
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
        'hover:border-[var(--ant-color-error-border-hover)] focus-within:[box-shadow:0_0_0_2px_rgba(255,38,5,.06)]',
    ),
  warning: (disabled: boolean) =>
    cs(
      '[border:1px_solid_var(--ant-color-warning)]',
      !disabled &&
        'hover:border-[var(--ant-color-warning-border-hover)] focus-within:[box-shadow:0_0_0_2px_rgba(255,215,5,.1)]',
    ),
}

export function CommonInput<T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement>(
  props: Omit<
  JSX.InputHTMLAttributes<T>,
  'onChange' | 'onInput' | 'onKeyDown' | 'prefix' | 'suffix'
  > &
  CommonInputProps<T>,
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

  let input: HTMLInputElement | HTMLTextAreaElement | undefined
  onMount(() => {
    if (props.autoFocus) {
      input?.focus()
    }
  })

  const isControlled = () => Object.keys(props).includes('value')

  const [_, controllableProps] = splitProps(props, ['onChange'])
  const [value, setValue] = createControllableValue(controllableProps)
  const showClearBtn = createMemo(() => props.allowClear && value())

  const compactItemRoundedLeftClass = 'p[.ant-compact>:first-child]:rounded-l-6px'
  const compactItemRoundedRightClass = 'p[.ant-compact>:last-child]:rounded-r-6px'

  const addonBefore = createMemo(() => unwrapStringOrJSXElement(props.addonBefore))
  const addonAfter = createMemo(() => unwrapStringOrJSXElement(props.addonAfter))
  const prefix = createMemo(() => unwrapStringOrJSXElement(props.prefix))
  const suffix = createMemo(() => unwrapStringOrJSXElement(props.suffix))
  const actions = createMemo(() => unwrapStringOrJSXElement(props.actions))

  const inputWrapClass = createMemo(() =>
    cs(
      'p-[--ant-input-padding]',
      {
        small: 'rounded-[var(--ant-border-radius-sm)]',
        middle: 'rounded-[var(--ant-border-radius)]',
        large: 'rounded-[var(--ant-border-radius-lg)]',
      }[size()],
      !props.textarea &&
        {
          small: 'h-24px',
          middle: 'h-32px',
          large: 'h-40px',
        }[size()],
      addonBefore() ? 'rounded-l-0' : compactItemRoundedLeftClass,
      addonAfter() ? 'rounded-r-0' : compactItemRoundedRightClass,
      statusClassDict[props.status ?? 'default'](!!inputProps.disabled),
      Compact.compactItemRounded0Class,
      Compact.compactItemZIndexClass,
    ),
  )
  const hasPrefixOrSuffix = createMemo(
    () => !isNil(prefix()) || !isNil(suffix()) || !isNil(actions()),
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
        'w-full h-full [font-size:var(--ant-input-font-size)] [outline:none] placeholder-text-[var(--ant-color-text-placeholder)] bg-transparent',
        !hasPrefixOrSuffix() && inputWrapClass(),
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
  )

  return (
    <Element
      class={cs(
        props.rootClass,
        'flex w-full relative text-[var(--ant-color-text)] leading-[var(--ant-line-height)] [font-size:var(--ant-input-font-size)]',
        Compact.compactItemClass,
        inputProps.disabled &&
          'bg-[var(--ant-color-bg-container-disabled)] color-[var(--ant-color-text-disabled)] cursor-not-allowed',
      )}
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
      <Show when={addonBefore()}>
        <div
          class={cs(
            'ant-input-addon',
            'shrink-0 flex justify-center items-center px-11px bg-[rgba(0,0,0,.02)] [border:1px_solid_var(--ant-color-border)] border-r-0 rounded-l-6px',
            Compact.compactItemRounded0Class,
            compactItemRoundedLeftClass,
          )}
        >
          {addonBefore()}
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
          <Show when={!isNil(prefix())}>
            <div class="mr-4px">{prefix()}</div>
          </Show>

          {inputJSX}

          <Show when={!isNil(suffix())}>
            <div class="ml-4px">{suffix()}</div>
          </Show>

          <Show when={!isNil(actions())}>
            <div class="[display:var(--actions-display)] absolute top-0 bottom-0 right-0 h-[calc(100%-2px)] translate-y-1px -translate-x-1px">
              {actions()}
            </div>
          </Show>
        </div>
      </Show>

      <Show when={addonAfter()}>
        <div
          class={cs(
            'ant-input-addon',
            'shrink-0 flex justify-center items-center px-11px bg-[rgba(0,0,0,.02)] [border:1px_solid_var(--ant-color-border)] border-l-0 rounded-r-6px',
            Compact.compactItemRounded0Class,
            compactItemRoundedRightClass,
          )}
        >
          {addonAfter()}
        </div>
      </Show>

      <Show when={showClearBtn()}>
        <span
          class="i-ant-design:close-circle-filled absolute top-1/2 right-11px -translate-y-1/2 cursor-pointer text-[var(--ant-color-text-quaternary)] hover:text-[var(--ant-color-text-tertiary)] active:text-[var(--ant-color-text)]"
          onClick={e => {
            e.stopPropagation()

            input!.value = ''
            const inputEvent = new InputEvent('input', { bubbles: true })
            input!.dispatchEvent(inputEvent)

            input?.focus()
          }}
        />
      </Show>
    </Element>
  )
}

export type InputProps = Omit<
JSX.InputHTMLAttributes<HTMLInputElement>,
'onChange' | 'onInput' | 'onKeyDown' | 'prefix' | 'suffix'
> &
Omit<CommonInputProps, 'actions' | 'textarea'>

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
