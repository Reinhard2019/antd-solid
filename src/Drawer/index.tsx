import {
  mergeProps,
  type Component,
  Show,
  type JSXElement,
  type Ref,
  createSignal,
  untrack,
  createMemo,
  useContext,
} from 'solid-js'
import cs from 'classnames'
import { Portal } from 'solid-js/web'
import { Transition } from 'solid-transition-group'
import Button from '../Button'
import { setRef } from '../utils/solid'
import './index.scss'
import createTransition from '../hooks/createTransition'
import ConfigProviderContext from '../ConfigProvider/context'

export interface DrawerInstance {
  open: () => void
  close: () => void
}

export interface DrawerProps {
  ref?: Ref<DrawerInstance>
  title?: JSXElement
  extra?: JSXElement
  children?: JSXElement
  /**
   * 宽度
   * 默认 378px
   */
  width?: string
  /**
   * 高度，在 placement 为 top 或 bottom 时使用
   * 默认 378px
   */
  height?: string
  closeIcon?: boolean
  /**
   * 点击蒙层是否允许关闭
   * 默认 true
   */
  maskClosable?: boolean
  /**
   * 关闭时销毁 Modal 里的子元素
   */
  destroyOnClose?: boolean
  /**
   * 抽屉的方向
   * 默认 right
   */
  placement?: 'top' | 'right' | 'bottom' | 'left'
  /**
   * 指定 Drawer 挂载的节点，并在容器内展现，false 为挂载在当前位置
   * 默认 body
   */
  getContainer?: HTMLElement | (() => HTMLElement) | false
}

const Drawer: Component<DrawerProps> = _props => {
  const { cssVariables } = useContext(ConfigProviderContext)
  const props = mergeProps(
    {
      width: '378px',
      height: '378px',
      maskClosable: true,
      placement: 'right',
      getContainer: document.body,
    },
    _props,
  )

  /**
   * 控制是否打开/销毁
   */
  const [open, setOpen] = createSignal(false)
  /**
   * 控制显隐
   */
  const [hide, setHide] = createSignal(false)
  let cleanup: (() => void) | undefined

  const container = createMemo(() => {
    if (typeof props.getContainer === 'function') {
      return props.getContainer()
    }
    if (props.getContainer instanceof HTMLElement) {
      return props.getContainer
    }
    return undefined
  })
  const isBody = createMemo(() => container() === document.body)

  const instance: DrawerInstance = {
    open() {
      setOpen(true)
      setHide(false)

      untrack(() => {
        if (!isBody()) return

        const originOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        const onKeyup = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
            instance.close()
          }
        }
        document.addEventListener('keyup', onKeyup)

        cleanup = () => {
          document.body.style.overflow = originOverflow
          document.removeEventListener('keyup', onKeyup)
        }
      })
    },
    close() {
      untrack(() => {
        if (props.destroyOnClose) {
          setOpen(false)
        } else {
          setHide(true)
        }

        cleanup?.()
      })
    },
  }
  setRef(props, instance)

  let drawer: HTMLDivElement | undefined
  createTransition(
    () => drawer,
    () => !hide(),
    'ant-drawer-fade',
  )

  const direction = createMemo(() =>
    ['top', 'bottom'].includes(props.placement) ? 'vertical' : 'horizontal',
  )

  const children = (
    <Transition name="ant-drawer-fade">
      <Show when={open()}>
        <div
          ref={drawer}
          class={cs('inset-0 bg-[rgba(0,0,0,.45)] z-1000', isBody() ? 'fixed' : 'absolute')}
          onClick={() => {
            if (props.maskClosable) {
              instance.close()
            }
          }}
          style={cssVariables()}
        >
          <div
            class={cs(
              'ant-drawer-content',
              {
                left: 'ant-drawer-content-left',
                right: 'ant-drawer-content-right',
                top: 'ant-drawer-content-top',
                bottom: 'ant-drawer-content-bottom',
              }[props.placement],
              'absolute bg-white grid [grid-template-rows:auto_1fr]',
            )}
            style={{
              width: direction() === 'horizontal' ? props.width : undefined,
              height: direction() === 'vertical' ? props.height : undefined,
            }}
            onClick={e => {
              e.stopPropagation()
            }}
          >
            <div class="px-[var(--ant-padding-lg)] py-[var(--ant-padding)] flex justify-between items-center [border-bottom:var(--ant-line-width)_solid_var(--ant-color-split)]">
              <div class="flex items-center">
                <Show when={props.closeIcon !== false}>
                  <Button
                    type="text"
                    class="mr-[var(--ant-margin-sm)] text-size-[var(--ant-font-size-lg)] h-[var(--ant-font-size-lg)] leading-[var(--ant-font-size-lg)] hover:!bg-transparent !text-[var(--ant-color-icon)] hover:!text-[var(--ant-color-icon-hover)] !p-0"
                    onClick={() => {
                      instance?.close()
                    }}
                  >
                    <span class="i-ant-design:close-outlined" />
                  </Button>
                </Show>
                <span class="text-[var(--ant-color-text)] text-size-[var(--ant-font-size-lg)] [font-weight:var(--ant-font-weight-strong)] leading-[var(--ant-line-height-lg)]">
                  {props.title}
                </span>
              </div>

              <div>{props.extra}</div>
            </div>
            <div class="p-[var(--ant-padding-lg)] overflow-auto">{props.children}</div>
          </div>
        </div>
      </Show>
    </Transition>
  )

  return (
    <Show when={props.getContainer !== false} fallback={children}>
      <Portal mount={container()}>{children}</Portal>
    </Show>
  )
}

export default Drawer
