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
import { isEmptyJSXElement } from '../utils/solid'
import { isHide } from '../utils/dom'
import useHover from '../hooks/useHover'
import Element from '../Element'

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
   * 简单样式
   * 如果为 true，则背景色和文字颜色会跟随主题
   * 默认 false
   */
  plain?: boolean
  /**
   * 默认: true
   */
  arrow?: boolean | { pointAtCenter: boolean }
  /**
   * 菜单渲染父节点。默认渲染到 body 上，如果你遇到菜单滚动定位问题，试试修改为滚动的区域，并相对其定位。
   * 默认 () => document.body
   * @returns
   */
  getPopupContainer?: () => HTMLElement
  /**
   * x、y 轴的偏移量
   */
  offset?: [number, number]
  /**
   * 鼠标移出后延时多少才隐藏 Tooltip，单位：秒
   * 默认 0.1
   */
  mouseLeaveDelay?: number
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

export const getContent = (content: TooltipProps['content'], close: () => void) => {
  return typeof content === 'function' ? content(close) : content
}

const Tooltip: Component<TooltipProps> = _props => {
  const props = mergeProps(
    {
      trigger: 'hover',
      placement: 'top',
      mode: 'dark',
      arrow: true,
      getPopupContainer: () => document.body,
      offset: [0, 0],
      mouseLeaveDelay: 0.1,
      plain: false,
    },
    _props,
  )

  const resolvedChildren = children(() => _props.children)
  const content = createMemo(() => getContent(props.content, () => setOpen(false)))
  let contentRef: HTMLDivElement | undefined
  const [_open, setOpen] = createControllableValue(_props, {
    defaultValue: false,
    valuePropName: 'open',
    trigger: 'onOpenChange',
  })
  const open = createMemo(() => _open() && !isEmptyJSXElement(content()))
  const reverseOpen = () => setOpen(v => !v)
  const show = () => setOpen(true)
  const hide = () => setOpen(false)

  const contentHovering = useHover(() => (open() ? contentRef : undefined))
  const childrenHovering = useHover(() =>
    toArray(props.trigger).includes('hover') ? (resolvedChildren() as HTMLElement) : undefined,
  )
  createEffect(() => {
    if (toArray(props.trigger).includes('hover')) {
      if (contentHovering() || childrenHovering()) {
        show()
      } else {
        setTimeout(() => {
          if (!contentHovering() && !childrenHovering()) {
            hide()
          }
        }, props.mouseLeaveDelay * 1000)
      }
    }
  })

  createEffect(() => {
    const _children = resolvedChildren() as Element
    toArray(props.trigger).forEach(trigger => {
      switch (trigger) {
        case 'click':
          _children.addEventListener('click', reverseOpen)
          onCleanup(() => {
            _children.removeEventListener('click', reverseOpen)
          })

          useClickAway(
            () => setOpen(false),
            () => compact([contentRef, _children]),
          )
          break
        case 'focus':
          _children.addEventListener('focusin', show)
          _children.addEventListener('focusout', hide)
          onCleanup(() => {
            _children.removeEventListener('focusin', show)
            _children.removeEventListener('focusout', hide)
          })
          break
      }
    })
  })

  const arrowOffset = createMemo(() => (props.arrow ? 8 : 0))
  const setTranslate = () => {
    if (!contentRef) return

    const _children = resolvedChildren() as HTMLElement
    if (isHide(_children)) {
      setOpen(false)
      return
    }

    const childrenRect = _children.getBoundingClientRect()
    switch (props.placement) {
      case 'top':
        contentRef.style.setProperty(
          '--translate-x',
          `calc(${childrenRect.left + childrenRect.width / 2}px - 50%)`,
        )
        contentRef.style.setProperty(
          '--translate-y',
          `calc(${childrenRect.top - arrowOffset()}px - 100%)`,
        )
        return
      case 'topLeft':
        contentRef.style.setProperty('--translate-x', `${childrenRect.left}px`)
        contentRef.style.setProperty(
          '--translate-y',
          `calc(${childrenRect.top - arrowOffset()}px - 100%)`,
        )
        return
      case 'topRight':
        contentRef.style.setProperty('--translate-x', `calc(${childrenRect.right}px - 100%)`)
        contentRef.style.setProperty(
          '--translate-y',
          `calc(${childrenRect.top - arrowOffset()}px - 100%)`,
        )
        return
      case 'bottom':
        contentRef.style.setProperty(
          '--translate-x',
          `calc(${childrenRect.left + childrenRect.width / 2}px - 50%)`,
        )
        contentRef.style.setProperty('--translate-y', `${childrenRect.bottom + arrowOffset()}px`)
        return
      case 'bottomLeft':
        contentRef.style.setProperty('--translate-x', `${childrenRect.left}px`)
        contentRef.style.setProperty('--translate-y', `${childrenRect.bottom + arrowOffset()}px`)
        return
      case 'bottomRight':
        contentRef.style.setProperty('--translate-x', `calc(${childrenRect.right}px - 100%)`)
        contentRef.style.setProperty('--translate-y', `${childrenRect.bottom + arrowOffset()}px`)
        return
      case 'left':
        contentRef.style.setProperty(
          '--translate-x',
          `calc(${childrenRect.left - arrowOffset()}px - 100%)`,
        )
        contentRef.style.setProperty(
          '--translate-y',
          `calc(${childrenRect.top + childrenRect.height / 2}px - 50%)`,
        )
        return
      case 'leftTop':
        contentRef.style.setProperty(
          '--translate-x',
          `calc(${childrenRect.left - arrowOffset()}px - 100%)`,
        )
        contentRef.style.setProperty('--translate-y', `${childrenRect.top}px`)
        return
      case 'leftBottom':
        contentRef.style.setProperty(
          '--translate-x',
          `calc(${childrenRect.left - arrowOffset()}px - 100%)`,
        )
        contentRef.style.setProperty('--translate-y', `calc(${childrenRect.bottom}px - 100%)`)
        return
      case 'right':
        contentRef.style.setProperty('--translate-x', `${childrenRect.right + arrowOffset()}px`)
        contentRef.style.setProperty(
          '--translate-y',
          `calc(${childrenRect.top + childrenRect.height / 2}px - 50%)`,
        )
        return
      case 'rightTop':
        contentRef.style.setProperty('--translate-x', `${childrenRect.right + arrowOffset()}px`)
        contentRef.style.setProperty('--translate-y', `${childrenRect.top}px`)
        return
      case 'rightBottom':
        contentRef.style.setProperty('--translate-x', `${childrenRect.right + arrowOffset()}px`)
        contentRef.style.setProperty('--translate-y', `calc(${childrenRect.bottom}px - 100%)`)
    }
  }
  createEffect(() => {
    if (!open()) return

    setTranslate()
  })
  // 监听滚动
  createEffect(() => {
    if (!open()) return

    const cleanupFnList: Array<() => void> = []

    const _children = resolvedChildren() as HTMLElement
    const scrollList = collectScroll(_children)
    scrollList.forEach(scroll => {
      const onScroll = () => {
        untrack(setTranslate)
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
  // 监听 children 的位置变化
  createEffect(() => {
    const _children = resolvedChildren() as HTMLElement

    const config = { attributes: true }
    const ro = new MutationObserver(() => {
      setTranslate()
    })
    ro.observe(_children, config)

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
        <Portal mount={props.getPopupContainer()}>
          {/* Portal 存在缺陷，onClick 依然会沿着 solid 的组件树向上传播，因此需要 stopPropagation */}
          <Element
            ref={contentRef}
            class={cs(
              'z-1000 fixed left-0 top-0 [font-size:var(--ant-font-size)] text-[var(--ant-color-text)] leading-[var(--ant-line-height)]',
              open() ? 'block' : 'hidden',
            )}
            style={{
              transform: `translate(clamp(0px, calc(var(--translate-x) + ${props.offset?.[0] ?? 0}px), calc(100vw - 100%)), clamp(0px, calc(var(--translate-y) + ${props.offset?.[1] ?? 0}px), calc(100vh - 100%)))`,
            }}
            onClick={e => {
              e.stopPropagation()
            }}
          >
            <div
              class={cs(
                'px-8px py-6px box-content [box-shadow:var(--ant-box-shadow)] rounded-[var(--ant-border-radius-lg)] overflow-hidden',
                props.plain
                  ? 'text-[var(--ant-color-text)] bg-[var(--ant-color-bg-elevated)]'
                  : 'text-[var(--ant-color-text-light-solid)] bg-[var(--ant-color-bg-spotlight)]',
              )}
              style={props.contentStyle}
            >
              {content()}
            </div>

            <Show when={props.arrow}>
              <div
                class={cs('w-8px h-8px absolute border-solid border-4px border-transparent')}
                style={{
                  '--color': props.plain
                    ? 'var(--ant-color-bg-elevated)'
                    : 'var(--ant-color-bg-spotlight)',
                  ...arrowStyle(),
                }}
              />
            </Show>
          </Element>
        </Portal>
      </DelayShow>
    </>
  )
}

export default Tooltip
