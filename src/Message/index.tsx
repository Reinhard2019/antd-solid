import { type Component, onMount, type JSXElement, type ParentProps } from 'solid-js'
import { render } from 'solid-js/web'
import Element from '../Element'

interface MessageProps extends ParentProps {
  type: 'success' | 'error' | 'warning'
}

const Message: Component<MessageProps> = props => {
  let ref: HTMLDivElement | undefined

  onMount(() => {
    if (!ref) return

    window.requestAnimationFrame(() => {
      ref.style.opacity = '1'
      ref.style.transform = ''
    })
  })

  return (
    <Element
      ref={ref}
      class="fixed top-16px left-1/2 z-2010 [box-shadow:var(--ant-box-shadow)] p-[--ant-message-content-padding] rounded-[--ant-border-radius-lg] bg-[--ant-color-bg-container] flex gap-[--ant-margin-xs] items-center transition-property-[opacity_transform] transition-duration-500"
      style={{
        '--ant-message-content-padding': '9px 12px',
        opacity: 0,
        transform: 'translateY(-100%)',
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
      <div>{props.children}</div>
    </Element>
  )
}

/**
 * message 静态方法工厂
 * @param type 类型
 * @param content 提示内容
 * @param duration 自动关闭的延时，单位秒。设为 0 时不自动关闭
 */
const createStaticFactory = (type: 'success' | 'error' | 'warning') => {
  return (content: JSXElement, duration: number = 3) => {
    const div = document.createElement('div')
    document.body.appendChild(div)

    const dispose = render(() => <Message type={type}>{content}</Message>, div)

    if (duration > 0) {
      setTimeout(() => {
        dispose()
        document.body.removeChild(div)
      }, duration * 1000)
    }
  }
}

const success = createStaticFactory('success')
const error = createStaticFactory('error')
const warning = createStaticFactory('warning')

const message = {
  success,
  error,
  warning,
} as const

export default message
