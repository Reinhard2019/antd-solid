import { createEffect, createMemo, For, mergeProps, on, onCleanup, type Component } from 'solid-js'
import { unset } from 'lodash-es'
import cs from 'classnames'
import Element from '../Element'
import Input from '../Input'
import createControllableValue from '../hooks/createControllableValue'
import { type StyleProps } from '../types'

export interface CodeInputProps extends StyleProps {
  defaultValue?: string
  value?: string
  onChange?: (value: string) => void
  /**
   * 验证码输入完全触发
   */
  onComplete?: (value: string) => void
  /**
   * 验证码长度
   * 默认：6
   */
  length?: number
}

const CodeInput: Component<CodeInputProps> = _props => {
  const props = mergeProps({ length: 6 }, _props)

  const [_value, setValue] = createControllableValue<string | undefined>(props)
  const value = createMemo(() => _value() ?? '')
  createEffect(
    on(
      value,
      () => {
        onFocus()
      },
      {
        defer: true,
      },
    ),
  )

  const inputRefDict: Record<string, HTMLInputElement> = {}

  const onFocus = () => {
    const index = Math.min(value().length, props.length - 1)
    inputRefDict[index].focus()
  }

  return (
    <Element
      class={cs(props.class, 'flex gap-[--ant-margin-sm] cursor-text')}
      style={props.style}
      tabIndex={0}
      onFocus={onFocus}
      onKeyDown={e => {
        if (e.code !== 'Backspace') return
        setValue(e.metaKey ? '' : value().slice(0, -1))
      }}
    >
      <For
        each={Array(props.length)
          .fill(0)
          .map((_, i) => i)}
      >
        {item => {
          onCleanup(() => {
            unset(inputRefDict, item)
          })

          return (
            <Input
              ref={el => {
                inputRefDict[item] = el
              }}
              rootClass="!w-32px"
              class="!text-center"
              value={value()[item]}
              onChange={e => {
                const v = e.target.value
                if (!v || value().length >= props.length) return

                const newValue = `${value()}${v}`.replace(/\D/g, '')
                if (newValue.length === props.length) {
                  props.onComplete?.(newValue)
                }
                setValue(newValue.slice(0, props.length))
              }}
              onFocus={onFocus}
            />
          )
        }}
      </For>
    </Element>
  )
}

export default CodeInput
