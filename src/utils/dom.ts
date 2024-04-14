/**
 * 判断 dom 节点是否隐藏（即其自身或者父级的 display 是否为 none）
 */
export function isHide(dom: HTMLElement) {
  if (dom.style.position === 'fixed') {
    return dom.style.display === 'none'
  }

  return dom.offsetParent === null
}
