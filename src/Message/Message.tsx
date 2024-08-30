import { type Component, type JSXElement, onMount } from 'solid-js'
import Element from '../Element'

export interface MessageProps {
  type: 'success' | 'error' | 'warning'
  content: JSXElement
  duration?: number
  onClose?: () => void
}

const Message: Component<MessageProps> = props => {
  onMount(() => {
    const duration = props.duration ?? 3
    if (duration > 0) {
      setTimeout(() => {
        props.onClose?.()
      }, duration * 1000)
    }
  })

  return (
    <Element
      class="[box-shadow:var(--ant-box-shadow)] p-[--ant-message-content-padding] rounded-[--ant-border-radius-lg] bg-[--ant-color-bg-elevated] flex gap-[--ant-margin-xs] items-center [font-size:var(--ant-font-size)] text-[--ant-color-text] leading-[--ant-line-height]"
      style={{
        '--ant-message-content-padding': '9px 12px',
      }}
    >
      {props.type === 'success' && (
        <span class="i-ant-design:check-circle-filled text-[--ant-color-success] text-18px" />
      )}
      {props.type === 'error' && (
        <span class="i-ant-design:close-circle-filled text-[--ant-color-error] text-18px" />
      )}
      {props.type === 'warning' && (
        <span class="i-ant-design:exclamation-circle-filled text-[--ant-color-warning] text-18px" />
      )}
      <div>{props.content}</div>
    </Element>
  )
}

export default Message
