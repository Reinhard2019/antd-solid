import {
  type JSXElement,
  Show,
  createSignal,
  mergeProps,
  type Component,
  createEffect,
  onCleanup,
  on,
  createRenderEffect,
} from 'solid-js'
import { Dynamic, Portal } from 'solid-js/web'
import cs from 'classnames'
import { Transition } from 'solid-transition-group'
import Button from '../Button'
import createControllableValue from '../hooks/createControllableValue'
import DelayShow from '../DelayShow'
import './index.scss'
import createTransition from '../hooks/createTransition'
import Element from '../Element'
import useModal from './useModal'
import createModal from './createModal'
import useModalProps from './useModalProps'
import warning from './warning'

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
   * 是否展示遮罩
   * 默认 true
   */
  mask?: boolean
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

// 单位 s
const transitionDuration = 0.3

const Modal: Component<ModalProps> & {
  useModalProps: typeof useModalProps
  createModal: typeof createModal
  warning: typeof warning
  useModal: typeof useModal
} = _props => {
  const props = mergeProps(
    {
      width: '520px',
      footer: true,
      mask: true,
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
              <Show when={props.mask}>
                <div
                  class={cs('ant-modal-mask', 'fixed inset-0 bg-[var(--ant-color-bg-mask)] z-1000')}
                  aria-label="mask"
                  onClick={() => {
                    if (props.maskClosable) {
                      props.onCancel?.()
                    }
                  }}
                />
              </Show>

              <div class="ant-modal-wrap z-1000 fixed inset-0 overflow-auto pointer-events-none">
                <div
                  class={cs(
                    'ant-modal',
                    'px-24px py-20px rounded-8px overflow-hidden bg-[--ant-color-bg-container-secondary] flex flex-col max-w-[calc(100vw-calc(var(--ant-margin)*2))] transform-origin-center pointer-events-initial',
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
Modal.createModal = createModal
Modal.warning = warning
Modal.useModal = useModal

export default Modal
