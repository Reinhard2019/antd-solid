import { type Accessor, createSignal, onCleanup, createEffect } from 'solid-js'

export default function useSize(target: Accessor<Element | undefined>) {
  const [size, setSize] = createSignal<{
    width: number
    height: number
  }>()

  createEffect(() => {
    const _target = target()
    if (!_target) return

    const ro = new ResizeObserver(() => {
      setSize({
        width: _target.clientWidth,
        height: _target.clientHeight,
      })
    })
    ro.observe(_target)
    onCleanup(() => {
      ro.disconnect()
    })
  })

  return size
}
