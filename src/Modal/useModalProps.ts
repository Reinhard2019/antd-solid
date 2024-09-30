import { useContext } from 'solid-js'
import ModalContext from './context'

function useModalProps<T = void>() {
  const { open, onOk, onCancel } = useContext(ModalContext)
  return {
    open,
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    onOk: onOk as (value: T | PromiseLike<T>) => Promise<unknown> | void,
    onCancel,
    getProps: () => {
      return {
        open: open(),
        onOk,
        onCancel,
      }
    },
  }
}

export default useModalProps
