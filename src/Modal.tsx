import { type JSXElement, Show, createSignal, untrack, type Ref, mergeProps } from 'solid-js'
import { Portal, render } from 'solid-js/web'
import Button from './Button'
import cs from 'classnames'

export interface ModalInstance {
  open: () => void
  close: () => void
}

export interface ModalProps {
  ref?: Ref<ModalInstance>
  title?: JSXElement
  defaultOpen?: boolean
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
   */
  closeIcon?: boolean
  footer?: boolean | ((modal: ModalInstance) => JSXElement)
  /**
   * 关闭时销毁 Modal 里的子元素
   */
  destroyOnClose?: boolean
  /**
   * 返回 true，会自动关闭 modal
   */
  onOk?: () => boolean | Promise<boolean>
  afterClose?: () => void
  /**
   * 自定义渲染对话框
   */
  modalRender?: () => JSXElement
}

export interface MethodProps
  extends Pick<ModalProps, 'title' | 'children' | 'onOk' | 'afterClose'> {}

function Modal(_props: ModalProps) {
  const props = mergeProps({ footer: true }, _props)
  const [open, setOpen] = createSignal(props.defaultOpen ?? false)
  const [hide, setHide] = createSignal(false)
  let recoverBodyStyle: () => void

  const instance: ModalInstance = {
    open() {
      setOpen(true)
      setHide(false)

      const originOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      recoverBodyStyle = () => {
        document.body.style.overflow = originOverflow
      }
    },
    close() {
      untrack(() => {
        if (props.destroyOnClose) {
          setOpen(false)
        } else {
          setHide(true)
        }

        recoverBodyStyle()
      })
    },
  }
  untrack(() => {
    if (typeof props.ref === 'function') {
      props.ref?.(instance)
    }
  })

  const close = () => {
    instance.close()
    props.afterClose?.()
  }

  const [confirmLoading, setConfirmLoading] = createSignal(false)

  return (
    <Show when={open()}>
      <Portal>
        <div
          class={cs(
            'ant-fixed ant-justify-center ant-inset-0 ant-bg-[rgba(0,0,0,.45)] ant-flex ant-z-1000',
            props.centered && 'ant-items-center',
          )}
          onClick={() => {
            if (props.maskClosable ?? true) {
              close()
            }
          }}
          style={{ display: hide() ? 'none' : undefined }}
        >
          <Show when={typeof props.modalRender !== 'function'} fallback={props.modalRender!()}>
            <div
              class={cs(
                'ant-absolute ant-px-24px ant-py-20px ant-rounded-8px ant-overflow-hidden ant-bg-white ant-flex ant-flex-col',
                // '!ant-[animation-duration:.5s]',
                !props.centered && 'ant-top-100px',
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
              <Show when={props.closeIcon !== false}>
                <Button
                  type="text"
                  class={cs(
                    'ant-rm-size-btn !ant-w-22px !ant-h-22px !ant-flex !ant-justify-center !ant-items-center ant-text-center ant-text-18px !ant-absolute !ant-top-16px !ant-right-16px ant-z-1000 ant-text-[rgba(0,0,0,.45)] hover:!ant-text-[rgba(0,0,0,.88)]',
                  )}
                  onClick={close}
                >
                  <span class="i-ant-design:close-outlined" />
                </Button>
              </Show>

              <div class="ant-text-[rgba(0,0,0,.88)] ant-text-16px ant-font-600 ant-mb-8px">
                {props.title}
              </div>
              <div class="ant-grow">{props.children}</div>

              <Show when={props.footer !== false}>
                <div class="ant-mt-12px">
                  <Show
                    when={typeof props.footer !== 'function'}
                    fallback={typeof props.footer === 'function' && props.footer(instance)}
                  >
                    <div class="ant-flex ant-gap-8px ant-justify-end">
                      <Button onClick={close}>取消</Button>
                      <Button
                        type="primary"
                        loading={confirmLoading()}
                        // eslint-disable-next-line solid/reactivity, @typescript-eslint/no-misused-promises
                        onClick={async () => {
                          if (!props.onOk) return

                          let res = props.onOk?.()
                          if (res instanceof Promise) {
                            setConfirmLoading(true)
                            res = await res.finally(() => setConfirmLoading(false))
                          }
                          if (res) {
                            instance.close()
                          }
                        }}
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

Modal.warning = (props: MethodProps) => {
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
            <span class="i-ant-design:exclamation-circle ant-text-22px ant-mr-12px ant-text-[var(--warning-color)]" />
            {props.title}
          </>
        }
        children={<div class="ant-ml-34px">{props.children}</div>}
        defaultOpen
        afterClose={() => {
          document.body.removeChild(div)
          dispose()
          props.afterClose?.()
        }}
      />
    ),
    div,
  )
}

export default Modal
