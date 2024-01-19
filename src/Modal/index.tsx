import {
  type JSXElement,
  Show,
  createSignal,
  mergeProps,
  type Component,
  type Accessor,
  createContext,
  useContext,
  createEffect,
  onCleanup,
} from 'solid-js'
import { Dynamic, Portal, render } from 'solid-js/web'
import Button from '../Button'
import cs from 'classnames'
import createControllableValue from '../hooks/createControllableValue'

export interface ModalProps {
  title?: JSXElement
  defaultOpen?: boolean
  open?: boolean
  width?: string
  height?: string
  children?: JSXElement
  /**
   * 垂直居中展示 Modal
   */
  centered?: boolean
  /**
   * 点击蒙层是否允许关闭
   * 默认 true
   */
  maskClosable?: boolean
  /**
   * 设置为 false 时隐藏关闭按钮
   * 默认 true
   */
  closeIcon?: boolean
  footer?: boolean | (() => JSXElement)
  /**
   * 是否支持键盘 esc 关闭
   * 默认 true
   */
  keyboard?: boolean
  /**
   * 返回 true，会自动关闭 modal
   */
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  onOk?: () => Promise<unknown> | void
  onCancel?: () => void
  /**
   * 自定义渲染对话框
   */
  modalRender?: () => JSXElement
}

export interface MethodProps extends Pick<ModalProps, 'title' | 'children' | 'onOk' | 'onCancel'> {}

const ModalContext = createContext({
  open: (() => false) as Accessor<boolean>,
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  onOk: (() => {}) as (value: void | PromiseLike<void>) => Promise<unknown> | void,
  onCancel: () => {},
})

function warning(props: MethodProps) {
  const div = document.createElement('div')
  document.body.appendChild(div)
  const dispose = render(
    () => (
      <Modal
        width="416px"
        maskClosable={false}
        closeIcon={false}
        {...props}
        title={
          <>
            <span class="i-ant-design:exclamation-circle text-22px mr-12px text-[var(--ant-warning-color)]" />
            {props.title}
          </>
        }
        children={<div class="ml-34px">{props.children}</div>}
        defaultOpen
        onOk={() => {
          document.body.removeChild(div)
          dispose()
          props.onOk?.()
        }}
        onCancel={() => {
          document.body.removeChild(div)
          dispose()
          props.onCancel?.()
        }}
      />
    ),
    div,
  )
}

function useModalProps<T = void>() {
  const { open, onOk, onCancel } = useContext(ModalContext)
  return {
    open,
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    onOk: onOk as (value: T | PromiseLike<T>) => Promise<unknown> | void,
    onCancel,
    getProps: () => {
      return {
        open: open(),
        onOk,
        onCancel,
      }
    },
  }
}

/**
 * createModal
 * @param component
 * @param contextHolder 如果为 true，则会返回 getContextHolder
 */
function createModal<P extends {} = {}, T = void>(
  component: Component<P>,
): {
  show: (props?: P) => Promise<T>
}
function createModal<P extends {} = {}, T = void>(
  component: Component<P>,
  contextHolder: true,
): {
  show: (props?: P) => Promise<T>
  getContextHolder: () => JSXElement
}
function createModal<P extends {} = {}, T = void>(
  component: Component<P>,
  contextHolder?: true,
):
  | {
    show: (props?: P) => Promise<T>
  }
  | {
    show: (props?: P) => Promise<T>
    getContextHolder: () => JSXElement
  } {
  const [open, setOpen] = createSignal(false)
  const [props, setProps] = createSignal<P>({} as P)
  let resolve: (value: T | PromiseLike<T>) => void
  let reject: (reason?: any) => void
  let dispose: (() => void) | undefined

  const hide = () => {
    setOpen(false)
    dispose?.()
  }
  const onOk = (value?: T | PromiseLike<T>) => {
    hide()
    resolve(value!)
  }
  const onCancel = () => {
    hide()
    // eslint-disable-next-line prefer-promise-reject-errors
    reject()
  }
  const getContextHolder = () => (
    <Show when={open()}>
      <ModalContext.Provider
        value={{
          open,
          // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
          onOk: onOk as (value: void | PromiseLike<void>) => Promise<unknown> | void,
          onCancel,
        }}
      >
        <Dynamic component={component} {...props()!} />
      </ModalContext.Provider>
    </Show>
  )

  if (contextHolder) {
    return {
      async show(_props?: P) {
        setProps((_props as any) ?? {})
        setOpen(true)
        return await new Promise<T>((_resolve, _reject) => {
          resolve = _resolve
          reject = _reject
        })
      },
      getContextHolder,
    }
  }

  return {
    async show(_props?: P) {
      if (_props) setProps(_props as any)
      setOpen(true)
      return await new Promise<T>((_resolve, _reject) => {
        const div = document.createElement('div')
        document.body.appendChild(div)
        dispose = render(getContextHolder, div)

        resolve = _resolve
        reject = _reject
      })
    },
  }
}

