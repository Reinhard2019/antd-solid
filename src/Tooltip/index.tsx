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
  createSignal,
  on,
  createRenderEffect,
  useContext,
} from 'solid-js'
import { Dynamic, Portal } from 'solid-js/web'
import cs from 'classnames'
import { nanoid } from 'nanoid'
import createControllableValue from '../hooks/createControllableValue'
import { useClickAway } from '../hooks'
import { toArray } from '../utils/array'
import DelayShow from '../DelayShow'
import { isEmptyJSXElement } from '../utils/solid'
import { isHide } from '../utils/dom'
import useHover from '../hooks/useHover'
import Element from '../Element'
import TooltipContext, { type TooltipContextProps } from './context'

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
  content?: string | number | undefined | null | ((close: () => void) => JSXElement)
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
  /**
   * 气泡被遮挡时自动调整位置
   * 默认 true
   */
  autoAdjustOverflow?: boolean
  /**
   * 关闭时销毁 Tooltip 里的子元素
   */
  destroyOnClose?: boolean
  /**
   * 是否在 trigger 为 hover 的时候，悬浮在 popover 时保持 popover 显示
   * 默认为 true
   */
  keepAliveOnHover?: boolean
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

export const unwrapContent = (content: TooltipProps['content'], close: () => void) => {
  return typeof content === 'function' ? content(close) : content
}

