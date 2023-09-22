import { type Setter, type Signal, createSignal } from 'solid-js'
import createUpdateEffect from './createUpdateEffect'

export interface Options<T> {
  defaultValue?: T
  defaultValuePropName?: string
  valuePropName?: string
  trigger?: string | undefined
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

  const setValue: Setter<T> = (v => {
    const newValue = _setValue(v)

    if (trigger) {
      const onChange = props[trigger]
      if (typeof onChange === 'function') {
        onChange(newValue)
      }
    }

    return newValue
  }) as Setter<T>

  return [value, setValue] as Signal<T>
}

export default createControllableValue
