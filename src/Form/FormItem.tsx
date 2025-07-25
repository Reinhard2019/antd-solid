import {
  type JSXElement,
  type JSX,
  Show,
  useContext,
  createSignal,
  onCleanup,
  createEffect,
  on,
  type Component,
} from 'solid-js'
import { isNil, set, unset } from 'lodash-es'
import { nanoid } from 'nanoid'
import cs from 'classnames'
import { type Schema } from 'yup'
import { Dynamic } from 'solid-js/web'
import FormContext from './context'
import Element from '../Element'

export interface FormItemComponentProps<T = any> {
  value?: T | undefined
  status?: 'error' | 'warning'
  onChange: (value: T) => void
}

export interface FormItemProps {
  class?: string
  style?: JSX.CSSProperties
  required?: boolean
  label?: JSXElement
  name?: string
  initialValue?: any
  rules?: Schema[]
  /**
   * 是否隐藏
   * 和 when 的区别，只是不会显示，但值依然会存在
   */
  hidden?: boolean
  component?: Component<FormItemComponentProps>
}

const FormItem = (props: FormItemProps) => {
  const { formInstance, rulesDict, setErrMsgDict, setItemWidthDict, maxItemWidth, layout } =
    useContext(FormContext)
  const [errMsg, setErrMsg] = createSignal('')
  const id = nanoid()

  createEffect(() => {
    if (props.name && props.rules && rulesDict && setErrMsgDict) {
      set(rulesDict, props.name, props.rules)
      set(setErrMsgDict, props.name, setErrMsg)

      onCleanup(() => {
        unset(rulesDict, props.name!)
        unset(setErrMsgDict, props.name!)
      })
    }
  })

  let label: HTMLLabelElement | undefined
  createEffect(
    on(
      () => !props.hidden && layout() === 'horizontal',
      input => {
        if (!input) return

        const resizeObserver = new ResizeObserver(entries => {
          const [entry] = entries
          // Firefox implements `borderBoxSize` as a single content rect, rather than an array
          const borderBoxSize: ResizeObserverSize = Array.isArray(entry.borderBoxSize)
            ? entry.borderBoxSize[0]
            : entry.borderBoxSize
          setItemWidthDict?.(dict => ({
            ...dict,
            [id]: borderBoxSize.inlineSize,
          }))
        })

        resizeObserver.observe(label!)

        onCleanup(() => {
          setItemWidthDict?.(dict => {
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
    <Show when={!props.hidden}>
      <Element
        class={cs(
          props.class,
          'mb-[--ant-margin-lg]',
          layout() === 'horizontal' && 'flex items-center',
          layout() === 'inline' && 'inline-flex mr-[--ant-margin-lg]',
        )}
        style={props.style}
      >
        <div
          class="flex items-center"
          style={{
            width:
              layout() === 'horizontal' && maxItemWidth ? `${maxItemWidth() ?? 0}px` : undefined,
          }}
        >
          <label
            ref={label}
            class={cs(
              'shrink-0 leading-32px not[:empty]:h-32px not[:empty]:pr-8px text-right [white-space:nowrap]',
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

        <div
          class="flex flex-col relative flex-grow-1"
          style={{
            width:
              layout() === 'horizontal' && maxItemWidth
                ? `calc(100% - ${maxItemWidth() ?? 0}px)`
                : undefined,
          }}
        >
          <div>
            <Dynamic
              component={props.component}
              value={props.name ? formInstance?.getFieldValue(props.name) : undefined}
              status={errMsg() ? 'error' : undefined}
              onChange={(value: any) => {
                if (!isNil(props.name)) formInstance?.setFieldValue(props.name, value)

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
          </div>

          <Show when={errMsg()}>
            <div class="absolute top-[100%] text-[var(--ant-color-error)]">{errMsg()}</div>
          </Show>
        </div>
      </Element>
    </Show>
  )
}

export default FormItem
