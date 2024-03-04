import cs from 'classnames'

/**
 * 按钮点击时的动画
 * @param parent
 * @param color
 */
export function buttonClickAnimation(parent: HTMLElement, color: string) {
  const div = document.createElement('div')
  div.style.color = color
  div.className = cs(
    'absolute inset-0 rounded-inherit z--1',
    'before:content-empty before:absolute before:inset-0 before:rounded-inherit before:bg-[currentColor] before:keyframes-button-click before:[animation:button-click_ease-out_.3s]',
    'after:content-empty after:absolute after:inset-0 after:rounded-inherit after:bg-white',
  )
  const onAnimationEnd = () => {
    div.remove()
    div.removeEventListener('animationend', onAnimationEnd)
  }
  div.addEventListener('animationend', onAnimationEnd)
  parent.insertBefore(div, parent.childNodes[0])
}
