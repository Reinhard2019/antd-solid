import { type Accessor, createSignal, onCleanup, onMount } from 'solid-js'

function getTarget(target: Element | Accessor<Element>) {
  return target instanceof Element ? target : target()
}

export default function useSize(target: Element | Accessor<Element>) {
  const [size, setSize] = createSignal<{
    width: number
    height: number
  }>()

  onMount(() => {
    const _target = getTarget(target)
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
