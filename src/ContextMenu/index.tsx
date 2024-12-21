import { createEffect, createSignal, getOwner, onCleanup, runWithOwner } from 'solid-js'
import Command from '../Command'
import { inRange } from '../utils/number'
import Menu, { type MenuProps } from '../Menu'
import Element from '../Element'

interface Props {
  x: number
  y: number
  items: MenuProps['items']
}

const offsetY = 4

const ContextMenuCommand = Command.createCommand<Props>(props => {
  let ref: HTMLDivElement | undefined

  const [reverse, setReverse] = createSignal(false)
  createEffect(() => {
    setReverse(props.y + (ref?.clientHeight ?? 0) + offsetY > window.innerHeight)
  })

  const { dispose } = Command.useCommandProps()

  const abortController = new AbortController()

  window.addEventListener(
    'click',
    e => {
      if (e.target instanceof Node && ref?.contains(e.target)) return

      dispose()
    },
    {
      capture: true,
      signal: abortController.signal,
    },
  )

  window.addEventListener(
    'keyup',
    e => {
      if (e.key === 'Escape') {
        dispose()
      }
    },
    {
      signal: abortController.signal,
    },
  )

  onCleanup(() => {
    abortController.abort()
  })

  return (
    <Element
      ref={ref}
      class="z-1000 fixed left-0 top-0 [font-size:var(--ant-font-size)] text-[var(--ant-color-text)] leading-[var(--ant-line-height)] bg-[--ant-color-bg-container-tertiary] rounded-[var(--ant-border-radius)]"
      style={{
        top: `${props.y}px`,
        left: `${props.x}px`,
        transform: reverse()
          ? `translateY(calc(-100% - ${offsetY}px))`
          : `translateY(${offsetY}px)`,
      }}
    >
      <Menu
        items={props.items}
        selectable={false}
        onClick={dispose}
        style={{
          '--ant-menu-item-height': '32px',
        }}
      />
    </Element>
  )
})

let prevPosition: { x: number; y: number } | undefined
// 用于范围检测
const padding = 2

interface TriggerOptions {
  items: MenuProps['items']
}

const trigger = (event: MouseEvent, { items }: TriggerOptions) => {
  event.preventDefault()
  event.stopPropagation()

  if (
    !items?.length ||
    (ContextMenuCommand.isOpen() &&
      inRange(prevPosition?.x ?? 0, event.clientX - padding, event.clientX + padding, '[]') &&
      inRange(prevPosition?.y ?? 0, event.clientY - padding, event.clientY + padding, '[]'))
  ) {
    ContextMenuCommand.dispose()
    return
  }

  prevPosition = {
    x: event.clientX,
    y: event.clientY,
  }
  ContextMenuCommand.show({
    ...prevPosition,
    items,
  })
}

const useContextMenu = () => {
  const owner = getOwner()

  return {
    trigger: (event: MouseEvent, options: TriggerOptions) => {
      runWithOwner(owner, () => {
        trigger(event, options)
      })
    },
  }
}

export default {
  trigger,
  useContextMenu,
}
