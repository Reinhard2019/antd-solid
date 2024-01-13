import { type Setter, createContext, type Accessor } from 'solid-js'
import { type FormInstance } from './Form'
import { type Schema } from 'yup'

const Context = createContext(
  {} as {
    formInstance: FormInstance
    rulesDict: Record<string, Schema[]>
    setErrMsgDict: Record<string, Setter<string>>
    setItemWidthDict: Setter<Record<string, number>>
    maxItemWidth: Accessor<number | undefined>
  },
)

export default Context
