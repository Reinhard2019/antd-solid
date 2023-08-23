import { compact } from 'lodash-es'
import {
  type Component,
  type JSXElement,
  children,
  createEffect,
  Show,
  mergeProps,
  onCleanup,
  createMemo,
} from 'solid-js'
import { Portal } from 'solid-js/web'
import cs from 'classnames'
import createControllableValue from './hooks/createControllableValue'
import { useClickAway } from './hooks'

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
  trigger?: ActionType
  /**
   * 默认: top
   */
  placement?: TooltipPlacement
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
    } as TooltipProps,
    _props,
  )

  const resolvedChildren = children(() => _props.children)
  let contentWrap: HTMLDivElement
  let arrow: HTMLDivElement
  const [open, setOpen] = createControllableValue(_props, {
    defaultValue: false,
    valuePropName: 'open',
    trigger: 'onOpenChange',
  })
  const reverseOpen = () => setOpen(v => !v)

  createEffect(() => {
    const _children = resolvedChildren() as Element
    switch (props.trigger) {
      case 'hover':
        _children.addEventListener('mouseenter', reverseOpen)
        onCleanup(() => {
          _children.removeEventListener('mouseenter', reverseOpen)
        })

        _children.addEventListener('mouseleave', reverseOpen)
        onCleanup(() => {
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
          () => compact([contentWrap, _children]),
        )
        break
    }
  })

  createEffect(() => {
    if (open()) {
      const _children = resolvedChildren() as Element
      const childrenRect = _children.getBoundingClientRect()
      const pointAtCenter = typeof props.arrow === 'object' ? props.arrow.pointAtCenter : false
      const arrowOffset = 8

      switch (props.placement) {
        case 'top':
          contentWrap.style.top = `${childrenRect.top}px`
          contentWrap.style.left = `${childrenRect.left + childrenRect.width / 2}px`
          contentWrap.style.transform = 'translate(-50%, -100%)'
          break
        case 'topRight':
          contentWrap.style.top = `${childrenRect.top}px`
          contentWrap.style.left = `${childrenRect.right}px`
          contentWrap.style.transform = 'translate(-100%, -100%)'
          if (arrow) arrow.style.right = `${arrowOffset}px`
          break
        case 'bottom':
          contentWrap.style.top = `${childrenRect.top + childrenRect.height}px`
          contentWrap.style.left = `${childrenRect.left + childrenRect.width / 2}px`
          contentWrap.style.transform = 'translate(-50%, 0)'
          break
        case 'bottomLeft':
          contentWrap.style.top = `${childrenRect.top + childrenRect.height}px`
          contentWrap.style.left = `${childrenRect.left}px`
          if (arrow) arrow.style.left = `${arrowOffset}px`
          break
        case 'bottomRight':
          contentWrap.style.top = `${childrenRect.top + childrenRect.height}px`
          contentWrap.style.left = `${childrenRect.right + (pointAtCenter ? arrowOffset : 0)}px`
          contentWrap.style.transform = 'translate(-100%, 0)'
          if (arrow) arrow.style.right = `${arrowOffset}px`
          break
      }
    }
  })

  const direction = createMemo(() => {
    if (props.placement?.startsWith('top')) return 'top'
    if (props.placement?.startsWith('bottom')) return 'bottom'
    if (props.placement?.startsWith('left')) return 'left'
    if (props.placement?.startsWith('right')) return 'right'
  })

  return (
    <>
      {resolvedChildren}

      <Show when={open()}>
        <Portal>
          {/* Portal 存在缺陷，onClick 依然会沿着 solid 的组件树向上传播，因此需要 stopPropagation */}
          <div
            ref={contentWrap!}
            class={cs(
              'ant-z-1000 ant-fixed after:ant-content-empty',
              props.arrow ? '[--padding:8px]' : '[--padding:4px]',
              direction() === 'top' && 'ant-pb-[var(--padding)]',
              direction() === 'bottom' && 'ant-pt-[var(--padding)]',
            )}
            onClick={e => {
              e.stopPropagation()
            }}
          >
            <div
              class={cs(
                'ant-p-12px ant-rounded-8px ant-[box-shadow:0_6px_16px_0_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)]',
                props.mode === 'dark' ? 'ant-bg-[rgba(0,0,0,0.85)] ant-text-white' : 'ant-bg-white',
              )}
            >
              <Content content={props.content} close={() => setOpen(false)} />
            </div>
            <Show when={props.arrow}>
              <div
                ref={arrow!}
                class={cs(
                  'ant-w-8px ant-h-8px ant-rotate-45 ant-absolute',
                  props.mode === 'dark' ? 'ant-bg-[rgba(0,0,0,0.85)]' : 'ant-bg-white',
                  direction() === 'top' &&
                    'ant-bottom-0 -ant-translate-x-1/2 -ant-translate-y-1/2 ant-[filter:drop-shadow(3px_2px_2px_rgba(0,0,0,0.08))]',
                  direction() === 'bottom' &&
                    'ant-top-0 -ant-translate-x-1/2 ant-translate-y-1/2 ant-[filter:drop-shadow(-3px_-2px_2px_rgba(0,0,0,0.08))]',
                  (props.placement === 'top' || props.placement === 'bottom') && 'left-1/2',
                )}
              />
            </Show>
          </div>
        </Portal>
      </Show>
    </>
  )
}

export default Tooltip
