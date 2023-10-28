import {
  type Component,
  mergeProps,
  type ParentProps,
  type JSX,
  Show,
  createSignal,
  createMemo,
} from 'solid-js'
import cs from 'classnames'

interface ButtonProps extends ParentProps, JSX.CustomAttributes<HTMLButtonElement> {
  type?: 'default' | 'primary' | 'dashed' | 'text' | 'link'
  onClick?: ((e: MouseEvent) => void) | ((e: MouseEvent) => Promise<unknown>)
  /**
   * 默认: middle
   * plain: 没有多余的 padding 和高度等
   */
  size?: 'large' | 'middle' | 'small' | 'plain'
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
  plain: 'ant-p-0',
} as const

const typeClassMap = {
  default: (danger: boolean) =>
    cs(
      'ant-bg-white',
      danger
        ? 'ant-[border:1px_solid_var(--error-color)] ant-text-[var(--error-color)] hover:ant-[border-color:var(--light-error-color)] hover:ant-text-[var(--light-error-color)] active:ant-[border-color:var(--dark-error-color)] active:ant-text-[var(--dark-error-color)]'
        : 'ant-[border:1px_solid_var(--border-color)] ant-text-[var(--dark-color)] hover:ant-[border-color:var(--light-primary-color)] hover:ant-text-[var(--light-primary-color)] active:ant-[border-color:var(--dark-primary-color)] active:ant-text-[var(--dark-primary-color)]',
    ),
  primary: (danger: boolean) =>
    cs(
      'ant-border-none ant-text-white',
      danger
        ? 'ant-bg-[var(--error-color)] hover:ant-bg-[var(--light-error-color)] active:ant-bg-[var(--dark-error-color)]'
        : 'ant-bg-[var(--primary-color)] hover:ant-bg-[var(--light-primary-color)] active:ant-bg-[var(--dark-primary-color)]',
    ),
  dashed: (danger: boolean) =>
    cs(
      ' ant-bg-white',
      danger
        ? 'ant-[border:1px_dashed_var(--error-color)] ant-text-[var(--error-color)] hover:ant-[border-color:var(--light-error-color)] hover:ant-text-[var(--light-error-color)] active:ant-[border-color:var(--dark-error-color)] active:ant-text-[var(--dark-error-color)]'
        : 'ant-[border:1px_dashed_var(--border-color)] ant-text-[var(--dark-color)] hover:ant-[border-color:var(--light-primary-color)] hover:ant-text-[var(--light-primary-color)] active:ant-[border-color:var(--dark-primary-color)] active:ant-text-[var(--dark-primary-color)]',
    ),
  text: (danger: boolean) =>
    cs(
      'ant-border-none ant-bg-transparent',
      danger
        ? 'ant-text-[var(--error-color)] hover:ant-bg-[var(--error-bg-color)] active:ant-bg-[var(--error-bg-color)]'
        : 'ant-text-[var(--dark-color)] hover:ant-bg-[rgba(0,0,0,0.06)] active:ant-bg-[rgba(0,0,0,.15)]',
    ),
  link: (danger: boolean) =>
    cs(
      'ant-border-none ant-bg-transparent',
      danger
        ? 'ant-text-[var(--error-color)] hover:ant-text-[var(--light-error-color)] active:ant-text-[var(--dark-error-color)]'
        : 'ant-text-[var(--primary-color)] hover:ant-text-[var(--light-primary-color)] active:ant-text-[var(--dark-primary-color)]',
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
        'ant-relative ant-cursor-pointer',
        mergedProps.class,
        sizeClassMap[mergedProps.size!],
        typeClassMap[mergedProps.type!](props.danger ?? false),
        loading() && 'ant-opacity-65',
      )}
      style={mergedProps.style}
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
            'ant-absolute ant-inset-0 ant-rounded-inherit ant-[animation:button-border_linear_1s]',
            props.danger
              ? 'ant-[border:1px_solid_var(--light-error-color)]'
              : 'ant-[border:1px_solid_var(--light-primary-color)]',
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
