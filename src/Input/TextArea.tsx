import { type JSX, type Component, onMount, useContext, createMemo } from 'solid-js'
import cs from 'classnames'
import Element from '../Element'
import { type RootStyleProps } from '../types'
import createControllableValue from '../hooks/createControllableValue'
import ConfigProviderContext from '../ConfigProvider/context'

export interface TextAreaProps
  extends Omit<
  JSX.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'value' | 'onChange' | 'onPressEnter' | 'onKeyDown'
  >,
  JSX.CustomAttributes<HTMLTextAreaElement>,
  RootStyleProps {
  defaultValue?: string | null | undefined
  value?: string | null | undefined
  autoFocus?: boolean
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
  onChange?: JSX.InputEventHandler<HTMLTextAreaElement, InputEvent>
  onPressEnter?: JSX.EventHandler<HTMLTextAreaElement, KeyboardEvent>
  onKeyDown?: JSX.EventHandler<HTMLTextAreaElement, KeyboardEvent>
}

const TextArea: Component<TextAreaProps> = props => {
  const { componentSize } = useContext(ConfigProviderContext)
  const size = createMemo(() => props.size ?? componentSize())

  let input: HTMLTextAreaElement | undefined
  onMount(() => {
    if (props.autoFocus) {
      input?.focus()
    }
  })

  const isControlled = () => Object.keys(props).includes('value')

  const [value, setValue] = createControllableValue(props, {
    trigger: null,
  })

  return (
    <Element
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
      <textarea
        {...(props as JSX.InputHTMLAttributes<HTMLTextAreaElement>)}
        class={cs(
          props.class,
          'p-[--ant-input-padding] border-1px border-solid border-[--ant-color-border]',
          'w-full h-full [font-size:var(--ant-input-font-size)] [outline:none] placeholder-text-[var(--ant-color-text-placeholder)] bg-transparent',
          props.disabled && 'color-[var(--ant-color-text-disabled)] cursor-not-allowed',
          {
            small: 'rounded-[var(--ant-border-radius-sm)]',
            middle: 'rounded-[var(--ant-border-radius)]',
            large: 'rounded-[var(--ant-border-radius-lg)]',
          }[size()],
        )}
        value={value() ?? ''}
        onInput={e => {
          setValue(e.target.value)
          try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            props.onChange?.(e as any)
          } finally {
            if (isControlled() && e.target.value !== props.value) {
              e.target.value = props.value ?? ''
            }
          }
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            props.onPressEnter?.(e as any)
          }

          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          props.onKeyDown?.(e as any)
        }}
      />
    </Element>
  )
}

export default TextArea
