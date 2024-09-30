import { type Accessor, createContext } from 'solid-js'

const ModalContext = createContext({
  open: (() => false) as Accessor<boolean>,
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  onOk: (() => {}) as (value: void | PromiseLike<void>) => Promise<unknown> | void,
  onCancel: () => {},
})

export default ModalContext
