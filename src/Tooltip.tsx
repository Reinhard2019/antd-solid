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
  createSignal,
} from 'solid-js'
import { Portal } from 'solid-js/web'
import cs from 'classnames'
import createControllableValue from './hooks/createControllableValue'
import { useClickAway } from './hooks'
import { toArray } from './utils/array'

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
  let content: HTMLDivElement
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
          _children.addEventListener('focus', reverseOpen)
          _children.addEventListener('blur', reverseOpen)
          onCleanup(() => {
            _children.removeEventListener('focus', reverseOpen)
            _children.removeEventListener('blur', reverseOpen)
          })
          break
      }
    })
  })

  const [childrenRect, setChildrenRect] = createSignal(new DOMRect())
  createEffect(() => {
    if (open()) {
      const _children = resolvedChildren() as Element
      setChildrenRect(_children.getBoundingClientRect())
    }
  })

  const arrowOffset = createMemo(() => (props.arrow ? 8 : 0))
  const contentPositionStyle = createMemo(() => {
    switch (props.placement) {
      case 'top':
        return {
          top: `${childrenRect().top - arrowOffset()}px`,
          left: `${childrenRect().left + childrenRect().width / 2}px`,
          transform: 'translate(-50%, -100%)',
        } as JSX.CSSProperties
      case 'topLeft':
        return {
          top: `${childrenRect().top - arrowOffset()}px`,
          left: `${childrenRect().left}px`,
          transform: 'translate(0, -100%)',
        } as JSX.CSSProperties
      case 'topRight':
        return {
          top: `${childrenRect().top - arrowOffset()}px`,
          left: `${childrenRect().right}px`,
          transform: 'translate(-100%, -100%)',
        } as JSX.CSSProperties
      case 'bottom':
        return {
          top: `${childrenRect().bottom + arrowOffset()}px`,
          left: `${childrenRect().left + childrenRect().width / 2}px`,
          transform: 'translate(-50%, 0)',
        } as JSX.CSSProperties
      case 'bottomLeft':
        return {
          top: `${childrenRect().bottom + arrowOffset()}px`,
          left: `${childrenRect().left}px`,
        } as JSX.CSSProperties
      case 'bottomRight':
        return {
          top: `${childrenRect().bottom + arrowOffset()}px`,
          left: `${childrenRect().right}px`,
          transform: 'translate(-100%, 0)',
        } as JSX.CSSProperties
      case 'left':
        return {
          top: `${childrenRect().top + childrenRect().height / 2}px`,
          left: `${childrenRect().left - arrowOffset()}px`,
          transform: 'translate(-100%, -50%)',
        } as JSX.CSSProperties
      case 'leftTop':
        return {
          top: `${childrenRect().top}px`,
          left: `${childrenRect().left - arrowOffset()}px`,
          transform: 'translate(-100%)',
        } as JSX.CSSProperties
      case 'leftBottom':
        return {
          top: `${childrenRect().bottom}px`,
          left: `${childrenRect().left - arrowOffset()}px`,
          transform: 'translate(-100%, -100%)',
        } as JSX.CSSProperties
      case 'right':
        return {
          top: `${childrenRect().top + childrenRect().height / 2}px`,
          left: `${childrenRect().right + arrowOffset()}px`,
          transform: 'translate(0, -50%)',
        } as JSX.CSSProperties
      case 'rightTop':
        return {
          top: `${childrenRect().top}px`,
          left: `${childrenRect().right + arrowOffset()}px`,
        } as JSX.CSSProperties
      case 'rightBottom':
        return {
          top: `${childrenRect().bottom}px`,
          left: `${childrenRect().right + arrowOffset()}px`,
          transform: 'translate(0, -100%)',
        } as JSX.CSSProperties
    }
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

      <Show when={open()}>
        <Portal>
          {/* Portal 存在缺陷，onClick 依然会沿着 solid 的组件树向上传播，因此需要 stopPropagation */}
          <div
            ref={content!}
            class={cs(
              'z-1000 fixed absolute px-8px py-6px rounded-8px box-content [box-shadow:0_6px_16px_0_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)]',
              props.mode === 'dark' ? 'bg-[rgba(0,0,0,0.85)] text-white' : 'bg-white',
            )}
            style={{
              ...contentPositionStyle(),
              ...props.contentStyle,
            }}
            onClick={e => {
              e.stopPropagation()
            }}
          >
            <Content content={props.content} close={() => setOpen(false)} />

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
      </Show>
    </>
  )
}

export default Tooltip
