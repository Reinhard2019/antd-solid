import { compact } from 'lodash-es'
import {
  type Component,
  type JSXElement,
  type JSX,
  children,
  createEffect,
  Show,
  mergeProps,
  onCleanup,
  createMemo,
  untrack,
} from 'solid-js'
import { Portal } from 'solid-js/web'
import cs from 'classnames'
import createControllableValue from '../hooks/createControllableValue'
import { useClickAway } from '../hooks'
import { toArray } from '../utils/array'
import DelayShow from '../DelayShow'

type ActionType = 'hover' | 'focus' | 'click' | 'contextMenu'
type TooltipPlacement =
  | 'top'
  | 'left'
  | 'right'
  | 'bottom'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight'
  | 'leftTop'
  | 'leftBottom'
  | 'rightTop'
  | 'rightBottom'

export interface TooltipProps {
  /**
   * 默认: hover
   */
  trigger?: ActionType | ActionType[]
  /**
   * 默认: top
   */
  placement?: TooltipPlacement
  contentStyle?: JSX.CSSProperties
  content?: JSXElement | ((close: () => void) => JSXElement)
  children?: JSXElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /**
   * 默认: dark
   */
  mode?: 'dark' | 'light'
  /**
   * 默认: true
   */
  arrow?: boolean | { pointAtCenter: boolean }
}

/**
 * 获取滚动元素
 * @param ele
 * @returns
 */
function collectScroll(ele: HTMLElement) {
  const scrollList: HTMLElement[] = []
  let current = ele?.parentElement

  while (current) {
    if (current.scrollHeight > current.clientHeight) {
      scrollList.push(current)
    }

    current = current.parentElement
  }

  return [window, ...scrollList]
}

export const Content: Component<{
  content: TooltipProps['content']
  close: () => void
}> = props => {
  return (
    <Show when={typeof props.content === 'function'} fallback={props.content as JSXElement}>
      {typeof props.content === 'function' && props.content(props.close)}
    </Show>
  )
}

