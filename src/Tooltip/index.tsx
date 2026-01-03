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
  content?: JSXElement | ((close: () => void) => JSXElement)
  contentHTMLAttributes?: JSX.HTMLAttributes<HTMLDivElement>
  children?: JSXElement
  /**
   * 只有在 trigger 为 manual 时生效
   */
  position?: [x: number, y: number]
  defaultOpen?: boolean
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
    top: '100%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(135deg)',
  },
  topLeft: {
    top: '100%',
    left: '8px',
    transform: 'translateY(-50%) rotate(135deg)',
  },
  topRight: {
    top: '100%',
    right: '8px',
    transform: 'translateY(-50%) rotate(135deg)',
  },
  bottom: {
    bottom: '100%',
    left: '50%',
    transform: 'translate(-50%, 50%) rotate(-45deg)',
  },
  bottomLeft: {
    bottom: '100%',
    left: '8px',
    transform: 'translateY(50%) rotate(-45deg)',
  },
  bottomRight: {
    bottom: '100%',
    right: '8px',
    transform: 'translateY(50%) rotate(-45deg)',
  },
  left: {
    top: '50%',
    right: 0,
    transform: 'translate(50%, -50%) rotate(45deg)',
  },
  leftTop: {
    top: '8px',
    right: 0,
    transform: 'translate(50%, 0%) rotate(45deg)',
  },
  leftBottom: {
    bottom: '8px',
    right: 0,
    transform: 'translate(50%, 0%) rotate(45deg)',
  },
  right: {
    top: '50%',
    left: 0,
    transform: 'translate(-50%, -50%) rotate(-135deg)',
  },
  rightTop: {
    top: '8px',
    left: 0,
    transform: 'translate(-50%, 0%) rotate(-135deg)',
  },
  rightBottom: {
    bottom: '8px',
    left: 0,
    transform: 'translate(-50%, 0%) rotate(-135deg)',
  },
}

type SinglePlacement = 'top' | 'bottom' | 'left' | 'right'

const REVERSE_PLACEMENT_DICT: Record<SinglePlacement, SinglePlacement> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
}

const mergePlacement = (
  mainPlacement: SinglePlacement,
  minorPlacement: SinglePlacement | undefined,
): TooltipPlacement => {
  if (!minorPlacement) return mainPlacement

  switch (mainPlacement) {
    case 'top':
      return minorPlacement === 'left' ? 'topLeft' : 'topRight'
    case 'bottom':
      return minorPlacement === 'left' ? 'bottomLeft' : 'bottomRight'
    case 'left':
      return minorPlacement === 'top' ? 'leftTop' : 'leftBottom'
    case 'right':
      return minorPlacement === 'top' ? 'rightTop' : 'rightBottom'
  }
}

