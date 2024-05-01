import { isEqual } from 'lodash-es'
import { type Accessor, createSignal, onCleanup, createEffect } from 'solid-js'

export default function useScroll(target: Accessor<Element | undefined>) {
  const [scroll, setScroll] = createSignal(
    {
      left: 0,
      top: 0,
    },
    { equals: isEqual },
  )

  createEffect(() => {
    const _target = target()
    if (!_target) return

    const onScroll = () => {
      setScroll({
        left: _target.scrollLeft,
        top: _target.scrollTop,
      })
    }
    onScroll()

    _target.addEventListener('scroll', onScroll)
    onCleanup(() => {
      _target.removeEventListener('scroll', onScroll)
    })
  })

  return scroll
}
