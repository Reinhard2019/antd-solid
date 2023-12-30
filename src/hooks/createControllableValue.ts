import { type Signal, createSignal } from 'solid-js'
import createUpdateEffect from './createUpdateEffect'

export interface Options<T> {
  defaultValue?: T
  defaultValuePropName?: string
  valuePropName?: string
  trigger?: string | null
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
  const {
    defaultValuePropName = 'defaultValue',
    valuePropName = 'value',
    trigger = 'onChange',
  } = options

  const getValue = () => props[valuePropName] as T
  // 为什么不使用 Object.hasOwn？
  // solid 的 proxy 对象对于任何 key，都会返回 true
  const isControlled = () => Object.keys(props).includes(valuePropName)

  let defaultValue = options.defaultValue
  if (isControlled()) {
    defaultValue = getValue()
  } else if (Object.keys(props).includes(defaultValuePropName)) {
    defaultValue = props[defaultValuePropName]
  }

  const [value, _setValue] = createSignal(defaultValue)

  createUpdateEffect(getValue, () => {
    if (!isControlled()) return

    _setValue(getValue() as any)
  })

  const setValue = (v: ((prev: T) => T) | T | undefined) => {
    const newValue = typeof v === 'function' ? (v as (prev: T) => T)(value()!) : v

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
