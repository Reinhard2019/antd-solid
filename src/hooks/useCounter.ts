import { clamp } from 'lodash-es'
import { type Accessor, createSignal, type Setter } from 'solid-js'
import { unwrapFunction } from '../utils/solid'

function useCounter(
  initialValue: number,
  options?: {
    min?: number | Accessor<number>
    max?: number | Accessor<number>
    step?: number | Accessor<number>
  },
) {
  const [value, setValue] = createSignal(initialValue)
  const step = options?.step ?? 1

  const set: Setter<number> = (v: Parameters<Setter<number>>[0]) => {
    const newV = typeof v === 'function' ? v(value()) : v
    return setValue(
      clamp(
        newV,
        unwrapFunction(options?.min ?? -Infinity),
        unwrapFunction(options?.max ?? Infinity),
      ),
    )
  }

  const inc = () => {
    return set(value() + unwrapFunction(step))
  }

  const dec = () => {
    return set(value() - unwrapFunction(step))
  }

  const reset = () => {
    return setValue(initialValue)
  }

  return [value, { set, inc, dec, reset }] as const
}

export default useCounter
