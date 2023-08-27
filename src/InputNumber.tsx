import { type Component, createEffect, on, splitProps } from 'solid-js'
import { CommonInput, type InputProps } from './Input'
import { isNil } from 'lodash-es'
import createControllableValue from './hooks/createControllableValue'
import { dispatchEventHandlerUnion } from './utils/solid'

export interface InputNumberProps
  extends Omit<InputProps, 'defaultValue' | 'value' | 'onChange' | 'inputAfter' | 'onKeyDown'> {
  defaultValue?: number | null | undefined
  value?: number | null | undefined
  onChange?: (value: number | null) => void
}

const isEmptyValue = (value: number | string | null | undefined) => isNil(value) || value === ''

const formatNum = (
  v: number | string | null | undefined,
  prev?: number | null | undefined,
): number | null => {
  if (isEmptyValue(v)) {
    return null
  }

  const num = Number(v)
  if (prev !== undefined && Number.isNaN(num)) {
    return prev
  }

  return num
}

const actionBtnClass =
  'ant-text-12px ant-flex ant-justify-center ant-items-center ant-h-1/2 ant-cursor-pointer ant-opacity-70 hover:ant-h-100% hover:ant-text-[var(--primary-color)] ant-transition-color ant-transition-height ant-transition-duration-500'

const InputNumber: Component<InputNumberProps> = props => {
  const [{ onChange, onBlur }, inputProps] = splitProps(props, [
    'defaultValue',
    'value',
    'onChange',
    'onBlur',
  ])

  const [_, controllableProps] = splitProps(props, ['onChange'])
  const [value, setValue] = createControllableValue<number | string | null | undefined>(
    controllableProps,
  )
  const add = (addon: number) => {
    setValue(v => {
      if (isEmptyValue(v)) {
        return addon
      }

      const num = Number(v)
      if (Number.isNaN(num)) {
        return v
      }
      return num + addon
    })
  }
  const up = () => { add(1); }
  const down = () => { add(-1); }

  createEffect(
    on(
      value,
      (input, __, prev: number | null | undefined) => {
        const num = formatNum(input, prev)
        if (num !== prev) {
          prev = num
          onChange?.(num)
        }
        return num
      },
      {
        defer: true,
      },
    ),
  )

  return (
    <CommonInput
      {...inputProps}
      inputAfter={
        <div class="ant-flex ant-flex-col ant-h-full ant-w-24px ant-[border-left:1px_solid_var(--border-color)]">
          <div class={actionBtnClass} onClick={up}>
            <div class="i-ant-design:up-outlined" />
          </div>
          <div class={`ant-[border-top:1px_solid_var(--border-color)] ${actionBtnClass}`} onClick={down}>
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
        const newValue = e.target.value || null
        setValue(newValue)
      }}
      onBlur={e => {
        const newValue = e.target.value || null
        setValue(formatNum(newValue))

        dispatchEventHandlerUnion(onBlur, e)
      }}
    />
  )
}

export default InputNumber
