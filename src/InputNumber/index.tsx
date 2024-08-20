import {
  type Component,
  splitProps,
  untrack,
  createSignal,
  mergeProps,
  createRenderEffect,
  on,
  createMemo,
} from 'solid-js'
import { clamp, floor, isNil, isNumber } from 'lodash-es'
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
  /**
   * 每次改变步数，可以为小数
   * 默认 1
   */
  step?: number
  /**
   * 指定输入框展示值的格式
   */
  formatter?: (value: number | string) => string
}

const isEmptyValue = (value: number | string | null | undefined) => isNil(value) || value === ''

const actionBtnClass =
  'text-12px flex justify-center items-center h-1/2 cursor-pointer opacity-70 hover:h-100% hover:text-[var(--ant-color-primary)] transition-color transition-height transition-duration-500'

const InputNumber: Component<InputNumberProps> = _props => {
  const props = mergeProps(
    {
      min: -Infinity,
      max: Infinity,
      step: 1,
    },
    _props,
  )
  const [_, inputProps] = splitProps(props, [
    'defaultValue',
    'value',
    'onChange',
    'onBlur',
    'formatter',
  ])

  // 为什么不使用 Object.hasOwn？
  // solid 的 proxy 对象对于任何 key，都会返回 true
  const isControlled = () => Object.keys(props).includes('value')

  const clampValue = (v: number) => untrack(() => clamp(v, props.min, props.max))
  const floorValue = (v: number) =>
    untrack(() => (typeof props.precision === 'number' ? floor(v, props.precision) : v))

  const [value, setValue] = createSignal<number | string | null | undefined>(
    untrack(() => props.defaultValue),
  )
  const displayValue = createMemo(() =>
    props.formatter ? props.formatter(value() ?? '') : value(),
  )
  createRenderEffect(
    on(
      () => props.value,
      () => {
        if (isControlled()) {
          setValue(props.value)
        }
      },
    ),
  )
  const [focusing, setFocusing] = createSignal(false)
  createRenderEffect(() => {
    if (!isNumber(value()) && isNumber(props.placeholderValue) && !focusing()) {
      setValue(props.placeholderValue)
    }
  })

  // 上一个格式正确的值
  let validValue: number | null = null
  const updateValidValue = (v: number | string | null | undefined) => {
    let valueNum: number | null = null

    if (!isEmptyValue(v)) {
      valueNum = Number(v)

      if (Number.isNaN(valueNum) || valueNum !== floorValue(valueNum!)) {
        return false
      }
    }

    valueNum = isNumber(valueNum) ? clampValue(valueNum) : valueNum

    if (validValue === valueNum) return false

    validValue = valueNum
    return true
  }
  updateValidValue(untrack(value))

  const add = (addon: number) => {
    let newValue: number
    if (isEmptyValue(value())) {
      newValue = addon
    } else {
      const num = Number(value())
      newValue = NP.plus(Number.isNaN(num) ? validValue ?? 0 : num, addon)
    }

    const success = updateValidValue(newValue)
    setValue(validValue)
    if (success) props.onChange?.(validValue)
  }
  const up = () => {
    add(props.step)
  }
  const down = () => {
    add(-props.step)
  }

  return (
    <CommonInput
      {...inputProps}
      rootStyle={{
        '--ant-input-number-handle-width': '22px',
        ...props.rootStyle,
      }}
      actions={() => (
        <div class="flex flex-col h-full w-[--ant-input-number-handle-width] [border-left:1px_solid_var(--ant-color-border)] bg-[--ant-color-bg-container]">
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
      )}
      value={`${(focusing() ? value() : displayValue()) ?? ''}`}
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
        const success = updateValidValue(newValue)
        if (success) props.onChange?.(validValue)
      }}
      onFocus={e => {
        dispatchEventHandlerUnion(props.onFocus, e)
        setFocusing(true)
      }}
      onBlur={e => {
        const success = updateValidValue(value())
        setValue(validValue)
        if (success) props.onChange?.(validValue)

        dispatchEventHandlerUnion(props.onBlur, e)
        setFocusing(false)
      }}
    />
  )
}

export default InputNumber
