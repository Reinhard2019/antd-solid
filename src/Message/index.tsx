import { createSignal, For, type Setter, type JSXElement } from 'solid-js'
import { render } from 'solid-js/web'
import { TransitionGroup } from 'solid-transition-group'
import { isEmpty } from 'lodash-es'
import Message, { type MessageProps } from './Message'
import useMessage from './useMessage'
import Element from '../Element'
import './index.scss'

let setMsgConfigList: Setter<Array<Omit<MessageProps, 'onClose'>>> | undefined

/**
 * message 静态方法工厂
 * @param type 类型
 * @param content 提示内容
 * @param duration 自动关闭的延时，单位秒。设为 0 时不自动关闭
 */
const createStaticFactory = (type: MessageProps['type']) => {
  return (content: JSXElement, duration?: number) => {
    const config: Omit<MessageProps, 'onClose'> = {
      type,
      content,
      duration,
    }

    if (setMsgConfigList) {
      setMsgConfigList(prev => [
        ...prev,
        {
          type,
          content,
          duration,
        },
      ])
      return
    }

    const div = document.createElement('div')
    document.body.appendChild(div)

    const dispose = render(() => {
      const [msgConfigList, _setMsgConfigList] = createSignal<Array<Omit<MessageProps, 'onClose'>>>(
        [config],
      )

      setMsgConfigList = _setMsgConfigList

      return (
        <Element class="fixed top-16px left-0 right-0 z-2010 flex items-center flex-col gap-[--ant-margin-sm]">
          <TransitionGroup
            name="ant-message-fade"
            appear
            onAfterExit={() => {
              if (isEmpty(msgConfigList())) {
                setMsgConfigList = undefined
                dispose()
                document.body.removeChild(div)
              }
            }}
          >
            <For each={msgConfigList()}>
              {_config => (
                <Message
                  {..._config}
                  onClose={() => {
                    _setMsgConfigList(prev => prev.filter(item => item !== _config))
                  }}
                />
              )}
            </For>
          </TransitionGroup>
        </Element>
      )
    }, div)
  }
}

const info = createStaticFactory('info')
const success = createStaticFactory('success')
const error = createStaticFactory('error')
const warning = createStaticFactory('warning')

const message = {
  info,
  success,
  error,
  warning,
  useMessage,
} as const

export type { MessageApi } from './useMessage'

export default message
