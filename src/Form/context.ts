import { type Setter, createContext, type Accessor } from 'solid-js'
import { type Schema } from 'yup'
import { type FormProps, type FormInstance } from './Form'

const FormContext = createContext<{
  formInstance?: FormInstance
  rulesDict?: Record<string, Schema[]>
  setErrMsgDict?: Record<string, Setter<string>>
  setItemWidthDict?: Setter<Record<string, number>>
  maxItemWidth?: Accessor<number | undefined>
  layout: Accessor<FormProps['layout']>
}>({
  layout: () => 'horizontal' as const,
})

export default FormContext
