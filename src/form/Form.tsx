import { type JSXElement, untrack, type Ref, mergeProps, type Setter } from 'solid-js'
import { get, set } from 'lodash-es'
import Context from './context'
import { type Schema } from 'yup'

export interface FormInstance<T extends {} = {}> {
  validateFields: () => Promise<T>
  setFieldValue: (name: Parameters<typeof set>[1], value: any) => void
}

export interface FormProps<T extends {} = {}> {
  ref?: Ref<FormInstance<T>>
  /**
   * 表单布局
   * 默认: horizontal
   */
  layout?: 'horizontal' | 'vertical' | 'inline'
  children: JSXElement
}

function Form<T extends {} = {}>(_props: FormProps<T>) {
  const props = mergeProps({ layout: 'horizontal' } as FormProps, _props)
  const rulesDict: Record<string, Schema[]> = {}
  const setErrMsgDict: Record<string, Setter<string>> = {}

  const values = {} as T
  const formInstance: FormInstance<T> = {
    async validateFields() {
      const promises = Object.entries(rulesDict).flatMap(([name, rules]) => {
        return rules.map(
          async rule =>
            await rule.validate(get(values, name)).catch(err => {
              setErrMsgDict[name](err.message)
              throw err
            }),
        )
      })
      const results = await Promise.allSettled(promises)
      if (results.some(result => result.status === 'rejected')) {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw {
          errorFields: results.filter(res => res.status === 'rejected'),
          values,
        }
      }
      return values
    },
    setFieldValue(name, value) {
      set(values, name, value)
    },
  }

  untrack(() => {
    if (typeof _props.ref === 'function') {
      _props.ref?.(formInstance)
    }
  })

  return (
    <form
      class="ant-[display:table] ant-w-full"
      onSubmit={e => {
        e.preventDefault()
      }}
    >
      <Context.Provider value={{ formInstance, rulesDict, setErrMsgDict }}>
        {props.children}
      </Context.Provider>
    </form>
  )
}

export default Form
