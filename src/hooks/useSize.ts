import { type Accessor, createSignal, onCleanup, onMount } from 'solid-js'

export default function useSize(target: Accessor<Element>) {
  const [size, setSize] = createSignal<{
    width: number
    height: number
  }>()

  onMount(() => {
    const _target = target()
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
