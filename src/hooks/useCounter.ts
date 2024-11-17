import { clamp } from 'lodash-es'
import { type Accessor, createSignal, type Setter } from 'solid-js'
import NP from 'number-precision'
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

  const inc = (stepValue?: number) => {
    return set(NP.plus(value(), stepValue ?? unwrapFunction(step)))
  }

  const dec = (stepValue?: number) => {
    return set(NP.minus(value(), stepValue ?? unwrapFunction(step)))
  }

  const reset = () => {
    return setValue(initialValue)
  }

  return [value, { set, inc, dec, reset }] as const
}

export default useCounter
