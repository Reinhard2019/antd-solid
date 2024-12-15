import { type JSX, type Component, onMount } from 'solid-js'
import cs from 'classnames'
import Element from '../Element'
import { type StyleProps } from '../types'
import createControllableValue from '../hooks/createControllableValue'
import useComponentSize from '../hooks/useComponentSize'

export interface TextAreaProps extends StyleProps {
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
  disabled?: boolean
  placeholder?: string
  rows?: number
}

const TextArea: Component<TextAreaProps> = props => {
  const size = useComponentSize(() => props.size)

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
      class={cs(props.class, 'flex')}
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
        ...props.style,
      }}
    >
      <textarea
        class={cs(
          'p-[--ant-input-padding] border-1px border-solid border-[--ant-color-border] bg-[--ant-color-bg-container]',
          'w-full h-full [font-size:var(--ant-input-font-size)] [outline:none] placeholder-text-[var(--ant-color-text-placeholder)]',
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
        rows={props.rows}
        disabled={props.disabled}
      />
    </Element>
  )
}

export default TextArea
