import { createEffect, type Accessor, onCleanup, createSignal } from 'solid-js'

export default function useFocus(target: Accessor<HTMLElement | undefined>) {
  const [hover, setHover] = createSignal(false)

  createEffect(() => {
    const _target = target()
    if (!_target) return

    const onMouseEnter = () => {
      setHover(true)
    }
    _target.addEventListener('focusin', onMouseEnter)

    const onMouseLeave = () => {
      setHover(false)
    }
    _target.addEventListener('focusout', onMouseLeave)

    onCleanup(() => {
      _target.removeEventListener('focusin', onMouseEnter)
      _target.removeEventListener('focusout', onMouseLeave)
    })
  })

  return hover
}
