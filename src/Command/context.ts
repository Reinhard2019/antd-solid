import { type Accessor, createContext } from 'solid-js'

const CommandContext = createContext({
  open: (() => false) as Accessor<boolean>,
  onOk: (() => {}) as (value: any) => void,
  onCancel: () => {},
  dispose: () => {},
  onAutoDispose: () => {},
})

export default CommandContext
