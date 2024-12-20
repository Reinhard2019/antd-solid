import {
  type JSX,
  type JSXElement,
  type Ref,
  mergeProps,
  type Setter,
  createSignal,
  createMemo,
  untrack,
} from 'solid-js'
import { createStore, produce } from 'solid-js/store'
import { cloneDeep, get, max, set, unset } from 'lodash-es'
import { type Schema } from 'yup'
import cs from 'classnames'
import FormContext from './context'
import { setRef } from '../utils/solid'
import Element from '../Element'
import { type StyleProps } from '../types'

export interface FormInstance<T extends {} = {}> {
  validateFields: () => Promise<T>
  getFieldValue: (name: Parameters<typeof get>[1]) => any
  setFieldValue: (name: Parameters<typeof set>[1], value: any) => void
  removeFieldValue: (name: Parameters<typeof set>[1]) => void
}

export interface FormProps<T extends {} = {}> extends StyleProps {
  ref?: Ref<FormInstance<T>>
  /**
   * 表单布局
   * 默认: horizontal
   */
  layout?: 'horizontal' | 'vertical' | 'inline'
  children: JSXElement
  initialValues?: Partial<T>
}

function Form<T extends {} = {}>(_props: FormProps<T>) {
  const props = mergeProps({ layout: 'horizontal' } as FormProps, _props)
  const rulesDict: Record<string, Schema[]> = {}
  /**
   * 用于设置错误消息方法的字典
   */
  const setErrMsgDict: Record<string, Setter<string>> = {}

  const [values, setValues] = createStore(
    untrack(() => (props.initialValues ? cloneDeep(props.initialValues) : ({} as T))),
  )
  const formInstance: FormInstance<T> = {
    async validateFields() {
      const cloneValues = untrack(() => cloneDeep(values))
      const promises = Object.entries(rulesDict).flatMap(([name, rules]) => {
        return rules.map(
          async rule =>
            await rule.validate(get(cloneValues, name)).catch(err => {
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
          values: cloneValues,
        }
      }
      return cloneValues as T
    },
    getFieldValue(name) {
      return get(values, name)
    },
    setFieldValue(name, value) {
      setValues(
        produce(s => {
          set(s, name, value)
        }),
      )
    },
    removeFieldValue(name) {
      setValues(
        produce(s => {
          unset(s, name)
        }),
      )
    },
  }

  setRef(_props, formInstance)

  // 存储 form item 的 dom 节点宽度
  const [itemWidthDict, setItemWidthDict] = createSignal<Record<string, number>>({})
  const maxItemWidth = createMemo(() => max(Object.values(itemWidthDict())))

  return (
    <Element<JSX.FormHTMLAttributes<HTMLFormElement>>
      tag="form"
      class={cs(
        props.class,
        '[font-size:var(--ant-font-size)] text-[var(--ant-color-text)] leading-[var(--ant-line-height)]',
        props.layout === 'inline' ? 'inline-flex flex-wrap' : '',
      )}
      style={props.style}
      onSubmit={e => {
        e.preventDefault()
      }}
    >
      <FormContext.Provider
        value={{
          formInstance,
          rulesDict,
          setErrMsgDict,
          setItemWidthDict,
          maxItemWidth,
          layout: () => props.layout,
        }}
      >
        {props.children}
      </FormContext.Provider>
    </Element>
  )
}

export default Form
