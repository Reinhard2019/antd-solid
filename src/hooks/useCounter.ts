import { clamp } from 'lodash-es'
import { createSignal, type Setter } from 'solid-js'

function useCounter(initialValue: number, options?: { min?: number; max?: number; step?: number }) {
  const [value, setValue] = createSignal(initialValue)
  const step = options?.step ?? 1

  const set: Setter<number> = (v: Parameters<Setter<number>>[0]) => {
    const newV = typeof v === 'function' ? v(value()) : v
    return setValue(clamp(newV, options?.min ?? -Infinity, options?.max ?? Infinity))
  }

  const inc = () => {
    return set(value() + step)
  }

  const dec = () => {
    return set(value() - step)
  }

  const reset = () => {
    return setValue(initialValue)
  }

  return [value, { set, inc, dec, reset }] as const
}

export default useCounter
