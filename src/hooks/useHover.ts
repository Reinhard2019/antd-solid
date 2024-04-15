import { createEffect, type Accessor, onCleanup, createSignal } from 'solid-js'

export default function useHover(target: Accessor<HTMLElement | undefined>) {
  const [hover, setHover] = createSignal(false)

  createEffect(() => {
    const _target = target()
    if (!_target) {
      setHover(false)
      return
    }

    const onMouseEnter = () => {
      setHover(true)
    }
    _target.addEventListener('mouseenter', onMouseEnter)

    const onMouseLeave = () => {
      setHover(false)
    }
    _target.addEventListener('mouseleave', onMouseLeave)

    onCleanup(() => {
      _target.removeEventListener('mouseenter', onMouseEnter)
      _target.removeEventListener('mouseleave', onMouseLeave)
    })
  })

  return hover
}
