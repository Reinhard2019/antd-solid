import { type JSX, type Component, onMount, type Ref, splitProps } from 'solid-js'
import cs from 'classnames'
import Element from '../Element'
import { type RootStyleProps } from '../types'
import createControllableValue from '../hooks/createControllableValue'
import useComponentSize from '../hooks/useComponentSize'
import { statusClassDict } from '.'
import useFocus from '../hooks/useFocus'
import { setRef } from '../utils/solid'

export interface TextAreaProps
  extends RootStyleProps,
  Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value'> {
  ref?: Ref<HTMLTextAreaElement>
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
  const size = useComponentSize(() => props.size)
  const [_, inputProps] = splitProps(props, [
    'defaultValue',
    'value',
    'onChange',
    'onPressEnter',
    'onKeyDown',
    'size',
    'autoFocus',
    'status',
  ])

  let inputRef: HTMLTextAreaElement | undefined
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

  return (
    <Element
      class={cs(props.rootClass, 'flex')}
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
        {...inputProps}
        ref={el => {
          setRef(props, el)
          inputRef = el
        }}
        class={cs(
          'p-[--ant-input-padding] border-1px border-solid bg-[--ant-color-bg-container]',
          'w-full h-full [font-size:var(--ant-input-font-size)] [outline:none] placeholder-text-[var(--ant-color-text-placeholder)]',
          props.disabled && 'color-[var(--ant-color-text-disabled)] cursor-not-allowed',
          {
            small: 'rounded-[var(--ant-border-radius-sm)]',
            middle: 'rounded-[var(--ant-border-radius)]',
            large: 'rounded-[var(--ant-border-radius-lg)]',
          }[size()],
          statusClassDict[props.status ?? 'default'](!!props.disabled, foucs()),
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
        onKeyDown={e => {
          if (e.key === 'Enter') {
            props.onPressEnter?.(e)
          }

          props.onKeyDown?.(e)
        }}
      />
    </Element>
  )
}

export default TextArea
