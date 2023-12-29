import {
  type JSXElement,
  type Component,
  type JSX,
  Show,
  useContext,
  createSignal,
  onMount,
  onCleanup,
} from 'solid-js'
import { get, isNil } from 'lodash-es'
import { Dynamic } from 'solid-js/web'
import { nanoid } from 'nanoid'
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
  const { formInstance, rulesDict, setErrMsgDict, initialValues, setItemWidthDict, maxItemWidth } =
    useContext(Context)
  const [errMsg, setErrMsg] = createSignal('')
  const id = nanoid()

  onMount(() => {
    if (isNil(props.name)) return

    if (!isNil(props.initialValue)) {
      formInstance.setFieldValue(props.name, props.initialValue)
    }

    if (!isNil(props.rules)) {
      rulesDict[props.name] = props.rules
    }

    setErrMsgDict[props.name] = setErrMsg
  })

  let label: HTMLLabelElement
  onMount(() => {
    const resizeObserver = new ResizeObserver(entries => {
      const [entry] = entries
      // Firefox implements `borderBoxSize` as a single content rect, rather than an array
      const borderBoxSize: ResizeObserverSize = Array.isArray(entry.borderBoxSize)
        ? entry.borderBoxSize[0]
        : entry.borderBoxSize
      setItemWidthDict(dict => ({
        ...dict,
        [id]: borderBoxSize.inlineSize,
      }))
    })

    resizeObserver.observe(label)

    onCleanup(() => {
      setItemWidthDict(dict => {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete dict[id]
        return { ...dict }
      })
      resizeObserver.disconnect()
    })
  })

  const getLabel = (hidden?: boolean) => (
    <label
      class={cs(
        'ant-shrink-0 ant-h-32px ant-leading-32px not[:empty]:ant-pr-8px ant-text-right ant-[white-space:nowrap]',
        hidden && 'ant-absolute ant-opacity-0',
      )}
      {...(hidden
        ? {
          ref: el => {
            label = el
          },
        }
        : {
          style: { width: `${maxItemWidth() ?? 0}px` },
        })}
    >
      <Show when={!isNil(props.required)}>
        <span class="ant-mr-4px ant-text-[var(--ant-color-error)]">*</span>
      </Show>
      <Show when={!isNil(props.label)}>
        <label>{props.label}</label>
      </Show>
    </label>
  )

  return (
    <div class={cs(props.class, 'ant-flex ant-items-center ant-mb-16px')} style={props.style}>
      {/* 第一个 label 仅用于计算实际宽度 */}
      {getLabel(true)}
      {getLabel()}

      <div class="ant-w-full">
        <Dynamic
          component={props.component}
          defaultValue={props.initialValue ?? get(initialValues, props.name!)}
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
          <div class="ant-text-[var(--ant-color-error)]">{errMsg()}</div>
        </Show>
      </div>
    </div>
  )
}

export default FormItem
