import { type Signal, createSignal, untrack, on, createComputed } from 'solid-js'

export interface Options<T> {
  defaultValue?: T
  defaultValuePropName?: string
  valuePropName?: string
  trigger?: string | undefined | null | false
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

  const getValue = () => props[valuePropName] as T
  // 为什么不使用 Object.hasOwn？
  // solid 的 proxy 对象对于任何 key，都会返回 true
  const isControlled = () => Object.keys(props).includes(valuePropName)

  const defaultValue = Object.keys(props).includes(defaultValuePropName)
    ? untrack(() => props[defaultValuePropName])
    : options.defaultValue
  const [value, _setValue] = createSignal<T>(defaultValue as T)
  createComputed(
    on(getValue, () => {
      if (isControlled()) _setValue(getValue() as any)
    }),
  )

  const setValue = (v: ((prev: T) => T) | T | undefined) => {
    const _value = untrack(value)
    const newValue = typeof v === 'function' ? (v as (prev: T) => T)(_value! as T) : v
    if (newValue === _value) return newValue

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
