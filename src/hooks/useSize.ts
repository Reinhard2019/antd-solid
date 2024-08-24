import { isEqual } from 'lodash-es'
import { type Accessor, createSignal, onCleanup, createEffect } from 'solid-js'

/**
 * 获取元素尺寸
 * @param target
 * @param type 宽高的类型，'client' 代表 clientWidth、clientHeight，'offset' 代表 offsetWidth、offsetHeight
 * @returns
 */
export default function useSize(
  target: Accessor<HTMLElement | undefined>,
  type: 'client' | 'offset' = 'client',
) {
  const [size, setSize] = createSignal<
  | {
    width: number
    height: number
  }
  | undefined
  >(undefined, {
    equals: isEqual,
  })

  createEffect(() => {
    const _target = target()
    if (!_target) return

    const callback = () => {
      setSize({
        width: type === 'offset' ? _target.offsetWidth : _target.clientWidth,
        height: type === 'offset' ? _target.offsetHeight : _target.clientHeight,
      })
    }
    // ResizeObserver observe 后虽然也会立刻执行 callback，但它执行不及时
    callback()

    const ro = new ResizeObserver(callback)
    ro.observe(_target)
    onCleanup(() => {
      ro.disconnect()
    })
  })

  return size
}
