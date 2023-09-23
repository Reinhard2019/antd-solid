import { type Setter, createContext } from 'solid-js'
import { type FormInstance } from './Form'
import { type Schema } from 'yup'

const Context = createContext(
  {} as {
    formInstance: FormInstance
    rulesDict: Record<string, Schema[]>
    setErrMsgDict: Record<string, Setter<string>>
    initialValues: {}
  },
)

export default Context
