import { type JSXElement } from 'solid-js'
import { render } from 'solid-js/web'
import Message from './Message'
import useMessage from './useMessage'
import Element from '../Element'
import './index.scss'

/**
 * message 静态方法工厂
 * @param type 类型
 * @param content 提示内容
 * @param duration 自动关闭的延时，单位秒。设为 0 时不自动关闭
 */
const createStaticFactory = (type: 'success' | 'error' | 'warning') => {
  return (content: JSXElement, duration?: number) => {
    const div = document.createElement('div')
    document.body.appendChild(div)

    const dispose = render(
      () => (
        <Element class="fixed top-16px left-0 right-0 z-2010 flex items-center flex-col gap-[--ant-margin-sm]">
          <Message
            type={type}
            content={content}
            duration={duration}
            onClose={() => {
              dispose()
              document.body.removeChild(div)
            }}
          />
        </Element>
      ),
      div,
    )
  }
}

const success = createStaticFactory('success')
const error = createStaticFactory('error')
const warning = createStaticFactory('warning')

const message = {
  success,
  error,
  warning,
  useMessage,
} as const

export default message