const getMainPlacement = (placement: TooltipPlacement): SinglePlacement => {
  let mainPlacement: SinglePlacement = 'top'
  switch (placement) {
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
  return mainPlacement
}

type MinorPlacement = SinglePlacement | undefined
const getMinorPlacement = (placement: TooltipPlacement): MinorPlacement => {
  let minorPlacement: MinorPlacement
  switch (placement) {
    case 'leftTop':
    case 'rightTop':
      minorPlacement = 'top'
      break
    case 'leftBottom':
    case 'rightBottom':
      minorPlacement = 'bottom'
      break
    case 'topLeft':
    case 'bottomLeft':
      minorPlacement = 'left'
      break
    case 'topRight':
    case 'bottomRight':
      minorPlacement = 'right'
      break
  }
  return minorPlacement
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
  const resolvedChildren = children(() => (
    <TooltipContext.Provider value={context}>{props.children}</TooltipContext.Provider>
  ))
  const [contentRef, setContentRef] = createSignal<HTMLDivElement>()
  const setPopupRef = (node: HTMLDivElement) => {
    setContentRef(node)
    parentContext?.registerSubPopup(id, node)
  }
  const [_open, setOpen] = createControllableValue(_props, {
    defaultValue: false,
    defaultValuePropName: 'defaultOpen',
    valuePropName: 'open',
    trigger: 'onOpenChange',
  })
  const isEmptyContent = createMemo(() => !props.content)
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
        useClickAway(
          () => {
            hide()
          },
          () => compact([...Object.values(subPopupElements()), contentRef(), _children]),
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
  let mainPlacementReverse = false
  let minorPlacementReverse = false
  createRenderEffect(
    on(open, () => {
      mainPlacementReverse = false
      minorPlacementReverse = false
    }),
  )
  const [reversedMainPlacement, setReversedMainPlacement] = createSignal<SinglePlacement>('top')
  const [reversedMinorPlacement, setReversedMinorPlacement] = createSignal<MinorPlacement>()
  const [maxWidth, setMaxWidth] = createSignal<number>()
  const [maxHeight, setMaxHeight] = createSignal<number>()
  const [_translateX, setTranslateX] = createSignal(0)
  const [_translateY, setTranslateY] = createSignal(0)
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

    const updateTranslateByMinorPlacement = (placement: TooltipPlacement) => {
      switch (placement) {
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
    }

    updateTranslateByMinorPlacement(props.placement)

    const updateTranslateByMainPlacement = (mainPlacement: SinglePlacement) => {
      const defaultOffset = props.offset ? 0 : 6
      switch (mainPlacement) {
        case 'top':
          translateY = _childrenRect.top - arrowOffset() - defaultOffset - _contentSize.height
          setMaxHeight(translateY + _contentSize.height)
          break
        case 'bottom':
          translateY = _childrenRect.bottom + arrowOffset() + defaultOffset
          setMaxHeight(window.innerHeight - translateY)
          break
        case 'left':
          translateX = _childrenRect.left - arrowOffset() - defaultOffset - _contentSize.width
          setMaxWidth(translateX + _contentSize.width)
          break
        case 'right':
          translateX = _childrenRect.right + arrowOffset() + defaultOffset
          setMaxWidth(window.innerWidth - translateX)
          break
      }
    }

    let mainPlacement = getMainPlacement(props.placement)

    if (props.autoAdjustOverflow) {
      if (mainPlacementReverse) {
        mainPlacement = REVERSE_PLACEMENT_DICT[mainPlacement]
      }

      updateTranslateByMainPlacement(mainPlacement)

      const reverseMainPlacement = () => {
        mainPlacementReverse = !mainPlacementReverse
        mainPlacement = REVERSE_PLACEMENT_DICT[mainPlacement]
        updateTranslateByMainPlacement(mainPlacement)
      }

      switch (mainPlacement) {
        case 'top':
          if (translateY < 0) {
            reverseMainPlacement()
          }
          break
        case 'bottom':
          if (
            translateY > _contentSize.height &&
            translateY + _contentSize.height > window.innerHeight
          ) {
            reverseMainPlacement()
          }
          break
        case 'left':
          if (
            translateX > _contentSize.width &&
            translateX + _contentSize.width > window.innerWidth
          ) {
            reverseMainPlacement()
          }
          break
        case 'right':
          if (translateX < 0) {
            reverseMainPlacement()
          }
          break
      }

      let minorPlacement = getMinorPlacement(props.placement)

      if (minorPlacement) {
        if (minorPlacementReverse) {
          minorPlacement = REVERSE_PLACEMENT_DICT[minorPlacement]
        }

        updateTranslateByMinorPlacement(mergePlacement(mainPlacement, minorPlacement))

        const reverseMinorPlacement = () => {
          if (!minorPlacement) return
          minorPlacementReverse = !minorPlacementReverse
          minorPlacement = REVERSE_PLACEMENT_DICT[minorPlacement]
          updateTranslateByMinorPlacement(mergePlacement(mainPlacement, minorPlacement))
        }

        switch (minorPlacement) {
          case 'top':
            if (translateY < 0) {
              reverseMinorPlacement()
            }
            break
          case 'bottom':
            if (translateY + _contentSize.height > window.innerHeight) {
              reverseMinorPlacement()
            }
            break
          case 'left':
            if (translateX + _contentSize.width > window.innerWidth) {
              reverseMinorPlacement()
            }
            break
          case 'right':
            if (translateX < 0) {
              reverseMinorPlacement()
            }
            break
        }
      }

      setReversedMainPlacement(mainPlacement)
      setReversedMinorPlacement(minorPlacement)
    } else {
      updateTranslateByMainPlacement(mainPlacement)
    }

    setTranslateX(translateX)
    setTranslateY(translateY)

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
      _contentRef.style.setProperty('--inner-translate-y', '0px')
    } else if (props.placement === 'left' || props.placement === 'right') {
      let innerTranslateY = 0
      const maxInnerTranslateY = _contentSize.height / 2 - 20
      if (translateY < 0) {
        innerTranslateY = Math.min(-translateY, maxInnerTranslateY)
      }
      if (translateY + _contentSize.height > window.innerHeight) {
        innerTranslateY = Math.max(
          window.innerHeight - (translateY + _contentSize.height),
          -maxInnerTranslateY,
        )
      }
      _contentRef.style.setProperty('--inner-translate-x', '0px')
      _contentRef.style.setProperty('--inner-translate-y', `${innerTranslateY}px`)
    }
  })

  return (
    <>
      {resolvedChildren()}

      <Dynamic component={props.destroyOnClose ? Show : DelayShow} when={open()}>
        <Portal mount={props.getPopupContainer()}>
          {/* Portal 存在缺陷，onClick 依然会沿着 solid 的组件树向上传播，因此需要 stopPropagation */}
          <AntdElement
            class={cs(
              'z-1000 fixed left-0 top-0 [font-size:var(--ant-font-size)] text-[--ant-color-text] leading-[--ant-line-height]',
              open() ? 'block' : 'hidden',
            )}
            style={{
              transform: `translate(${_translateX()}px, ${_translateY()}px)`,
            }}
            onClick={e => {
              e.stopPropagation()
            }}
          >
            <div
              class="relative overflow-auto"
              style={{
                'max-width': typeof maxWidth() === 'number' ? `${maxWidth()}px` : undefined,
                'max-height': typeof maxHeight() === 'number' ? `${maxHeight()}px` : undefined,
              }}
            >
              <div
                {...props.contentHTMLAttributes}
                ref={setPopupRef}
                class={cs(
                  props.contentHTMLAttributes?.class,
                  'px-8px py-6px [box-shadow:var(--ant-box-shadow)] rounded-[var(--ant-border-radius-lg)] overflow-auto translate-x-[--inner-translate-x] translate-y-[--inner-translate-y]',
                  props.plain
                    ? 'text-[var(--ant-color-text)] bg-[var(--ant-color-bg-container-tertiary)]'
                    : 'text-[var(--ant-color-text-light-solid)] bg-[var(--ant-color-bg-spotlight)]',
                )}
              >
                <TooltipContext.Provider value={context}>
                  {unwrapContent(props.content, () => setOpen(false))}
                </TooltipContext.Provider>
              </div>
            </div>

            <Show when={props.arrow}>
              <div
                class={cs(
                  'w-8px h-8px absolute border-transparent [box-shadow:var(--ant-box-shadow)]',
                )}
                style={{
                  'clip-path': 'polygon(-100% -100%, 200% -100%, 200% 200%)',
                  'background-color': props.plain
                    ? 'var(--ant-color-bg-container-tertiary)'
                    : 'var(--ant-color-bg-spotlight)',
                  ...ARROW_STYLE_DICT[
                    mergePlacement(reversedMainPlacement(), reversedMinorPlacement())
                  ],
                }}
              />
            </Show>
          </AntdElement>
        </Portal>
      </Dynamic>
    </>
  )
}

export default Tooltip