const Tooltip: Component<TooltipProps> = _props => {
  const props = mergeProps(
    {
      trigger: 'hover',
      placement: 'top',
      mode: 'dark',
      arrow: true,
    },
    _props,
  )

  const resolvedChildren = children(() => _props.children)
  let content: HTMLDivElement | undefined
  const [open, setOpen] = createControllableValue(_props, {
    defaultValue: false,
    valuePropName: 'open',
    trigger: 'onOpenChange',
  })
  const reverseOpen = () => setOpen(v => !v)

  createEffect(() => {
    const _children = resolvedChildren() as Element
    toArray(props.trigger).forEach(trigger => {
      switch (trigger) {
        case 'hover':
          _children.addEventListener('mouseenter', reverseOpen)
          _children.addEventListener('mouseleave', reverseOpen)
          onCleanup(() => {
            _children.removeEventListener('mouseenter', reverseOpen)
            _children.removeEventListener('mouseleave', reverseOpen)
          })
          break
        case 'click':
          _children.addEventListener('click', reverseOpen)
          onCleanup(() => {
            _children.removeEventListener('click', reverseOpen)
          })

          useClickAway(
            () => setOpen(false),
            () => compact([content, _children]),
          )
          break
        case 'focus':
          _children.addEventListener('focusin', reverseOpen)
          _children.addEventListener('focusout', reverseOpen)
          onCleanup(() => {
            _children.removeEventListener('focusin', reverseOpen)
            _children.removeEventListener('focusout', reverseOpen)
          })
          break
      }
    })
  })

  const arrowOffset = createMemo(() => (props.arrow ? 8 : 0))
  const setTranslate = () => {
    untrack(() => {
      if (!content) return

      const _children = resolvedChildren() as Element
      const childrenRect = _children.getBoundingClientRect()
      switch (props.placement) {
        case 'top':
          content.style.setProperty(
            '--translate-x',
            `calc(${childrenRect.left + childrenRect.width / 2}px - 50%)`,
          )
          content.style.setProperty(
            '--translate-y',
            `calc(${childrenRect.top - arrowOffset()}px - 100%)`,
          )
          return
        case 'topLeft':
          content.style.setProperty('--translate-x', `${childrenRect.left}px`)
          content.style.setProperty(
            '--translate-y',
            `calc(${childrenRect.top - arrowOffset()}px - 100%)`,
          )
          return
        case 'topRight':
          content.style.setProperty('--translate-x', `calc(${childrenRect.right}px - 100%)`)
          content.style.setProperty(
            '--translate-y',
            `calc(${childrenRect.top - arrowOffset()}px - 100%)`,
          )
          return
        case 'bottom':
          content.style.setProperty(
            '--translate-x',
            `calc(${childrenRect.left + childrenRect.width / 2}px - 50%)`,
          )
          content.style.setProperty('--translate-y', `${childrenRect.bottom + arrowOffset()}px`)
          return
        case 'bottomLeft':
          content.style.setProperty('--translate-x', `${childrenRect.left}px`)
          content.style.setProperty('--translate-y', `${childrenRect.bottom + arrowOffset()}px`)
          return
        case 'bottomRight':
          content.style.setProperty('--translate-x', `calc(${childrenRect.right}px - 100%)`)
          content.style.setProperty('--translate-y', `${childrenRect.bottom + arrowOffset()}px`)
          return
        case 'left':
          content.style.setProperty(
            '--translate-x',
            `calc(${childrenRect.left - arrowOffset()}px - 100%)`,
          )
          content.style.setProperty(
            '--translate-y',
            `calc(${childrenRect.top + childrenRect.height / 2}px - 50%)`,
          )
          return
        case 'leftTop':
          content.style.setProperty(
            '--translate-x',
            `calc(${childrenRect.left - arrowOffset()}px - 100%)`,
          )
          content.style.setProperty('--translate-y', `${childrenRect.top}px`)
          return
        case 'leftBottom':
          content.style.setProperty(
            '--translate-x',
            `calc(${childrenRect.left - arrowOffset()}px - 100%)`,
          )
          content.style.setProperty('--translate-y', `calc(${childrenRect.bottom}px - 100%)`)
          return
        case 'right':
          content.style.setProperty('--translate-x', `${childrenRect.right + arrowOffset()}px`)
          content.style.setProperty(
            '--translate-y',
            `calc(${childrenRect.top + childrenRect.height / 2}px - 50%)`,
          )
          return
        case 'rightTop':
          content.style.setProperty('--translate-x', `${childrenRect.right + arrowOffset()}px`)
          content.style.setProperty('--translate-y', `${childrenRect.top}px`)
          return
        case 'rightBottom':
          content.style.setProperty('--translate-x', `${childrenRect.right + arrowOffset()}px`)
          content.style.setProperty('--translate-y', `calc(${childrenRect.bottom}px - 100%)`)
      }
    })
  }
  // 监听滚动
  createEffect(() => {
    if (!open()) return

    setTranslate()

    const cleanupFnList: Array<() => void> = []

    const _children = resolvedChildren() as HTMLElement
    const scrollList = collectScroll(_children)
    scrollList.forEach(scroll => {
      const onScroll = () => {
        setTranslate()
      }
      scroll.addEventListener('scroll', onScroll)
      cleanupFnList.push(() => {
        scroll.removeEventListener('scroll', onScroll)
      })
    })

    onCleanup(() => {
      cleanupFnList.forEach(fn => {
        fn()
      })
    })
  })
  // 监听 children 的 size 变化
  createEffect(() => {
    const _children = resolvedChildren() as HTMLElement
    const ro = new ResizeObserver(() => {
      setTranslate()
    })
    ro.observe(_children)
    onCleanup(() => {
      ro.disconnect()
    })
  })
  const arrowStyle = createMemo(() => {
    switch (props.placement) {
      case 'top':
        return {
          'border-top-color': 'var(--color)',
          top: '100%',
          filter: 'drop-shadow(3px 2px 2px rgba(0, 0, 0, 0.08))',
          left: '50%',
          transform: 'translateX(-50%)',
        } as JSX.CSSProperties
      case 'topLeft':
        return {
          'border-top-color': 'var(--color)',
          top: '100%',
          filter: 'drop-shadow(3px 2px 2px rgba(0, 0, 0, 0.08))',
          left: '8px',
        } as JSX.CSSProperties
      case 'topRight':
        return {
          'border-top-color': 'var(--color)',
          top: '100%',
          filter: 'drop-shadow(3px 2px 2px rgba(0, 0, 0, 0.08))',
          right: '8px',
        } as JSX.CSSProperties
      case 'bottom':
        return {
          'border-bottom-color': 'var(--color)',
          bottom: '100%',
          filter: 'drop-shadow(3px 2px 2px rgba(0, 0, 0, 0.08))',
          left: '50%',
          transform: 'translateX(-50%)',
        } as JSX.CSSProperties
      case 'bottomLeft':
        return {
          'border-bottom-color': 'var(--color)',
          bottom: '100%',
          filter: 'drop-shadow(3px 2px 2px rgba(0, 0, 0, 0.08))',
          left: '8px',
        } as JSX.CSSProperties
      case 'bottomRight':
        return {
          'border-bottom-color': 'var(--color)',
          bottom: '100%',
          filter: 'drop-shadow(3px 2px 2px rgba(0, 0, 0, 0.08))',
          right: '8px',
        } as JSX.CSSProperties
      case 'left':
        return {
          'border-left-color': 'var(--color)',
          top: '50%',
          right: 0,
          transform: 'translate(100%, -50%)',
        } as JSX.CSSProperties
      case 'leftTop':
        return {
          'border-left-color': 'var(--color)',
          top: '8px',
          right: 0,
          transform: 'translate(100%, 0)',
        } as JSX.CSSProperties
      case 'leftBottom':
        return {
          'border-left-color': 'var(--color)',
          bottom: '8px',
          right: 0,
          transform: 'translate(100%, 0)',
        } as JSX.CSSProperties
      case 'right':
        return {
          'border-right-color': 'var(--color)',
          top: '50%',
          left: 0,
          transform: 'translate(-100%, -50%)',
        } as JSX.CSSProperties
      case 'rightTop':
        return {
          'border-right-color': 'var(--color)',
          top: '8px',
          left: 0,
          transform: 'translate(-100%, 0)',
        } as JSX.CSSProperties
      case 'rightBottom':
        return {
          'border-right-color': 'var(--color)',
          bottom: '8px',
          left: 0,
          transform: 'translate(-100%, 0)',
        } as JSX.CSSProperties
    }
  })

  return (
    <>
      {resolvedChildren()}

      <DelayShow when={open()}>
        <Portal>
          {/* Portal 存在缺陷，onClick 依然会沿着 solid 的组件树向上传播，因此需要 stopPropagation */}
          <div
            ref={content}
            class={cs('z-1000 fixed left-0 top-0', open() ? 'block' : 'hidden')}
            style={{
              transform:
                'translate(clamp(0px, var(--translate-x), calc(100vw - 100%)), clamp(0px, var(--translate-y), calc(100vh - 100%)))',
            }}
            onClick={e => {
              e.stopPropagation()
            }}
          >
            <div
              class={cs(
                'px-8px py-6px box-content [box-shadow:0_6px_16px_0_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)] rounded-[var(--ant-border-radius-lg)] overflow-hidden',
                props.mode === 'dark' ? 'bg-[rgba(0,0,0,0.85)] text-white' : 'bg-white',
              )}
              style={props.contentStyle}
            >
              <Content content={props.content} close={() => setOpen(false)} />
            </div>

            <Show when={props.arrow}>
              <div
                class={cs('w-8px h-8px absolute border-solid border-4px border-transparent')}
                style={{
                  '--color': props.mode === 'dark' ? 'rgba(0,0,0,0.85)' : 'white',
                  ...arrowStyle(),
                }}
              />
            </Show>
          </div>
        </Portal>
      </DelayShow>
    </>
  )
}

export default Tooltip
