import { isNil, omit } from 'lodash-es'
import { Show, createMemo, onMount, splitProps, useContext } from 'solid-js'
import type { JSX, Component, JSXElement, Ref } from 'solid-js'
import cs from 'classnames'
import createControllableValue from '../hooks/createControllableValue'
import { setRef } from '../utils/solid'
import Element from '../Element'
import TextArea from './TextArea'
import useComponentSize from '../hooks/useComponentSize'
import './index.scss'
import { type RootStyleProps } from '../types'
import useFocus from '../hooks/useFocus'
import CompactContext from '../Compact/context'

type CommonInputProps = RootStyleProps &
Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'prefix' | 'suffix'> & {
  ref?: Ref<HTMLInputElement>
  defaultValue?: string | null | undefined
  value?: string | null | undefined
  addonBefore?: JSXElement
  addonBeforeHTMLAttributes?: JSX.HTMLAttributes<HTMLDivElement>
  addonAfter?: JSXElement
  addonAfterHTMLAttributes?: JSX.HTMLAttributes<HTMLDivElement>
  prefix?: JSXElement
  prefixHTMLAttributes?: JSX.HTMLAttributes<HTMLDivElement>
  suffix?: JSXElement
  suffixHTMLAttributes?: JSX.HTMLAttributes<HTMLDivElement>
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
  affixWrapperHTMLAttributes?: JSX.HTMLAttributes<HTMLDivElement>
}

export const statusClassDict = {
  default: (disabled: boolean, foucs: boolean) => {
    if (disabled) {
      return 'border-[--ant-color-border]'
    }
    if (foucs) {
      return 'border-[--ant-color-primary] [box-shadow:0_0_0_2px_rgba(5,145,255,0.1)]'
    }
    return 'border-[--ant-color-border] hover:border-[--ant-color-primary]'
  },
  error: (disabled: boolean, foucs: boolean) => {
    if (disabled) {
      return 'border-[--ant-color-error]'
    }
    if (foucs) {
      return 'border-[--ant-color-error] [box-shadow:0_0_0_2px_rgba(255,38,5,.06)]'
    }
    return 'border-[--ant-color-error] hover:border-[--ant-color-error-border-hover]'
  },
  warning: (disabled: boolean, foucs: boolean) => {
    if (disabled) {
      return 'border-[--ant-color-warning]'
    }
    if (foucs) {
      return 'border-[--ant-color-warning] [box-shadow:0_0_0_2px_rgba(255,215,5,.1)]'
    }
    return 'border-[--ant-color-warning] hover:border-[--ant-color-warning-border-hover]'
  },
}

export function CommonInput(props: CommonInputProps) {
  const size = useComponentSize(() => props.size)
  const { compact } = useContext(CompactContext)
  const [_, inputProps] = splitProps(props, [
    'defaultValue',
    'value',
    'onChange',
    'onPressEnter',
    'onKeyDown',
    'size',
    'autoFocus',
    'status',
    'actions',
    'addonBefore',
    'addonAfter',
    'prefix',
    'suffix',
    'allowClear',
  ])

  let inputRef: HTMLInputElement | undefined
  const foucs = useFocus(() => inputRef)

  onMount(() => {
    if (props.autoFocus) {
      inputRef?.focus()
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

  let isComposition = false

  return (
    <Element
      block
      class={cs(
        props.rootClass,
        'flex',
        'ant-input-group',
        compact && 'ant-compact-item p[.ant-compact>]:not-first:ml--1px',
        {
          small: 'h-24px',
          middle: 'h-32px',
          large: 'h-40px',
        }[size()],
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
        '--ant-input-border-radius': {
          small: 'var(--ant-border-radius-sm)',
          middle: 'var(--ant-border-radius)',
          large: 'var(--ant-border-radius-lg)',
        }[size()],
        ...props.rootStyle,
      }}
    >
      <Show when={!isNil(addonBefore())}>
        <div
          {...props.addonBeforeHTMLAttributes}
          class={cs(
            props.addonBeforeHTMLAttributes?.class,
            'ant-input-addon ant-input-addon-before',
            'shrink-0 flex justify-center items-center px-11px bg-[rgba(0,0,0,.02)] [border:1px_solid_var(--ant-color-border)] border-r-0',
          )}
        >
          {addonBefore()}
        </div>
      </Show>

      <div
        {...props.affixWrapperHTMLAttributes}
        class={cs(
          props.affixWrapperHTMLAttributes?.class,
          'ant-input-affix-wrapper',
          'flex items-center w-full relative p:hover-child[input]:border-[--ant-color-primary] bg-[--ant-color-bg-container] p-[--ant-input-padding] border-1px border-solid',
          ['[--actions-display:none]', !props.disabled && 'hover:[--actions-display:block]'],
          statusClassDict[props.status ?? 'default'](!!props.disabled, foucs()),
        )}
      >
        <Show when={!isNil(prefix())}>
          <div
            {...props.prefixHTMLAttributes}
            class={cs(props.prefixHTMLAttributes?.class, 'mr-4px')}
          >
            {prefix()}
          </div>
        </Show>

        <input
          {...inputProps}
          ref={el => {
            setRef(props, el)
            inputRef = el
          }}
          class={cs(
            'w-full h-full [font-size:var(--ant-input-font-size)] [outline:none] placeholder-text-[var(--ant-color-text-placeholder)] bg-transparent',
            props.disabled && 'color-[var(--ant-color-text-disabled)] cursor-not-allowed',
            props.class,
          )}
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
          onCompositionStart={() => {
            isComposition = true
          }}
          onCompositionEnd={() => {
            isComposition = false
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && !isComposition) {
              props.onPressEnter?.(e)
            }

            props.onKeyDown?.(e)
          }}
        />

        <Show when={showClearBtn()}>
          <span
            class="ml-4px i-ant-design:close-circle-filled cursor-pointer text-[var(--ant-color-text-quaternary)] hover:text-[var(--ant-color-text-tertiary)] active:text-[var(--ant-color-text)]"
            onClick={e => {
              e.stopPropagation()

              inputRef!.value = ''
              const inputEvent = new InputEvent('input', { bubbles: true })
              inputRef!.dispatchEvent(inputEvent)

              inputRef?.focus()
            }}
          />
        </Show>

        <Show when={!isNil(suffix())}>
          <div
            {...props.suffixHTMLAttributes}
            class={cs(props.suffixHTMLAttributes?.class, 'ml-4px')}
          >
            {suffix()}
          </div>
        </Show>

        <Show when={!isNil(actions())}>
          <div class="[display:var(--actions-display)] absolute top-0 bottom-0 right-0 h-[calc(100%-2px)] translate-y-1px -translate-x-1px">
            {actions()}
          </div>
        </Show>
      </div>

      <Show when={!isNil(addonAfter())}>
        <div
          {...props.addonAfterHTMLAttributes}
          class={cs(
            props.addonAfterHTMLAttributes?.class,
            'ant-input-addon ant-input-addon-after',
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
