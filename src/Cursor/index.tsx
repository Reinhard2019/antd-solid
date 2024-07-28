import { Show, type Component, type ParentProps, type JSX, createSignal } from 'solid-js'
import { Portal } from 'solid-js/web'
import cs from 'classnames'
import Element from '../Element'
import useHover from '../hooks/useHover'
import { type StyleProps } from '../types'

export interface CursorProps extends ParentProps, StyleProps {
  cursor: JSX.Element
}

const Cursor: Component<CursorProps> = props => {
  let ref: HTMLDivElement | undefined
  const hover = useHover(() => ref)
  const [cursorPosition, setCursorPosition] = createSignal({
    x: 0,
    y: 0,
  })

  return (
    <Element
      ref={ref}
      class={cs(
        props.class,
        'inline-block cursor-none [font-size:var(--ant-font-size)] text-[var(--ant-color-text)] leading-[var(--ant-line-height)]',
      )}
      style={props.style}
      onMouseMove={e => {
        setCursorPosition({
          x: e.pageX,
          y: e.pageY,
        })
      }}
    >
      {props.children}

      <Show when={hover()}>
        <Portal>
          <Element
            tag="span"
            class="absolute pointer-events-none [font-size:var(--ant-font-size)] text-[var(--ant-color-text)] leading-[var(--ant-line-height)]"
            style={{
              top: `${cursorPosition().y}px`,
              left: `${cursorPosition().x}px`,
            }}
          >
            {props.cursor}
          </Element>
        </Portal>
      </Show>
    </Element>
  )
}

export default Cursor
