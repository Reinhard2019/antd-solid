import cs from 'classnames'

/**
 * 水波动画
 * @param parent
 * @param color
 */
export function wave(parent: HTMLElement, color: string) {
  const div = document.createElement('div')
  div.style.color = color
  div.className = cs(
    'absolute inset-0 z--1 rounded-inherit border-solid border-[currentColor] keyframes-wave [animation:wave_ease-out_.3s]',
  )
  const onAnimationEnd = () => {
    div.remove()
    div.removeEventListener('animationend', onAnimationEnd)
  }
  div.addEventListener('animationend', onAnimationEnd)
  parent.insertBefore(div, parent.childNodes[0])
}
