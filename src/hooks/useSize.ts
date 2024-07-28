import { isEqual } from 'lodash-es'
import { type Accessor, createSignal, onCleanup, createEffect } from 'solid-js'

export default function useSize(target: Accessor<Element | undefined>) {
  const [size, setSize] = createSignal<
  | {
    width: number
    height: number
  }
  | undefined
  >(undefined, {
    equals: isEqual,
  })

  createEffect(() => {
    const _target = target()
    if (!_target) return

    const callback = () => {
      setSize({
        width: _target.clientWidth,
        height: _target.clientHeight,
      })
    }
    // ResizeObserver observe 后虽然也会立刻执行 callback，但它执行不及时
    callback()

    const ro = new ResizeObserver(callback)
    ro.observe(_target)
    onCleanup(() => {
      ro.disconnect()
    })
  })

  return size
}
