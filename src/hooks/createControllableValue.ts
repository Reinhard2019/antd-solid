import { type Signal, createSignal, untrack, createMemo } from 'solid-js'

export interface Options<T> {
  defaultValue?: T
  defaultValuePropName?: string
  valuePropName?: string
  trigger?: string | undefined | null | false
  /**
   * 值转化器
   * 在设置值前，可以对值进行转化，例如可以将无效值转化为有效值
   */
  valueConvertor?: (value: T | undefined) => T | undefined
}

export type Props = Record<string, any>

export interface StandardProps<T> {
  value: T
  defaultValue?: T
  onChange: (val: T) => void
}

function createControllableValue<T = any>(props: StandardProps<T>): Signal<T>
function createControllableValue<T = any>(props: Props, options?: Options<T>): Signal<T>
function createControllableValue<T = any>(props: Props, options: Options<T> = {}) {
  const { defaultValuePropName, valuePropName, trigger } = Object.assign(
    {
      defaultValuePropName: 'defaultValue',
      valuePropName: 'value',
      trigger: 'onChange',
    },
    options,
  )
  const valueConvertor = (v: T | undefined) =>
    options.valueConvertor ? options.valueConvertor?.(v) : v

  const getValue = () => props[valuePropName] as T
  // 为什么不使用 Object.hasOwn？
  // solid 的 proxy 对象对于任何 key，都会返回 true
  const isControlled = () => Object.keys(props).includes(valuePropName)

  let defaultValue = options.defaultValue
  if (isControlled()) {
    defaultValue = untrack(getValue)
  } else if (Object.keys(props).includes(defaultValuePropName)) {
    defaultValue = untrack(() => props[defaultValuePropName])
  }
  defaultValue = valueConvertor(defaultValue)

  const [_value, _setValue] = createSignal(defaultValue)
  const value = createMemo(() => (isControlled() ? valueConvertor(getValue()) : _value()))

  const setValue = (v: ((prev: T) => T) | T | undefined) => {
    const newValue = valueConvertor(typeof v === 'function' ? (v as (prev: T) => T)(value()!) : v)

    if (!isControlled()) {
      _setValue(newValue as any)
    }

    if (trigger) {
      const onChange = props[trigger]
      if (typeof onChange === 'function') {
        onChange(newValue)
      }
    }

    return newValue
  }

  return [value, setValue] as Signal<T>
}

export default createControllableValue
