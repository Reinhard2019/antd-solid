import {
  type Component,
  createEffect,
  on,
  splitProps,
  untrack,
  createSignal,
  mergeProps,
} from 'solid-js'
import { CommonInput, type InputProps } from '../Input'
import { clamp, isNil } from 'lodash-es'
import { dispatchEventHandlerUnion } from '../utils/solid'

export interface InputNumberProps
  extends Omit<
  InputProps,
  'defaultValue' | 'value' | 'onChange' | 'inputAfter' | 'onKeyDown' | 'min' | 'max' | 'suffix'
  > {
  defaultValue?: number | null | undefined
  value?: number | null | undefined
  onChange?: (value: number | null) => void
  min?: number
  max?: number
}

const isEmptyValue = (value: number | string | null | undefined) => isNil(value) || value === ''

const actionBtnClass =
  'text-12px flex justify-center items-center h-1/2 cursor-pointer opacity-70 hover:h-100% hover:text-[var(--ant-color-primary)] transition-color transition-height transition-duration-500'

const InputNumber: Component<InputNumberProps> = _props => {
  const props = mergeProps(
    {
      min: -Infinity,
      max: Infinity,
    },
    _props,
  )
  const [_, inputProps] = splitProps(props, ['defaultValue', 'value', 'onChange', 'onBlur'])

  const clampValue = (v: number) => untrack(() => clamp(v, props.min, props.max))

  let defaultValue = null
  if (Object.keys(props).includes('value')) {
    defaultValue = untrack(() => props.value)
  } else if (Object.keys(props).includes('defaultValue')) {
    defaultValue = untrack(() => props.defaultValue)
  }

  let prev: number | null = defaultValue!
  const updatePrev = (v: number | null) => {
    if (prev === v) return

    prev = v
    props.onChange?.(prev)
  }

  const [value, setValue] = createSignal<number | string | null | undefined>(defaultValue)
  createEffect(
    on(
      () => props.value,
      () => {
        setValue(props.value)
      },
      {
        defer: true,
      },
    ),
  )

  const add = (addon: number) => {
    let newValue: number | null
    if (isEmptyValue(value())) {
      newValue = clampValue(addon)
    } else {
      const num = Number(value())
      newValue = Number.isNaN(num) ? null : clampValue(num + addon)
    }

    if (!Object.keys(props).includes('value')) {
      setValue(newValue)
    }
    updatePrev(newValue)
  }
  const up = () => {
    add(1)
  }
  const down = () => {
    add(-1)
  }

  return (
    <CommonInput
      {...inputProps}
      actions={
        <div class="flex flex-col h-full w-24px [border-left:1px_solid_var(--ant-color-border)]">
          <div class={actionBtnClass} onClick={up}>
            <div class="i-ant-design:up-outlined" />
          </div>
          <div
            class={`[border-top:1px_solid_var(--ant-color-border)] ${actionBtnClass}`}
            onClick={down}
          >
            <div class="i-ant-design:down-outlined" />
          </div>
        </div>
      }
      value={`${value() ?? ''}`}
      onKeyDown={e => {
        switch (e.key) {
          case 'ArrowUp':
            up()
            e.preventDefault()
            return
          case 'ArrowDown':
            down()
            e.preventDefault()
        }
      }}
      onChange={e => {
        const newValue = e.target.value
        setValue(newValue)

        let newValueNum: number | null = Number(newValue)
        if (Number.isNaN(newValueNum)) return

        if (isEmptyValue(newValue)) {
          newValueNum = null
        } else {
          newValueNum = clampValue(newValueNum)
        }

        updatePrev(newValueNum)
      }}
      onBlur={e => {
        setValue(props.value ?? prev)

        dispatchEventHandlerUnion(props.onBlur, e)
      }}
    />
  )
}

export default InputNumber
