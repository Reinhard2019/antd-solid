import {
  type JSXElement,
  type JSX,
  Show,
  useContext,
  createSignal,
  onCleanup,
  createEffect,
  createMemo,
  on,
  type Component,
} from 'solid-js'
import { isNil } from 'lodash-es'
import { nanoid } from 'nanoid'
import cs from 'classnames'
import { type Schema } from 'yup'
import Context from './context'
import { type FormInstance } from './Form'
import { Dynamic } from 'solid-js/web'

export interface FormItemComponentProps<T = any, F extends {} = {}> {
  value?: T | undefined
  status?: 'error' | 'warning'
  onChange: (value: T) => void
  formInstance: FormInstance<F>
}

export interface FormItemProps<T extends {} = {}> {
  class?: string
  style?: JSX.CSSProperties
  required?: boolean
  label?: JSXElement
  name?: string
  initialValue?: any
  rules?: Schema[]
  when?: boolean | ((formInstance: FormInstance<T>) => boolean)
  /**
   * 是否隐藏
   * 和 when 的区别，只是不会显示，但值依然会存在
   */
  hidden?: boolean
  component?: Component<FormItemComponentProps>
}

const FormItem = <T extends {} = {}>(props: FormItemProps<T>) => {
  const { formInstance, rulesDict, setErrMsgDict, setItemWidthDict, maxItemWidth } =
    useContext(Context)
  const [errMsg, setErrMsg] = createSignal('')
  const id = nanoid()
  const when = createMemo(() => {
    if (typeof props.when === 'function') return props.when(formInstance as FormInstance<T>)
    return props.when ?? true
  })

  createEffect(
    on(when, input => {
      if (isNil(props.name) || !input) return

      if (!isNil(props.initialValue)) {
        formInstance.setFieldValue(props.name, props.initialValue)
      }

      if (!isNil(props.rules)) {
        rulesDict[props.name] = props.rules
        setErrMsgDict[props.name] = setErrMsg
      }

      onCleanup(() => {
        formInstance.removeFieldValue(props.name!)
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete rulesDict[props.name!]
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete setErrMsgDict[props.name!]
      })
    }),
  )

  let label: HTMLLabelElement | undefined
  createEffect(
    on(
      () => when() && !props.hidden,
      input => {
        if (!input) return

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

        resizeObserver.observe(label!)

        onCleanup(() => {
          setItemWidthDict(dict => {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete dict[id]
            return { ...dict }
          })
          resizeObserver.disconnect()
        })
      },
    ),
  )

  return (
    <Show when={when() && !props.hidden}>
      <div class={cs(props.class, 'flex items-center mb-16px')} style={props.style}>
        <div class="relative flex items-center" style={{ width: `${maxItemWidth() ?? 0}px` }}>
          <label
            ref={label}
            class={cs(
              'absolute shrink-0 h-32px leading-32px not[:empty]:pr-8px text-right [white-space:nowrap]',
            )}
          >
            <Show when={!isNil(props.label)}>
              <label class="mr-4px">{props.label}</label>
            </Show>
            <Show when={!isNil(props.required)}>
              <span class="text-[var(--ant-color-error)]">*</span>
            </Show>
          </label>
        </div>

        <div class="flex flex-col" style={{ width: `calc(100% - ${maxItemWidth() ?? 0}px)` }}>
          <Dynamic
            component={props.component}
            value={props.name ? formInstance.getFieldValue(props.name) : undefined}
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
            formInstance={formInstance}
          />

          <Show when={errMsg()}>
            <div class="text-[var(--ant-color-error)]">{errMsg()}</div>
          </Show>
        </div>
      </div>
    </Show>
  )
}

export default FormItem
