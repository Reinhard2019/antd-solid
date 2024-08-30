import { createSignal, For, Show } from 'solid-js'
import { Portal } from 'solid-js/web'
import { isEmpty } from 'lodash-es'
import { TransitionGroup } from 'solid-transition-group'
import Message, { type MessageProps } from './Message'
import Element from '../Element'

function useMessage() {
  const [msgConfigList, setMsgConfigList] = createSignal<Array<Omit<MessageProps, 'onClose'>>>([])
  const messageApi = {
    open: (config: Omit<MessageProps, 'onClose'>) => {
      setMsgConfigList(prev => [...prev, config])
    },
  }

  const getContextHolder = () => (
    <Show when={!isEmpty(msgConfigList())}>
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
    </Show>
  )

  return [messageApi, getContextHolder] as const
}

export default useMessage