const ARROW_STYLE_DICT: Record<TooltipPlacement, JSX.CSSProperties> = {
  top: {
    'border-top-color': 'var(--color)',
    top: '100%',
    filter: 'drop-shadow(3px 2px 2px rgba(0, 0, 0, 0.08))',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  topLeft: {
    'border-top-color': 'var(--color)',
    top: '100%',
    filter: 'drop-shadow(3px 2px 2px rgba(0, 0, 0, 0.08))',
    left: '8px',
  },
  topRight: {
    'border-top-color': 'var(--color)',
    top: '100%',
    filter: 'drop-shadow(3px 2px 2px rgba(0, 0, 0, 0.08))',
    right: '8px',
  },
  bottom: {
    'border-bottom-color': 'var(--color)',
    bottom: '100%',
    filter: 'drop-shadow(3px 2px 2px rgba(0, 0, 0, 0.08))',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  bottomLeft: {
    'border-bottom-color': 'var(--color)',
    bottom: '100%',
    filter: 'drop-shadow(3px 2px 2px rgba(0, 0, 0, 0.08))',
    left: '8px',
  },
  bottomRight: {
    'border-bottom-color': 'var(--color)',
    bottom: '100%',
    filter: 'drop-shadow(3px 2px 2px rgba(0, 0, 0, 0.08))',
    right: '8px',
  },
  left: {
    'border-left-color': 'var(--color)',
    top: '50%',
    right: 0,
    transform: 'translate(100%, -50%)',
  },
  leftTop: {
    'border-left-color': 'var(--color)',
    top: '8px',
    right: 0,
    transform: 'translate(100%, 0)',
  },
  leftBottom: {
    'border-left-color': 'var(--color)',
    bottom: '8px',
    right: 0,
    transform: 'translate(100%, 0)',
  },
  right: {
    'border-right-color': 'var(--color)',
    top: '50%',
    left: 0,
    transform: 'translate(-100%, -50%)',
  },
  rightTop: {
    'border-right-color': 'var(--color)',
    top: '8px',
    left: 0,
    transform: 'translate(-100%, 0)',
  },
  rightBottom: {
    'border-right-color': 'var(--color)',
    bottom: '8px',
    left: 0,
    transform: 'translate(-100%, 0)',
  },
}

const REVERSE_PLACEMENT_DICT: Record<TooltipPlacement, TooltipPlacement> = {
  top: 'bottom',
  topLeft: 'bottomLeft',
  topRight: 'bottomRight',
  bottom: 'top',
  bottomLeft: 'topLeft',
  bottomRight: 'topRight',
  left: 'right',
  leftTop: 'rightTop',
  leftBottom: 'rightBottom',
  right: 'left',
  rightTop: 'leftTop',
  rightBottom: 'leftBottom',
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
      autoAdjustOverflow: true,
      keepAliveOnHover: true,
    } as const,
    _props,
  )

  // ========================== Context ===========================
  const subPopupElements: Record<string, HTMLElement> = {}
  const parentContext = useContext(TooltipContext)
  const context: TooltipContextProps = {
    registerSubPopup: (id, subPopupEle) => {
      subPopupElements[id] = subPopupEle

      parentContext?.registerSubPopup(id, subPopupEle)
    },
  }

  // =========================== Tooltip ============================
  const id = nanoid()
  const resolvedChildren = children(() => _props.children)
  let contentRef: HTMLDivElement | undefined
  const setPopupRef = (node: HTMLDivElement) => {
    contentRef = node
    parentContext?.registerSubPopup(id, node)
  }
  const [_open, setOpen] = createControllableValue(_props, {
    defaultValue: false,
    valuePropName: 'open',
    trigger: 'onOpenChange',
  })
  const [isEmptyContent, setIsEmptyContent] = createSignal(false)
  const open = createMemo(() => _open() && !isEmptyContent())
  const reverseOpen = () => setOpen(v => !v)
  const show = () => setOpen(true)
  const hide = () => setOpen(false)

  const contentHovering = useHover(() => (open() ? contentRef : undefined))
  const childrenHovering = useHover(() =>
    toArray(props.trigger).includes('hover') ? (resolvedChildren() as HTMLElement) : undefined,
  )
  const hovering = createMemo(() =>
    props.keepAliveOnHover ? childrenHovering() || contentHovering() : childrenHovering(),
  )
  createEffect(() => {
    if (toArray(props.trigger).includes('hover')) {
      if (hovering()) {
        show()
      } else {
        setTimeout(() => {
          if (!hovering()) {
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
            () => compact([...Object.values(subPopupElements), contentRef, _children]),
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
  const [reverse, setReverse] = createSignal(false)
  createRenderEffect(
    on(open, () => {
      setReverse(false)
    }),
  )
  const reversedPlacement = createMemo(() =>
    reverse() ? REVERSE_PLACEMENT_DICT[props.placement] : props.placement,
  )
  const setTranslate = () => {
    if (!contentRef) return

    const _children = resolvedChildren() as HTMLElement
    if (isHide(_children)) {
      setOpen(false)
      return
    }

    const _childrenRect = _children.getBoundingClientRect()
    const childrenRect = {
      left: _childrenRect.left + (props.offset?.[0] ?? 0),
      right: _childrenRect.right + (props.offset?.[0] ?? 0),
      top: _childrenRect.top + (props.offset?.[1] ?? 0),
      bottom: _childrenRect.bottom + (props.offset?.[1] ?? 0),
      width: _childrenRect.width,
      height: _childrenRect.height,
    }
    let translateX = 0
    let translateY = 0

    switch (props.placement) {
      case 'top':
      case 'bottom':
        translateX = childrenRect.left + childrenRect.width / 2 - contentRef.clientWidth / 2
        break
      case 'topLeft':
      case 'bottomLeft':
        translateX = childrenRect.left
        break
      case 'topRight':
      case 'bottomRight':
        translateX = childrenRect.right - contentRef.clientWidth
        break
      case 'left':
      case 'right':
        translateY = childrenRect.top + childrenRect.height / 2 - contentRef.clientHeight / 2
        break
      case 'leftTop':
      case 'rightTop':
        translateY = childrenRect.top
        break
      case 'leftBottom':
      case 'rightBottom':
        translateY = childrenRect.bottom - contentRef.clientHeight
        break
    }

    const updateTranslateByMainPlacement = (type: 'top' | 'bottom' | 'left' | 'right') => {
      switch (type) {
        case 'top':
          translateY = childrenRect.top - arrowOffset() - contentRef!.clientHeight
          break
        case 'bottom':
          translateY = childrenRect.bottom + arrowOffset()
          break
        case 'left':
          translateX = childrenRect.left - arrowOffset() - contentRef!.clientWidth
          break
        case 'right':
          translateX = childrenRect.right + arrowOffset()
          break
      }
    }

    if (props.autoAdjustOverflow) {
      switch (props.placement) {
        case 'top':
        case 'topLeft':
        case 'topRight':
          if (reverse()) {
            updateTranslateByMainPlacement('bottom')
            if (translateY + contentRef.clientHeight > window.innerHeight) {
              setReverse(false)
              updateTranslateByMainPlacement('top')
            }
          } else {
            updateTranslateByMainPlacement('top')
            if (translateY < 0) {
              setReverse(true)
              updateTranslateByMainPlacement('bottom')
            }
          }
          break
        case 'bottom':
        case 'bottomLeft':
        case 'bottomRight':
          if (reverse()) {
            updateTranslateByMainPlacement('top')
            if (translateY < 0) {
              setReverse(false)
              updateTranslateByMainPlacement('bottom')
            }
          } else {
            updateTranslateByMainPlacement('bottom')
            if (translateY + contentRef.clientHeight > window.innerHeight) {
              setReverse(true)
              updateTranslateByMainPlacement('top')
            }
          }
          break
        case 'left':
        case 'leftTop':
        case 'leftBottom':
          if (reverse()) {
            updateTranslateByMainPlacement('right')
            if (translateX < 0) {
              setReverse(false)
              updateTranslateByMainPlacement('left')
            }
          } else {
            updateTranslateByMainPlacement('left')
            if (translateX + contentRef.clientWidth > window.innerWidth) {
              setReverse(true)
              updateTranslateByMainPlacement('right')
            }
          }
          break
        case 'right':
        case 'rightTop':
        case 'rightBottom':
          if (reverse()) {
            updateTranslateByMainPlacement('left')
            if (translateX + contentRef.clientWidth > window.innerWidth) {
              setReverse(false)
              updateTranslateByMainPlacement('right')
            }
          } else {
            updateTranslateByMainPlacement('right')
            if (translateX < 0) {
              setReverse(true)
              updateTranslateByMainPlacement('left')
            }
          }
          break
      }
    } else {
      switch (props.placement) {
        case 'top':
        case 'topLeft':
        case 'topRight':
          updateTranslateByMainPlacement('top')
          break
        case 'bottom':
        case 'bottomLeft':
        case 'bottomRight':
          updateTranslateByMainPlacement('bottom')
          break
        case 'left':
        case 'leftTop':
        case 'leftBottom':
          updateTranslateByMainPlacement('left')
          break
        case 'right':
        case 'rightTop':
        case 'rightBottom':
          updateTranslateByMainPlacement('right')
          break
      }
    }

    contentRef.style.setProperty('--translate-x', `${translateX}px`)
    contentRef.style.setProperty('--translate-y', `${translateY}px`)

    // placement 为 top 和 bottom 时，tooltip 超出可视区域时对 content 进行偏移矫正
    if (props.placement === 'top' || props.placement === 'bottom') {
      let innerTranslateX = 0
      const maxInnerTranslateX = contentRef.clientWidth / 2 - 20
      if (translateX < 0) {
        innerTranslateX = Math.min(-translateX, maxInnerTranslateX)
      }
      if (translateX + contentRef.clientWidth > window.innerWidth) {
        innerTranslateX = Math.max(
          window.innerWidth - (translateX + contentRef.clientWidth),
          -maxInnerTranslateX,
        )
      }
      contentRef.style.setProperty('--inner-translate-x', `${innerTranslateX}px`)
    }
  }
  createEffect(
    on(open, () => {
      if (!open()) return

      setTranslate()
    }),
  )
  // 监听滚动
  createEffect(
    on([open, resolvedChildren], () => {
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
    }),
  )
  // 监听 children 的 size 变化
  createEffect(
    on([open, resolvedChildren], () => {
      if (!open()) return

      const _children = resolvedChildren() as HTMLElement
      const ro = new ResizeObserver(() => {
        setTranslate()
      })
      ro.observe(_children)
      onCleanup(() => {
        ro.disconnect()
      })
    }),
  )
  // 监听 children 的位置变化
  createEffect(
    on([open, resolvedChildren], () => {
      if (!open()) return

      const _children = resolvedChildren() as HTMLElement

      const config = { attributes: true }
      const ro = new MutationObserver(() => {
        setTranslate()
      })
      ro.observe(_children, config)

      onCleanup(() => {
        ro.disconnect()
      })
    }),
  )

  return (
    <TooltipContext.Provider value={context}>
      {resolvedChildren()}

      <Dynamic component={props.destroyOnClose ? Show : DelayShow} when={open()}>
        <Portal mount={props.getPopupContainer()}>
          {/* Portal 存在缺陷，onClick 依然会沿着 solid 的组件树向上传播，因此需要 stopPropagation */}
          <Element
            ref={setPopupRef}
            class={cs(
              'z-1000 fixed left-0 top-0 [font-size:var(--ant-font-size)] text-[var(--ant-color-text)] leading-[var(--ant-line-height)]',
              open() ? 'block' : 'hidden',
            )}
            style={{
              transform: 'translate(var(--translate-x), var(--translate-y))',
            }}
            onClick={e => {
              e.stopPropagation()
            }}
          >
            <div
              class={cs(
                'px-8px py-6px [box-shadow:var(--ant-box-shadow)] rounded-[var(--ant-border-radius-lg)] overflow-auto',
                props.placement === 'top' || props.placement === 'bottom'
                  ? 'max-w-100vw'
                  : 'max-w-[calc(100vw-var(--translate-x))]',
                'max-h-[calc(100vh-var(--translate-y))]',
                props.plain
                  ? 'text-[var(--ant-color-text)] bg-[var(--ant-color-bg-container-tertiary)]'
                  : 'text-[var(--ant-color-text-light-solid)] bg-[var(--ant-color-bg-spotlight)]',
              )}
              style={{
                transform: 'translateX(var(--inner-translate-x))',
                ...props.contentStyle,
              }}
            >
              {(() => {
                const resolvedContent = unwrapContent(props.content, () => setOpen(false))
                setIsEmptyContent(isEmptyJSXElement(resolvedContent))
                return resolvedContent
              })()}
            </div>

            <Show when={props.arrow}>
              <div
                class={cs('w-8px h-8px absolute border-solid border-4px border-transparent')}
                style={{
                  '--color': props.plain
                    ? 'var(--ant-color-bg-container-tertiary)'
                    : 'var(--ant-color-bg-spotlight)',
                  ...ARROW_STYLE_DICT[reversedPlacement()],
                }}
              />
            </Show>
          </Element>
        </Portal>
      </Dynamic>
    </TooltipContext.Provider>
  )
}

export default Tooltip
