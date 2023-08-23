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
import './Button.css'

interface ButtonProps extends ParentProps, JSX.CustomAttributes<HTMLButtonElement> {
  type?: 'default' | 'primary' | 'text' | 'link'
  onClick?: ((e: MouseEvent) => void) | ((e: MouseEvent) => Promise<unknown>)
  /**
   * 默认: middle
   * plain: 没有多余的 padding 和高度等
   */
  size?: 'large' | 'middle' | 'small' | 'plain'
  class?: string
  style?: JSX.CSSProperties
  loading?: boolean
}

const sizeClassMap = {
  large: 'ant-px-15px ant-py-6px ant-h-40px ant-rounded-8px',
  middle: 'ant-px-15px ant-py-4px ant-h-32px ant-rounded-6px',
  small: 'ant-px-7px ant-h-24px ant-rounded-4px',
  plain: 'ant-p-0',
} as const

const typeClassMap = {
  default:
    'ant-[border:1px_solid_rgb(217,217,217)] ant-bg-white hover:ant-[border-color:var(--light-primary-color)] hover:ant-text-[var(--light-primary-color)]',
  primary:
    'ant-border-none ant-bg-[var(--primary-color)] hover:ant-bg-[var(--light-primary-color)] ant-text-white',
  text: 'ant-border-none ant-bg-transparent hover:ant-bg-[rgba(0,0,0,0.06)] active:ant-bg-[rgba(0,0,0,.15)]',
  link: 'ant-border-none ant-bg-transparent ant-text-[var(--primary-color)] hover:ant-text-[var(--light-primary-color)] active:ant-text-[var(--dark-primary-color)]',
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
        typeClassMap[mergedProps.type!],
        loading() && 'ant-opacity-65',
      )}
      style={mergedProps.style}
      onClick={e => {
        const res = mergedProps.onClick?.(e)
        if (res instanceof Promise) {
          setLoading(true)
          res.finally(() => setLoading(false))
        }

        if (mergedProps.type === 'default' || mergedProps.type === 'primary') {
          const div = document.createElement('div')
          div.className =
            'ant-absolute ant-inset-0 ant-rounded-inherit ant-[border:1px_solid_var(--light-primary-color)] ant-[animation:button-border_linear_1s]'
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
