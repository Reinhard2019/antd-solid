import { createEffect, type Accessor, on } from 'solid-js'

/**
 * dom 节点显示或隐藏时的动画
 * @param target
 * @param when
 * @param className 动画类名
 */
export default function createTransition(
  target: Accessor<HTMLElement | undefined | null>,
  when: Accessor<boolean>,
  className: string,
) {
  createEffect(
    on(when, input => {
      const targetValue = target()
      if (!targetValue) return

      if (input) {
        targetValue.style.display = ''
        targetValue.classList.add(
          `${className}-enter-active`,
          `${className}-enter`,
          `${className}-enter-to`,
        )
        requestAnimationFrame(() => {
          targetValue!.classList.remove(`${className}-enter`)
        })
        const onTransitionEnd = () => {
          targetValue!.classList.remove(`${className}-enter-active`, `${className}-enter-to`)
          targetValue!.removeEventListener('transitionend', onTransitionEnd)
        }
        targetValue.addEventListener('transitionend', onTransitionEnd)
      } else {
        targetValue.classList.add(
          `${className}-exit-active`,
          `${className}-exit`,
          `${className}-exit-to`,
        )
        requestAnimationFrame(() => {
          targetValue!.classList.remove(`${className}-exit`)
        })
        const onTransitionEnd = () => {
          targetValue!.style.display = 'none'
          targetValue!.classList.remove(`${className}-exit-active`, `${className}-exit-to`)
          targetValue!.removeEventListener('transitionend', onTransitionEnd)
        }
        targetValue.addEventListener('transitionend', onTransitionEnd)
      }
    }),
  )
}
