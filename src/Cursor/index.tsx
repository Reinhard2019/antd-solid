import {
  Show,
  type Component,
  type ParentProps,
  type JSX,
  createSignal,
  children,
  createEffect,
  onCleanup,
} from 'solid-js'
import { Portal } from 'solid-js/web'

export interface CursorProps extends ParentProps {
  cursor: JSX.Element
}

const Cursor: Component<CursorProps> = props => {
  const resolvedChildren = children(() => props.children)

  const [hover, setHover] = createSignal(false)
  const [cursorPosition, setCursorPosition] = createSignal({
    x: 0,
    y: 0,
  })

  let originalCursor: string | undefined

  createEffect(() => {
    const _children = resolvedChildren()
    if (!(_children instanceof HTMLElement || _children instanceof SVGElement)) return

    const abortController = new AbortController()

    _children.addEventListener(
      'mouseenter',
      () => {
        setHover(true)

        originalCursor = _children.style.cursor
        _children.style.cursor = 'none'
      },
      {
        signal: abortController.signal,
      },
    )

    _children.addEventListener(
      'mousemove',
      (e: MouseEvent) => {
        setCursorPosition({
          x: e.clientX,
          y: e.clientY,
        })
      },
      {
        signal: abortController.signal,
      },
    )

    _children.addEventListener(
      'mouseleave',
      () => {
        setHover(false)

        if (originalCursor) _children.style.cursor = originalCursor
      },
      {
        signal: abortController.signal,
      },
    )

    onCleanup(() => {
      abortController.abort()
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

export default Cursor