const Modal: Component<ModalProps> & {
  warning: typeof warning
  useModalProps: typeof useModalProps
  createModal: typeof createModal
} = _props => {
  const props = mergeProps(
    { footer: true, keyboard: true, maskClosable: true, closeIcon: true },
    _props,
  )
  const [open] = createControllableValue(props, {
    valuePropName: 'open',
    defaultValuePropName: 'defaultOpen',
    trigger: null,
  })

  createEffect(() => {
    if (!open()) return

    const originOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyup = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        props.onCancel?.()
      }
    }
    document.addEventListener('keyup', onKeyup)

    onCleanup(() => {
      document.body.style.overflow = originOverflow
      document.removeEventListener('keyup', onKeyup)
    })
  })

  return (
    <Show when={open()}>
      <Portal>
        <div
          class={cs(
            'fixed justify-center inset-0 bg-[rgba(0,0,0,.45)] flex z-1000',
            props.centered && 'items-center',
          )}
          onClick={() => {
            if (props.maskClosable) {
              props.onCancel?.()
            }
          }}
        >
          <Show when={typeof props.modalRender !== 'function'} fallback={props.modalRender!()}>
            <div
              class={cs(
                'absolute px-24px py-20px rounded-8px overflow-hidden bg-white flex flex-col',
                // '![animation-duration:.5s]',
                !props.centered && 'top-100px',
              )}
              onClick={e => {
                e.stopPropagation()
              }}
              style={{
                width: props.width ?? '520px',
                height: props.height,
              }}
            >
              {/* 关闭按钮 */}
              <Show when={props.closeIcon}>
                <Button
                  type="text"
                  class={cs(
                    'rm-size-btn !w-22px !h-22px !flex !justify-center !items-center text-center text-18px !absolute !top-16px !right-16px z-1000 text-[rgba(0,0,0,.45)] hover:!text-[rgba(0,0,0,.88)]',
                  )}
                  onClick={() => {
                    props.onCancel?.()
                  }}
                >
                  <span class="i-ant-design:close-outlined" />
                </Button>
              </Show>

              <div class="text-[rgba(0,0,0,.88)] text-16px font-600 mb-8px">{props.title}</div>
              <div class="grow">{props.children}</div>

              <Show when={props.footer}>
                <div class="mt-12px">
                  <Show
                    when={typeof props.footer !== 'function'}
                    fallback={typeof props.footer === 'function' && props.footer()}
                  >
                    <div class="flex gap-8px justify-end">
                      <Button
                        onClick={() => {
                          props.onCancel?.()
                        }}
                      >
                        取消
                      </Button>
                      <Button
                        type="primary"
                        // eslint-disable-next-line solid/reactivity
                        onClick={async () => await props.onOk?.()}
                      >
                        确定
                      </Button>
                    </div>
                  </Show>
                </div>
              </Show>
            </div>
          </Show>
        </div>
      </Portal>
    </Show>
  )
}

Modal.useModalProps = useModalProps
Modal.warning = warning
Modal.createModal = createModal

export default Modal
