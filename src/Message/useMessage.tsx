import { createSignal, For } from 'solid-js'
import { Portal } from 'solid-js/web'
import { TransitionGroup } from 'solid-transition-group'
import Message, { type MessageProps } from './Message'
import Element from '../Element'

export interface MessageApi {
  open: (config: Omit<MessageProps, 'onClose'>) => () => void
}

function useMessage() {
  const [msgConfigList, setMsgConfigList] = createSignal<Array<Omit<MessageProps, 'onClose'>>>([])
  const messageApi: MessageApi = {
    open: config => {
      setMsgConfigList(prev => [...prev, config])

      const destroy = () => {
        setMsgConfigList(prev => prev.filter(item => item !== config))
      }

      return destroy
    },
  }

  const getContextHolder = () => (
    <Portal>
      <Element class="fixed top-16px left-1/2 z-2010 flex items-center flex-col gap-[--ant-margin-sm]">
        <TransitionGroup name="ant-message-fade" appear>
          <For each={msgConfigList()}>
            {config => (
              <Message
                {...config}
                onClose={() => {
                  setMsgConfigList(prev => prev.filter(item => item !== config))
                }}
              />
            )}
          </For>
        </TransitionGroup>
      </Element>
    </Portal>
  )

  return [messageApi, getContextHolder] as const
}

export default useMessage
