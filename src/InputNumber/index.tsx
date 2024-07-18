import {
  type Component,
  createEffect,
  on,
  splitProps,
  untrack,
  createSignal,
  mergeProps,
} from 'solid-js'
import { clamp, floor, isNil } from 'lodash-es'
import NP from 'number-precision'
import { CommonInput, type InputProps } from '../Input'
import { dispatchEventHandlerUnion } from '../utils/solid'

export interface InputNumberProps
  extends Omit<
  InputProps,
  'defaultValue' | 'value' | 'onChange' | 'inputAfter' | 'onKeyDown' | 'min' | 'max' | 'suffix'
  > {
  defaultValue?: number | null | undefined
  value?: number | null | undefined
  /**
   * 占位值，为空时显示的值
   */
  placeholderValue?: number | null | undefined
  onChange?: (value: number | null) => void
  min?: number
  max?: number
  precision?: number
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
  const floorValue = (v: number) =>
    untrack(() => (typeof props.precision === 'number' ? floor(v, props.precision) : v))

  let defaultValue = null
  if (Object.keys(props).includes('value')) {
    defaultValue = untrack(() => props.value)
  } else if (Object.keys(props).includes('defaultValue')) {
    defaultValue = untrack(() => props.defaultValue)
  }

  // 上一个格式正确的值
  let validValue: number | null = null
  const updateValidValue = (
    v: number | string | null | undefined,
    options?: {
      ignoreOnChange?: boolean
    },
  ) => {
    let valueNum: number | null = null

    if (!isEmptyValue(v)) {
      valueNum = Number(v)

      if (
        Number.isNaN(valueNum) ||
        valueNum !== clampValue(valueNum!) ||
        valueNum !== floorValue(valueNum!)
      ) {
        return
      }
    }

    if (validValue === valueNum) return

    validValue = valueNum
    if (!options?.ignoreOnChange) untrack(() => props.onChange?.(validValue))
  }
  updateValidValue(defaultValue, { ignoreOnChange: true })

  const [value, setValue] = createSignal<number | string | null | undefined>(defaultValue)
  createEffect(
    on(
      () => props.value,
      input => {
        if (input === value()) return
        updateValidValue(input, { ignoreOnChange: true })
        setValue(input)
      },
      {
        defer: true,
      },
    ),
  )

  const add = (addon: number) => {
    let newValue: number | null
    if (isEmptyValue(value())) {
      newValue = addon
    } else {
      const num = Number(value())
      newValue = NP.plus(Number.isNaN(num) ? validValue ?? 0 : num, addon)
    }

    updateValidValue(newValue)
    setValue(validValue)
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
      value={`${value() ?? props.placeholderValue ?? ''}`}
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
        updateValidValue(newValue)
      }}
      onBlur={e => {
        updateValidValue(value())
        setValue(validValue)

        dispatchEventHandlerUnion(props.onBlur, e)
      }}
    />
  )
}

export default InputNumber
