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
  const originalPointerEvents = document.body.style.pointerEvents
  document.body.style.pointerEvents = 'none' // 防止 mouseup 被 disabled 元素吞掉，以及拖拽时误选中文字等

  const originalCursor = document.documentElement.style.cursor
  if (cursor) {
    document.documentElement.style.cursor = cursor
  }

  const abortController = new AbortController()

  window.addEventListener('mousemove', onMove, {
    signal: abortController.signal,
    capture: true,
  })

  window.addEventListener(
    'mouseup',
    e => {
      onEnd?.(e)

      document.body.style.pointerEvents = originalPointerEvents
      if (cursor) {
        document.documentElement.style.cursor = originalCursor
      }
      abortController.abort()
    },
    {
      once: true,
      capture: true,
    },
  )
}
