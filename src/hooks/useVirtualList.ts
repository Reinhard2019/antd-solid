import { createEffect, type Accessor, createSignal, createMemo, onCleanup, untrack } from 'solid-js'

export interface Options {
  containerTarget: Accessor<HTMLElement>
  wrapperTarget: Accessor<HTMLElement>
  itemSize: Accessor<number>
  /**
   * 垂直或者水平方向，默认 vertical
   */
  layout?: Accessor<'vertical' | 'horizontal'>
}

const useVirtualList = <T = any>(list: Accessor<T[]>, options: Options) => {
  const [range, setRange] = createSignal([0, 0])
  const layout = createMemo(() => options.layout?.() ?? 'vertical')

  const calculateRange = () => {
    const container = options.containerTarget()
    const wrapper = options.wrapperTarget()
    const wrapperStyle = getComputedStyle(wrapper)
    const scrollSize =
      layout() === 'vertical'
        ? container.scrollTop -
          parseFloat(wrapperStyle.borderTopWidth) -
          parseFloat(wrapperStyle.paddingTop)
        : container.scrollLeft -
          parseFloat(wrapperStyle.borderLeftWidth) -
          parseFloat(wrapperStyle.paddingLeft)
    const clientSize = layout() === 'vertical' ? container.clientHeight : container.clientWidth

    const start = Math.floor(Math.max(scrollSize, 0) / options.itemSize())
    const end = Math.ceil(Math.max(scrollSize + clientSize, 0) / options.itemSize())
    setRange([start, end])

    const totalSize = options.itemSize() * list().length
    const translateSize = start * options.itemSize()
    if (layout() === 'vertical') {
      wrapper.style.marginTop = `${translateSize}px`
      wrapper.style.height = `${totalSize - translateSize}px`
    } else {
      wrapper.style.marginLeft = `${translateSize}px`
      wrapper.style.width = `${totalSize - translateSize}px`
    }
    wrapper.style.boxSizing = 'content-box'
  }

  createEffect(() => {
    const container = options.containerTarget()

    const onScroll = () => {
      untrack(calculateRange)
    }
    container.addEventListener('scroll', onScroll)
    onCleanup(() => {
      container.removeEventListener('scroll', onScroll)
    })
  })

  createEffect(() => {
    calculateRange()
  })

  const rangeList = createMemo(() => list().slice(...range()))

  return { list: rangeList }
}

export default useVirtualList
