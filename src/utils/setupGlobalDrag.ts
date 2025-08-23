/**
 * 设置全局拖动监听器，用于解决：
 * - 鼠标移到 disabled 元素上后 mouseup 事件丢失
 * - 拖动过程中误选中文字
 *
 * @param onMove - 鼠标移动时触发的回调函数
 * @param onEnd - 鼠标抬起时触发的回调函数
 * @param cursor - 拖拽过程中的 style.cursor
 */
export function setupGlobalDrag(
  onMove: (e: MouseEvent) => void,
  onEnd?: (e: MouseEvent) => void,
  cursor?: string,
) {
  // 防止拖拽时误选中文字等
  const originalUserSelect = document.body.style.userSelect
  document.body.style.userSelect = 'none'

  const originalCursor = document.documentElement.style.cursor
  if (cursor) {
    document.documentElement.style.cursor = cursor
  }

  // 防止 mouseup 被 disabled 元素吞掉
  const style = document.createElement('style')
  style.textContent = `
    :disabled {
      pointer-events: none;
    }
  `
  document.head.appendChild(style)

  const abortController = new AbortController()

  window.addEventListener(
    'mousemove',
    e => {
      onMove(e)
    },
    {
      signal: abortController.signal,
      capture: true,
    },
  )

  window.addEventListener(
    'mouseup',
    e => {
      onEnd?.(e)

      document.body.style.userSelect = originalUserSelect

      if (cursor) {
        document.documentElement.style.cursor = originalCursor
      }

      document.head.removeChild(style)

      abortController.abort()
    },
    {
      once: true,
      capture: true,
    },
  )
}
