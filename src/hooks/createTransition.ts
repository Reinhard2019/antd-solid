import { createEffect, type Accessor, on } from 'solid-js'

/**
 * dom 节点显示或隐藏时的动画
 * @param target
 * @param when
 * @param props.name 动画类名
 */
export default function createTransition(
  target: Accessor<HTMLElement | undefined | null>,
  when: Accessor<boolean>,
  props: {
    name?: string
    onAfterEnter?: (element: Element) => void
    onAfterExit?: (element: Element) => void
  } = {},
) {
  createEffect(
    on(when, input => {
      const targetValue = target()
      if (!targetValue) return

      if (input) {
        targetValue.style.display = ''
        targetValue.classList.add(`${props.name}-enter-active`, `${props.name}-enter`)
        requestAnimationFrame(() => {
          targetValue.classList.add(`${props.name}-enter-to`)
          targetValue!.classList.remove(`${props.name}-enter`)
        })
        const onTransitionEnd = () => {
          targetValue!.classList.remove(`${props.name}-enter-active`, `${props.name}-enter-to`)
          targetValue!.removeEventListener('transitionend', onTransitionEnd)
          props.onAfterEnter?.(targetValue)
        }
        targetValue.addEventListener('transitionend', onTransitionEnd)
      } else {
        targetValue.classList.add(`${props.name}-exit-active`, `${props.name}-exit`)
        requestAnimationFrame(() => {
          targetValue!.classList.add(`${props.name}-exit-to`)
          targetValue!.classList.remove(`${props.name}-exit`)
        })
        const onTransitionEnd = () => {
          targetValue!.style.display = 'none'
          targetValue!.classList.remove(`${props.name}-exit-active`, `${props.name}-exit-to`)
          targetValue!.removeEventListener('transitionend', onTransitionEnd)
          props.onAfterExit?.(targetValue)
        }
        targetValue.addEventListener('transitionend', onTransitionEnd)
      }
    }),
  )
}
