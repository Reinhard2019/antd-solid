import {
  mergeProps,
  type Component,
  Show,
  type JSXElement,
  createMemo,
  createEffect,
  onCleanup,
} from 'solid-js'
import cs from 'classnames'
import { Dynamic, Portal } from 'solid-js/web'
import { Transition } from 'solid-transition-group'
import Button from '../Button'
import './index.scss'
import createTransition from '../hooks/createTransition'
import Element from '../Element'
import DelayShow from '../DelayShow'
import createControllableValue from '../hooks/createControllableValue'
import { type StyleProps, type StringOrJSXElement } from '../types'
import { unwrapStringOrJSXElement } from '../utils/solid'

export interface DrawerProps extends StyleProps {
  defaultOpen?: boolean
  open?: boolean
  onClose?: () => void
  title?: StringOrJSXElement
  extra?: StringOrJSXElement
  children?: JSXElement
  /**
   * 预设抽屉宽度（或高度）
   * 默认 378px
   */
  size?: string
  closeIcon?: boolean
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
   * 关闭时销毁 Modal 里的子元素
   */
  destroyOnClose?: boolean
  /**
   * 是否在摁下 Esc 键的时候关闭 Modal
   * 默认 true
   */
  closeOnEsc?: boolean
  /**
   * 抽屉的方向
   * 默认 right
   */
  placement?: 'top' | 'right' | 'bottom' | 'left'
  /**
   * 指定 Drawer 挂载的节点，并在容器内展现，false 为挂载在当前位置
   * 默认 body
   */
  getContainer?: HTMLElement | (() => HTMLElement | undefined) | false
}

const Drawer: Component<DrawerProps> = _props => {
  const props = mergeProps(
    {
      size: '378px',
      mask: true,
      maskClosable: true,
      closeIcon: true,
      destroyOnClose: false,
      closeOnEsc: true,
      placement: 'right',
      getContainer: document.body,
    },
    _props,
  )

  const [open] = createControllableValue<boolean>(props, {
    defaultValuePropName: 'defaultOpen',
    valuePropName: 'open',
    trigger: null,
  })

  createEffect(() => {
    if (!open()) return

    const originOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    if (!props.closeOnEsc) return

    const onKeyup = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        props.onClose?.()
      }
    }
    document.addEventListener('keyup', onKeyup)

    onCleanup(() => {
      document.body.style.overflow = originOverflow
      document.removeEventListener('keyup', onKeyup)
    })
  })

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

  let drawerRef: HTMLDivElement | undefined
  createTransition(() => drawerRef, open, 'ant-drawer-fade')

  const direction = createMemo(() =>
    ['top', 'bottom'].includes(props.placement) ? 'vertical' : 'horizontal',
  )

  const title = createMemo(() => unwrapStringOrJSXElement(props.title))
  const extra = createMemo(() => unwrapStringOrJSXElement(props.extra))

  const children = (
    <Transition
      name="ant-drawer-fade"
      appear
      onEnter={(el, done) => {
        el.animate([], {
          duration: 300,
        }).finished.finally(done)
      }}
      onExit={(el, done) => {
        el.animate([], {
          duration: 300,
        }).finished.finally(done)
      }}
    >
      <Dynamic component={props.destroyOnClose ? Show : DelayShow} when={open()}>
        <Element
          ref={drawerRef}
          class={cs(
            props.class,
            '[font-size:var(--ant-font-size)] text-[var(--ant-color-text)] leading-[var(--ant-line-height)]',
            'inset-0 z-1000',
            isBody() ? 'fixed' : 'absolute',
          )}
          style={{
            '--ant-drawer-body-padding': 'var(--ant-padding-lg)',
            ...props.style,
          }}
        >
          <Show when={props.mask}>
            <div
              class={cs('ant-drawer-mask', 'absolute inset-0 bg-[--ant-color-bg-mask]')}
              aria-label="mask"
              onClick={() => {
                if (props.maskClosable) {
                  props.onClose?.()
                }
              }}
            />
          </Show>

          <div
            class={cs(
              'ant-drawer-content',
              {
                left: 'ant-drawer-content-left',
                right: 'ant-drawer-content-right',
                top: 'ant-drawer-content-top',
                bottom: 'ant-drawer-content-bottom',
              }[props.placement],
              'absolute bg-[--ant-color-bg-container-secondary] grid [grid-template-rows:auto_1fr]',
            )}
            style={{
              width: direction() === 'horizontal' ? props.size : undefined,
              height: direction() === 'vertical' ? props.size : undefined,
            }}
            onClick={e => {
              e.stopPropagation()
            }}
          >
            <div class="px-[var(--ant-padding-lg)] py-[var(--ant-padding)] flex items-center [border-bottom:var(--ant-line-width)_solid_var(--ant-color-split)] empty:hidden">
              <Show when={props.closeIcon}>
                <Button
                  type="text"
                  size="small"
                  class="shrink-0 mr-[var(--ant-margin-sm)] text-size-[var(--ant-font-size-lg)] h-[var(--ant-font-size-lg)] leading-[var(--ant-font-size-lg)] hover:!bg-transparent !text-[var(--ant-color-icon)] hover:!text-[var(--ant-color-icon-hover)] !p-0"
                  onClick={() => {
                    props.onClose?.()
                  }}
                >
                  <span class="i-ant-design:close-outlined" />
                </Button>
              </Show>

              <Show when={title()}>
                <div class="w-full text-[var(--ant-color-text)] text-size-[var(--ant-font-size-lg)] [font-weight:var(--ant-font-weight-strong)] leading-[var(--ant-line-height-lg)]">
                  {title()}
                </div>
              </Show>

              <Show when={extra()}>
                <div class="shrink-0">{extra()}</div>
              </Show>
            </div>
            <div class="p-[--ant-drawer-body-padding] overflow-auto">{props.children}</div>
          </div>
        </Element>
      </Dynamic>
    </Transition>
  )

  return (
    <DelayShow when={open()}>
      <Show when={props.getContainer !== false} fallback={children}>
        <Portal mount={container()}>{children}</Portal>
      </Show>
    </DelayShow>
  )
}

export default Drawer
