import {
  type JSXElement,
  type Component,
  type JSX,
  Show,
  useContext,
  untrack,
  createSignal,
} from 'solid-js'
import { isNil } from 'lodash-es'
import { Dynamic } from 'solid-js/web'
import cs from 'classnames'
import { type Schema } from 'yup'
import Context from './context'

export interface FormItemComponentProps<T = any> {
  defaultValue?: T
  status?: 'error' | 'warning'
  onChange?: (value: T) => void
}

export interface FormItemProps {
  class?: string
  style?: JSX.CSSProperties
  required?: boolean
  label?: JSXElement
  name?: string
  initialValue?: any
  rules?: Schema[]
  component: Component<FormItemComponentProps>
}

const FormItem: Component<FormItemProps> = props => {
  const { formInstance, rulesDict, setErrMsgDict } = useContext(Context)
  const [errMsg, setErrMsg] = createSignal('')

  untrack(() => {
    if (isNil(props.name)) return

    if (!isNil(props.initialValue)) {
      formInstance.setFieldValue(props.name, props.initialValue)
    }

    if (!isNil(props.rules)) {
      rulesDict[props.name] = props.rules
    }

    setErrMsgDict[props.name] = setErrMsg
  })

  return (
    <div class={cs('ant-[display:table-row]', props.class)} style={props.style}>
      <span class="ant-[display:table-cell] ant-h-32px ant-leading-32px ant-pb-16px ant-pr-8px ant-text-right">
        <Show when={props.required}>
          <span class="ant-mr-4px ant-text-[var(--error-color)]">*</span>
        </Show>
        <label>{props.label}</label>
      </span>

      <div class="ant-[display:table-cell] ant-w-full ant-pb-16px">
        <Dynamic
          component={props.component}
          defaultValue={props.initialValue}
          status={errMsg() ? 'error' : undefined}
          onChange={(value: any) => {
            if (!isNil(props.name)) formInstance.setFieldValue(props.name, value)

            props.rules?.forEach(rule => {
              rule
                .validate(value)
                .then(() => {
                  setErrMsg('')
                })
                .catch(err => {
                  setErrMsg(err.message)
                })
            })
          }}
        />

        <Show when={errMsg()}>
          <div class="ant-text-[var(--error-color)]">{errMsg()}</div>
        </Show>
      </div>
    </div>
  )
}

export default FormItem
