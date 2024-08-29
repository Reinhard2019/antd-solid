import { createSignal } from 'solid-js'
import { Portal } from 'solid-js/web'
import Message, { type MessageProps } from './Message'
import DelayShow from '../DelayShow'

function useMessage() {
  const [open, setOpen] = createSignal(false)
  const [config, setConfig] = createSignal<MessageProps>()
  const messageApi = {
    open: (_config: MessageProps) => {
      setConfig(_config)
      setOpen(true)
    },
  }

  const getContextHolder = () => (
    <DelayShow when={open() && !!config()}>
      <Portal>
        <Message {...config()!} onClose={() => setOpen(false)} />
      </Portal>
    </DelayShow>
  )

  return [messageApi, getContextHolder] as const
}

export default useMessage
