import { set } from 'lodash-es'
import {
  type JSXElement,
  type Component,
  type JSX,
  mergeProps,
  Show,
  Index,
  createMemo,
  untrack,
  type Ref,
} from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { toArray } from './utils/array'
import cs from 'classnames'

export interface FormInstance<T extends {} = {}> {
  validateFields: () => Promise<T>
}

export interface FormProps<T extends {} = {}> {
  ref?: Ref<FormInstance<T>>;
  /**
   * 表单布局
   * 默认: horizontal
   */
  layout?: 'horizontal' | 'vertical' | 'inline'
  // /**
  //  * 提交按钮
  //  * @deprecated
  //  */
  // submit?: (form: FormInstance<T>) => JSXElement
  children: JSXElement
}

export interface FormItemComponentProps<T = any> {
  defaultValue?: T
  onChange?: (value: T) => void
}

export interface FormItemProps {
  class?: string
  style?: JSX.CSSProperties
  required?: boolean
  label?: JSXElement
  name?: string
  initialValue?: any
  component: Component<FormItemComponentProps>
}

function Form<T extends {} = {}>(_props: FormProps<T>) {
  const props = mergeProps({ layout: 'horizontal' } as FormProps, _props)

  const resolvedChildren = createMemo(() => {
    return toArray(props.children) as unknown as FormItemProps[]
  })

  const values = untrack(() => Object.fromEntries(
    resolvedChildren().map(child => [child.name, child.initialValue]),
  ) as T)
  const formInstance: FormInstance<T> = {
    async validateFields() {
      return await Promise.resolve(values)
    },
  }
  untrack(() => {
    if (typeof _props.ref === 'function') {
      _props.ref?.(formInstance)
    }
  })

  return (
    <div>
      <Index each={resolvedChildren()}>
        {item => (
          <div class={cs('ant-flex ant-items-center ant-mb-16px', item().class)} style={item().style}>
            <span class="ant-flex-shrink-0 ant-mr-8px">
              <Show when={item().required}>
                <span class='ant-mr-4px ant-text-[var(--error-color)]'>*</span>
              </Show>
              <label>{item().label}</label>
            </span>

            <Dynamic
              component={item().component}
              defaultValue={item().initialValue}
              onChange={(value: any) => {
                set(values, item().name!, value)
              }}
            />
          </div>
        )}
      </Index>

      {/* {props.submit?.(formInstance as FormInstance<T>)} */}
    </div>
  )
}

Form.Item = (props: FormItemProps) => props as any

Form.createForm = () => {}

export default Form
