import {
  Show,
  type Component,
  type ParentProps,
  type JSX,
  createSignal,
  children,
  createEffect,
  onCleanup,
  type Ref,
} from 'solid-js'
import { Portal, render } from 'solid-js/web'
import { setRef } from '../utils/solid'

export interface CursorIntance {
  onMouseEnter: (e: MouseEvent, ele: HTMLElement | SVGElement) => void
  onMouseMove: (e: MouseEvent) => void
  onMouseLeave: (e: MouseEvent, ele: HTMLElement | SVGElement) => void
}

export interface CursorProps extends ParentProps {
  ref?: Ref<CursorIntance>
  cursor: JSX.Element
  disabled?: boolean
}

function createCursor(props: CursorProps) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const _dispose = render(() => <Cursor {...props} />, container)
  const dispose = () => {
    _dispose()
    document.body.removeChild(container)
  }
  return {
    dispose,
  }
}

const Cursor: Component<CursorProps> & {
  createCursor: typeof createCursor
} = props => {
  const resolvedChildren = children(() => props.children)

  const [hover, setHover] = createSignal(false)
  const [cursorPosition, setCursorPosition] = createSignal({
    x: 0,
    y: 0,
  })

  let originalCursor: string | undefined

  const onMouseEnter = (_: MouseEvent, _children: HTMLElement | SVGElement) => {
    setHover(true)

    originalCursor = _children.style.cursor
    _children.style.cursor = 'none'
  }

  const onMouseMove = (e: MouseEvent) => {
    setHover(true)

    setCursorPosition({
      x: e.clientX,
      y: e.clientY,
    })
  }

  const onLeave = (_children: HTMLElement | SVGElement) => {
    setHover(false)

    if (originalCursor) {
      _children.style.cursor = originalCursor
    } else {
      _children.style.removeProperty('cursor')
    }
    originalCursor = undefined
  }

  const onMouseLeave = (_: MouseEvent, _children: HTMLElement | SVGElement) => {
    onLeave(_children)
  }

  setRef(props, {
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
  })

  createEffect(() => {
    if (props.disabled) return

    const _children = resolvedChildren()
    if (!(_children instanceof HTMLElement || _children instanceof SVGElement)) return

    const abortController = new AbortController()

    // 注意：不能设置 capture 为 true，否则鼠标移入子元素时，子元素也会触发 mouseenter 事件
    _children.addEventListener(
      'mouseenter',
      (e: MouseEvent) => {
        onMouseEnter(e, _children)
      },
      {
        signal: abortController.signal,
      },
    )

    _children.addEventListener('mousemove', onMouseMove, {
      signal: abortController.signal,
    })

    _children.addEventListener(
      'mouseleave',
      (e: MouseEvent) => {
        onMouseLeave(e, _children)
      },
      {
        signal: abortController.signal,
      },
    )

    onCleanup(() => {
      abortController.abort()
      onLeave(_children)
    })
  })

  return (
    <>
      {resolvedChildren}

      <Show when={hover()}>
        <Portal>
          <span
            class="absolute pointer-events-none z-2000"
            style={{
              top: `${cursorPosition().y}px`,
              left: `${cursorPosition().x}px`,
            }}
          >
            {props.cursor}
          </span>
        </Portal>
      </Show>
    </>
  )
}

Cursor.createCursor = createCursor

export default Cursor
