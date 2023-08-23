import { type JSXElement, Show, createSignal, untrack } from 'solid-js'
import { Portal, render } from 'solid-js/web'
import Button from './Button'
import cs from 'classnames'

export interface ModalInstance {
  open: () => void
  close: () => void
}

export interface ModalProps {
  ref?: (modal: ModalInstance) => void
  title?: JSXElement
  initialOpen?: boolean
  width?: string
  // open?: boolean
  children?: JSXElement
  contentClass?: string
  closeIconClass?: string
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
  /**
   * 返回 true，会自动关闭 modal
   */
  onOk?: () => (boolean | Promise<boolean>)
  afterClose?: () => void
}

export interface MethodProps
  extends Pick<ModalProps, 'title' | 'children' | 'onOk' | 'afterClose'> {}

function Modal(props: ModalProps) {
  const [open, setOpen] = createSignal(props.initialOpen ?? false)
  const close = () => {
    setOpen(false)
    props.afterClose?.()
  }

  const instance: ModalInstance = {
    open() {
      setOpen(true)
    },
    close() {
      setOpen(false)
    },
  }
  untrack(() => props.ref?.(instance))

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
        >
          <div
            class={cs(
              'ant-absolute ant-px-24px ant-py-20px ant-rounded-8px ant-overflow-hidden ant-bg-white',
              // '!ant-[animation-duration:.5s]',
              !props.centered && 'ant-top-100px',
              props.contentClass,
            )}
            onClick={e => {
              e.stopPropagation()
            }}
            style={{ width: props.width ?? '520px' }}
          >
            {/* 关闭按钮 */}
            <Show when={props.closeIcon !== false}>
              <Button
                type="text"
                class={cs(
                  "before:ant-content-[''] before:ant-block before:i-ant-design:close-outlined ant-rm-size-btn !ant-w-22px !ant-h-22px !ant-flex !ant-justify-center !ant-items-center ant-text-center ant-text-18px !ant-absolute !ant-top-16px !ant-right-16px ant-z-1000 ant-text-[rgba(0,0,0,.45)] hover:!ant-text-[rgba(0,0,0,.88)]",
                  props.closeIconClass,
                )}
                onClick={close}
              />
            </Show>

            <div class="ant-text-[rgba(0,0,0,.88)] ant-text-16px ant-font-600 ant-mb-8px">{props.title}</div>
            <div>{props.children}</div>

            <div class="ant-text-right">
              <Button onClick={close}>取消</Button>
              <Button
                type="primary"
                class="!ant-ml-8px"
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
          </div>
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
        initialOpen
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
