import { compact, isEqual } from 'lodash-es'
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
  createSignal,
  on,
  createRenderEffect,
  useContext,
} from 'solid-js'
import { Dynamic, Portal } from 'solid-js/web'
import cs from 'classnames'
import { nanoid } from 'nanoid'
import createControllableValue from '../hooks/createControllableValue'
import { useClickAway, useSize } from '../hooks'
import DelayShow from '../DelayShow'
import { isEmptyJSXElement } from '../utils/solid'
import useHover from '../hooks/useHover'
import AntdElement from '../Element'
import TooltipContext, { type TooltipContextProps } from './context'

type ActionType = 'hover' | 'focus' | 'click' | false
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
  trigger?: ActionType
  /**
   * 默认: top
   */
  placement?: TooltipPlacement
  contentStyle?: JSX.CSSProperties
  content?: JSXElement | ((close: () => void) => JSXElement)
  children?: JSXElement
  /**
   * 只有在 trigger 为 manual 时生效
   */
  position?: [x: number, y: number]
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
  /** 是否禁用 */
  disabled?: boolean
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
      mouseLeaveDelay: 0.1,
      plain: false,
      autoAdjustOverflow: true,
    } as const,
    _props,
  )

  // ========================== Context ===========================
  const [subPopupElements, setSubPopupElements] = createSignal<Record<string, HTMLElement>>({})
  const parentContext = useContext(TooltipContext)
  const context: TooltipContextProps = {
    registerSubPopup: (id, subPopupEle) => {
      setSubPopupElements(prev => ({
        ...prev,
        [id]: subPopupEle,
      }))

      parentContext?.registerSubPopup(id, subPopupEle)
    },
  }

  // =========================== Tooltip ============================
  const id = nanoid()
  const resolvedChildren = children(() => _props.children)
  const [contentRef, setContentRef] = createSignal<HTMLDivElement>()
  const setPopupRef = (node: HTMLDivElement) => {
    setContentRef(node)
    parentContext?.registerSubPopup(id, node)
  }
  const [_open, setOpen] = createControllableValue(_props, {
    defaultValue: false,
    valuePropName: 'open',
    trigger: 'onOpenChange',
  })
  const [isEmptyContent, setIsEmptyContent] = createSignal(false)
  const open = createMemo(() => _open() && !props.disabled && !isEmptyContent())
  const reverseOpen = () => setOpen(v => !v)
  const show = () => setOpen(true)
  const hide = () => setOpen(false)

  // children 的 BoundingClientRect
  const [childrenRect, setChildrenRect] = createSignal<DOMRect>(new DOMRect(), {
    equals: (a, b) => isEqual(a.toJSON(), b.toJSON()),
  })
  createEffect(() => {
    const _children = resolvedChildren()
    if (!(_children instanceof Element)) return

    setChildrenRect(_children.getBoundingClientRect())

    if (!open()) return

    let handle: number | undefined
    const tick = () => {
      setChildrenRect(_children.getBoundingClientRect())

      handle = window.requestAnimationFrame(tick)
    }
    tick()

    onCleanup(() => {
      if (typeof handle === 'number') window.cancelAnimationFrame(handle)
    })
  })

  const hovering = useHover(() => {
    const _children = resolvedChildren()
    if (props.trigger === 'hover' && _children instanceof Element) {
      return [_children, ...Object.values(subPopupElements())].concat(
        contentRef() ? [contentRef()!] : [],
      )
    }
  })
  createEffect(() => {
    if (props.trigger === 'hover') {
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
    const _children = resolvedChildren()
    if (!(_children instanceof Element)) return

    const abortController = new AbortController()

    switch (props.trigger) {
      case 'click':
        _children.addEventListener('click', reverseOpen, {
          signal: abortController.signal,
        })
        useClickAway(hide, () =>
          compact([...Object.values(subPopupElements()), contentRef(), _children]),
        )
        break
      case 'focus':
        _children.addEventListener('focusin', show, {
          signal: abortController.signal,
        })
        _children.addEventListener('focusout', hide, {
          signal: abortController.signal,
        })
        break
    }

    onCleanup(() => {
      abortController.abort()
    })
  })

  const arrowOffset = createMemo(() => (props.arrow ? 4 : 0))
  const [reverse, setReverse] = createSignal(false)
  createRenderEffect(
    on(open, () => {
      setReverse(false)
    }),
  )
  const reversedPlacement = createMemo(() =>
    reverse() ? REVERSE_PLACEMENT_DICT[props.placement] : props.placement,
  )
  const contentSize = useSize(contentRef)
  // 设置 content 显示时的 translate
  createEffect(() => {
    const _contentRef = contentRef()
    const _contentSize = contentSize()
    if (!_contentRef || !_contentSize || !open()) return

    let translateX = 0
    let translateY = 0

    const _childrenRect = new DOMRect(
      childrenRect().x,
      childrenRect().y,
      childrenRect().width,
      childrenRect().height,
    )

    if (props.offset) {
      const [offsetX, offsetY] = props.offset
      _childrenRect.x += offsetX
      _childrenRect.y += offsetY
    }

    switch (props.placement) {
      case 'top':
      case 'bottom':
        translateX = _childrenRect.left + _childrenRect.width / 2 - _contentSize.width / 2
        break
      case 'topLeft':
      case 'bottomLeft':
        translateX = _childrenRect.left
        break
      case 'topRight':
      case 'bottomRight':
        translateX = _childrenRect.right - _contentSize.width
        break
      case 'left':
      case 'right':
        translateY = _childrenRect.top + _childrenRect.height / 2 - _contentSize.height / 2
        break
      case 'leftTop':
      case 'rightTop':
        translateY = _childrenRect.top
        break
      case 'leftBottom':
      case 'rightBottom':
        translateY = _childrenRect.bottom - _contentSize.height
        break
    }

    const updateTranslateByMainPlacement = (type: MainPlacement) => {
      const defaultOffset = props.offset ? 0 : 6
      switch (type) {
        case 'top':
          translateY = _childrenRect.top - arrowOffset() - defaultOffset - _contentSize.height
          break
        case 'bottom':
          translateY = _childrenRect.bottom + arrowOffset() + defaultOffset
          break
        case 'left':
          translateX = _childrenRect.left - arrowOffset() - defaultOffset - _contentSize.width
          break
        case 'right':
          translateX = _childrenRect.right + arrowOffset() + defaultOffset
          break
      }
    }

    type MainPlacement = 'top' | 'bottom' | 'left' | 'right'
    let mainPlacement: MainPlacement = 'top'
    switch (props.placement) {
      case 'bottom':
      case 'bottomLeft':
      case 'bottomRight':
        mainPlacement = 'bottom'
        break
      case 'left':
      case 'leftTop':
      case 'leftBottom':
        mainPlacement = 'left'
        break
      case 'right':
      case 'rightTop':
      case 'rightBottom':
        mainPlacement = 'right'
        break
    }

    if (props.autoAdjustOverflow) {
      switch (mainPlacement) {
        case 'top':
          if (reverse()) {
            updateTranslateByMainPlacement('bottom')
            if (translateY + _contentSize.height > window.innerHeight) {
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
          if (reverse()) {
            updateTranslateByMainPlacement('top')
            if (translateY < 0) {
              setReverse(false)
              updateTranslateByMainPlacement('bottom')
            }
          } else {
            updateTranslateByMainPlacement('bottom')
            if (translateY + _contentSize.height > window.innerHeight) {
              setReverse(true)
              updateTranslateByMainPlacement('top')
            }
          }
          break
        case 'left':
          if (reverse()) {
            updateTranslateByMainPlacement('right')
            if (translateX < 0) {
              setReverse(false)
              updateTranslateByMainPlacement('left')
            }
          } else {
            updateTranslateByMainPlacement('left')
            if (translateX + _contentSize.width > window.innerWidth) {
              setReverse(true)
              updateTranslateByMainPlacement('right')
            }
          }
          break
        case 'right':
          if (reverse()) {
            updateTranslateByMainPlacement('left')
            if (translateX + _contentSize.width > window.innerWidth) {
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
      switch (mainPlacement) {
        case 'top':
          updateTranslateByMainPlacement('top')
          break
        case 'bottom':
          updateTranslateByMainPlacement('bottom')
          break
        case 'left':
          updateTranslateByMainPlacement('left')
          break
        case 'right':
          updateTranslateByMainPlacement('right')
          break
      }
    }

    _contentRef.style.setProperty('--translate-x', `${translateX}px`)
    _contentRef.style.setProperty('--translate-y', `${translateY}px`)

    // placement 为 top 和 bottom 时，tooltip 超出可视区域时对 content 进行偏移矫正
    if (props.placement === 'top' || props.placement === 'bottom') {
      let innerTranslateX = 0
      const maxInnerTranslateX = _contentSize.width / 2 - 20
      if (translateX < 0) {
        innerTranslateX = Math.min(-translateX, maxInnerTranslateX)
      }
      if (translateX + _contentSize.width > window.innerWidth) {
        innerTranslateX = Math.max(
          window.innerWidth - (translateX + _contentSize.width),
          -maxInnerTranslateX,
        )
      }
      _contentRef.style.setProperty('--inner-translate-x', `${innerTranslateX}px`)
    }
  })

  return (
    <TooltipContext.Provider value={context}>
      {resolvedChildren()}

      <Dynamic component={props.destroyOnClose ? Show : DelayShow} when={open()}>
        <Portal mount={props.getPopupContainer()}>
          {/* Portal 存在缺陷，onClick 依然会沿着 solid 的组件树向上传播，因此需要 stopPropagation */}
          <AntdElement
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
          </AntdElement>
        </Portal>
      </Dynamic>
    </TooltipContext.Provider>
  )
}

export default Tooltip
