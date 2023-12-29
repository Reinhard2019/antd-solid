import InternalForm from './Form'
import FormItem from './FormItem'

export type { FormInstance, FormProps } from './Form'
export type { FormItemProps, FormItemComponentProps } from './FormItem'

const Form = InternalForm as typeof InternalForm & {
  Item: typeof FormItem
}

Form.Item = FormItem

export default Form
