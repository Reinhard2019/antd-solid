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
  on,
  createRenderEffect,
} from 'solid-js'
import { Dynamic, Portal, render } from 'solid-js/web'
import cs from 'classnames'
import { Transition } from 'solid-transition-group'
import Button from '../Button'
import createControllableValue from '../hooks/createControllableValue'
import DelayShow from '../DelayShow'
import './index.scss'
import createTransition from '../hooks/createTransition'
import Element from '../Element'

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
   * 关闭时销毁 Modal 里的子元素
   * 默认 false
   */
  destroyOnClose?: boolean
  /**
   * 是否在摁下 Esc 键的时候关闭 Modal
   * 默认 true
   */
  closeOnEsc?: boolean
  /**
   * 返回 true，会自动关闭 modal
   */
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  onOk?: () => Promise<unknown> | void
  onCancel?: () => void
  /**
   * Modal 打开动画结束事件
   */
  onAfterEnter?: () => void
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
            <span class="i-ant-design:exclamation-circle text-22px mr-12px text-[var(--ant-color-warning)]" />
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

// 单位 s
const transitionDuration = 0.3

const Modal: Component<ModalProps> & {
  warning: typeof warning
  useModalProps: typeof useModalProps
  createModal: typeof createModal
} = _props => {
  const props = mergeProps(
    {
      width: '520px',
      footer: true,
      keyboard: true,
      maskClosable: true,
      closeIcon: true,
      destroyOnClose: false,
      closeOnEsc: true,
    },
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

    if (!props.closeOnEsc) return

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

  const [activeElementCenter, setActiveElementCenter] = createSignal({
    x: 0,
    y: 0,
  })
  createRenderEffect(
    on(open, input => {
      if (input) {
        const rect = document.activeElement?.getBoundingClientRect()
        setActiveElementCenter({
          x: rect ? rect.x + rect.width / 2 : 0,
          y: rect ? rect.y + rect.height / 2 : 0,
        })
      }
    }),
  )

  let modalRootRef: HTMLDivElement | undefined
  createTransition(() => modalRootRef, open, 'ant-modal-fade')

  return (
    <DelayShow when={open()}>
      <Portal>
        <Transition
          name="ant-modal-fade"
          appear
          onEnter={(el, done) => {
            el.animate([], {
              duration: transitionDuration * 1000,
            }).finished.finally(done)
          }}
          onAfterEnter={() => {
            props.onAfterEnter?.()
          }}
          onExit={(el, done) => {
            el.animate([], {
              duration: transitionDuration * 1000,
            }).finished.finally(done)
          }}
        >
          <Dynamic component={props.destroyOnClose ? Show : DelayShow} when={open()}>
            <Element
              ref={modalRootRef}
              class="[font-size:var(--ant-font-size)] text-[var(--ant-color-text)] leading-[var(--ant-line-height)]"
              style={{
                '--transition-duration': `${transitionDuration}s`,
              }}
            >
              <div
                class={cs('ant-modal-mask', 'fixed inset-0 bg-[var(--ant-color-bg-mask)] z-1000')}
                aria-label="mask"
                onClick={() => {
                  if (props.maskClosable) {
                    props.onCancel?.()
                  }
                }}
              />

              <div class="ant-modal-wrap z-1000 fixed inset-0 overflow-auto pointer-events-none">
                <div
                  class={cs(
                    'ant-modal',
                    'px-24px py-20px rounded-8px overflow-hidden bg-[var(--ant-modal-content-bg)] flex flex-col max-w-[calc(100vw-calc(var(--ant-margin)*2))] transform-origin-center pointer-events-initial',
                  )}
                  style={{
                    '--translate-y': props.centered ? 'max(calc(50vh - 50%), 0px)' : '100px',
                    '--active-element-center-x': `${activeElementCenter().x}px`,
                    '--active-element-center-y': `${activeElementCenter().y}px`,
                    width: props.width,
                    height: props.height,
                  }}
                  onClick={e => {
                    e.stopPropagation()
                  }}
                >
                  {/* 关闭按钮 */}
                  <Show when={props.closeIcon}>
                    <Button
                      type="text"
                      class={cs(
                        '!w-22px !h-22px !flex !justify-center !items-center text-center text-18px !absolute !top-16px !right-16px z-1000 !text-[var(--ant-color-icon)] hover:!text-[var(--ant-color-icon-hover)]',
                      )}
                      onClick={() => {
                        props.onCancel?.()
                      }}
                    >
                      <span class="i-ant-design:close-outlined" />
                    </Button>
                  </Show>

                  <div class="text-[var(--ant-modal-title-color)] text-16px font-600 mb-8px">
                    {props.title}
                  </div>
                  <div class="grow">{props.children}</div>

                  <Show when={props.footer}>
                    <div class="mt-12px text-right">
                      <Show
                        when={typeof props.footer !== 'function'}
                        fallback={typeof props.footer === 'function' && props.footer()}
                      >
                        <div class="inline-flex gap-8px">
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
              </div>
            </Element>
          </Dynamic>
        </Transition>
      </Portal>
    </DelayShow>
  )
}

Modal.useModalProps = useModalProps
Modal.warning = warning
Modal.createModal = createModal

export default Modal
