import { useContext } from 'solid-js'
import CommandContext from './context'

function useCommandProps<T = void>() {
  const { open, onOk, onCancel, dispose, onAutoDispose } = useContext(CommandContext)
  return {
    open,
    onOk: onOk as (value: T) => void,
    onCancel,
    dispose,
    onAutoDispose,
    getProps: () => {
      return {
        open: open(),
        onOk: onOk as () => void,
        onCancel,
      }
    },
  }
}

export default useCommandProps
