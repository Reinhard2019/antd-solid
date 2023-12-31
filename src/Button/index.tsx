import {
  type Component,
  mergeProps,
  type ParentProps,
  type JSX,
  Show,
  createSignal,
  createMemo,
  untrack,
} from 'solid-js'
import cs from 'classnames'
import Compact from '../Compact'
import './index.scss'

interface ButtonProps extends ParentProps, JSX.CustomAttributes<HTMLButtonElement> {
  type?: 'default' | 'primary' | 'dashed' | 'text' | 'link'
  onClick?: ((e: MouseEvent) => void) | ((e: MouseEvent) => Promise<unknown>)
  'on:click'?: (e: MouseEvent) => void
  /**
   * 默认: middle
   */
  size?: 'large' | 'middle' | 'small'
  class?: string
  style?: JSX.CSSProperties
  loading?: boolean
  /**
   * 设置危险按钮
   */
  danger?: boolean
}

const sizeClassMap = {
  large: 'ant-px-15px ant-py-6px ant-h-40px ant-rounded-8px',
  middle: 'ant-px-15px ant-py-4px ant-h-32px ant-rounded-6px',
  small: 'ant-px-7px ant-h-24px ant-rounded-4px',
} as const

const typeClassMap = {
  default: (danger: boolean) =>
    cs(
      'ant-bg-white',
      danger
        ? 'ant-[border:1px_solid_var(--ant-color-error)] ant-text-[var(--ant-color-error)] hover:ant-[border-color:var(--light-error-color)] hover:ant-text-[var(--light-error-color)] active:ant-[border-color:var(--dark-error-color)] active:ant-text-[var(--dark-error-color)]'
        : 'ant-[border:1px_solid_var(--ant-color-border)] ant-text-[var(--dark-color)] hover:ant-[border-color:var(--ant-color-primary-hover)] hover:ant-text-[var(--ant-color-primary-hover)] active:ant-[border-color:var(--ant-color-primary-active)] active:ant-text-[var(--ant-color-primary-active)]',
    ),
  primary: (danger: boolean) =>
    cs(
      'ant-text-white',
      danger
        ? 'ant-[border:1px_solid_var(--ant-color-error)] ant-bg-[var(--ant-color-error)] hover:ant-[border-color:var(--light-error-color)] hover:ant-bg-[var(--light-error-color)] active:ant-[border-color:var(--dark-error-color)] active:ant-bg-[var(--dark-error-color)]'
        : 'ant-[border:1px_solid_var(--ant-color-primary)] ant-bg-[var(--ant-color-primary)] hover:ant-[border-color:var(--ant-color-primary-hover)] hover:ant-bg-[var(--ant-color-primary-hover)] active:ant-[border-color:var(--ant-color-primary-active)] active:ant-bg-[var(--ant-color-primary-active)]',
    ),
  dashed: (danger: boolean) =>
    cs(
      ' ant-bg-white',
      danger
        ? 'ant-[border:1px_dashed_var(--ant-color-error)] ant-text-[var(--ant-color-error)] hover:ant-[border-color:var(--light-error-color)] hover:ant-text-[var(--light-error-color)] active:ant-[border-color:var(--dark-error-color)] active:ant-text-[var(--dark-error-color)]'
        : 'ant-[border:1px_dashed_var(--ant-color-border)] ant-text-[var(--dark-color)] hover:ant-[border-color:var(--ant-color-primary-hover)] hover:ant-text-[var(--ant-color-primary-hover)] active:ant-[border-color:var(--ant-color-primary-active)] active:ant-text-[var(--ant-color-primary-active)]',
    ),
  text: (danger: boolean) =>
    cs(
      'ant-border-none ant-bg-transparent',
      danger
        ? 'ant-text-[var(--ant-color-error)] hover:ant-bg-[var(--error-bg-color)] active:ant-bg-[var(--error-bg-color)]'
        : 'ant-text-[var(--dark-color)] hover:ant-bg-[rgba(0,0,0,0.06)] active:ant-bg-[rgba(0,0,0,.15)]',
    ),
  link: (danger: boolean) =>
    cs(
      'ant-border-none ant-bg-transparent',
      danger
        ? 'ant-text-[var(--ant-color-error)] hover:ant-text-[var(--light-error-color)] active:ant-text-[var(--dark-error-color)]'
        : 'ant-text-[var(--ant-color-primary)] hover:ant-text-[var(--ant-color-primary-hover)] active:ant-text-[var(--ant-color-primary-active)]',
    ),
} as const

const Button: Component<ButtonProps> = props => {
  const mergedProps = mergeProps({ type: 'default', size: 'middle' } as ButtonProps, props)
  const [innerLoading, setLoading] = createSignal(false)
  const loading = createMemo(() => props.loading ?? innerLoading())

  return (
    <button
      ref={mergedProps.ref}
      class={cs(
        `ant-btn ant-btn-${mergedProps.type}`,
        'ant-relative ant-cursor-pointer',
        'focus-visible:ant-[outline:4px_solid_var(--ant-color-primary-border)] focus-visible:ant-[outline-offset:1px]',
        mergedProps.class,
        sizeClassMap[mergedProps.size!],
        typeClassMap[mergedProps.type!](props.danger ?? false),
        loading() && 'ant-opacity-65',
        'ant-[--color:--ant-color-primary-hover]',
        Compact.compactItemRounded0Class,
        Compact.compactItemZIndexClass,
        Compact.compactItemClass,
      )}
      style={mergedProps.style}
      // @ts-expect-error on:
      on:click={untrack(() => props['on:click'])}
      // eslint-disable-next-line solid/jsx-no-duplicate-props
      onClick={e => {
        const res = mergedProps.onClick?.(e)
        if (res instanceof Promise) {
          setLoading(true)
          res.finally(() => setLoading(false))
        }

        if (
          mergedProps.type === 'default' ||
          mergedProps.type === 'primary' ||
          mergedProps.type === 'dashed'
        ) {
          const div = document.createElement('div')
          div.className = cs(
            props.danger
              ? 'ant-[--color:var(--light-error-color)]'
              : 'ant-[--color:var(--ant-color-primary-hover)]',
            'ant-absolute ant-inset-0 ant-rounded-inherit ant-[background:radial-gradient(var(--color),rgba(0,0,0,0))] ant-z--1 ant-keyframes-button-border[inset:0px][inset:-6px] ant-[animation:button-border_ease-out_0.3s]',
          )
          const onAnimationEnd = () => {
            div.remove()
            div.removeEventListener('animationend', onAnimationEnd)
          }
          div.addEventListener('animationend', onAnimationEnd)
          e.currentTarget.insertBefore(div, e.currentTarget.childNodes[0])
        }
      }}
    >
      <Show when={loading()}>
        <span class="i-ant-design:loading ant-[vertical-align:-0.125em] keyframes-spin ant-[animation:spin_1s_linear_infinite] ant-mr-8px" />
      </Show>
      <span>{mergedProps.children}</span>
    </button>
  )
}

export default Button
