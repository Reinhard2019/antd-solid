import { createEffect, type Accessor, onCleanup, createSignal } from 'solid-js'
import { toArray } from '../utils/array'

export default function useHover(target: Accessor<Element | Element[] | undefined>) {
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

    const onMouseLeave = () => {
      setHover(false)
    }

    const targetList = toArray(_target)
    targetList.forEach(item => {
      item.addEventListener('mouseenter', onMouseEnter)
      item.addEventListener('mouseleave', onMouseLeave)
    })

    onCleanup(() => {
      targetList.forEach(item => {
        item.removeEventListener('mouseenter', onMouseEnter)
        item.removeEventListener('mouseleave', onMouseLeave)
      })
    })
  })

  return hover
}
