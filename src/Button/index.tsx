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
  large: 'px-15px py-6px h-40px rounded-8px',
  middle: 'px-15px py-4px h-32px rounded-6px',
  small: 'px-7px h-24px rounded-4px',
} as const

const typeClassMap = {
  default: (danger: boolean) =>
    cs(
      'bg-white',
      danger
        ? '[border:1px_solid_var(--ant-color-error)] text-[var(--ant-color-error)] hover:[border-color:var(--ant-light-error-color)] hover:text-[var(--ant-light-error-color)] active:[border-color:var(--ant-dark-error-color)] active:text-[var(--ant-dark-error-color)]'
        : '[border:1px_solid_var(--ant-color-border)] text-[var(--ant-dark-color)] hover:[border-color:var(--ant-color-primary-hover)] hover:text-[var(--ant-color-primary-hover)] active:[border-color:var(--ant-color-primary-active)] active:text-[var(--ant-color-primary-active)]',
    ),
  primary: (danger: boolean) =>
    cs(
      'text-white',
      danger
        ? '[border:1px_solid_var(--ant-color-error)] bg-[var(--ant-color-error)] hover:[border-color:var(--ant-light-error-color)] hover:bg-[var(--ant-light-error-color)] active:[border-color:var(--ant-dark-error-color)] active:bg-[var(--ant-dark-error-color)]'
        : '[border:1px_solid_var(--ant-color-primary)] bg-[var(--ant-color-primary)] hover:[border-color:var(--ant-color-primary-hover)] hover:bg-[var(--ant-color-primary-hover)] active:[border-color:var(--ant-color-primary-active)] active:bg-[var(--ant-color-primary-active)]',
    ),
  dashed: (danger: boolean) =>
    cs(
      ' bg-white',
      danger
        ? '[border:1px_dashed_var(--ant-color-error)] text-[var(--ant-color-error)] hover:[border-color:var(--ant-light-error-color)] hover:text-[var(--ant-light-error-color)] active:[border-color:var(--ant-dark-error-color)] active:text-[var(--ant-dark-error-color)]'
        : '[border:1px_dashed_var(--ant-color-border)] text-[var(--ant-dark-color)] hover:[border-color:var(--ant-color-primary-hover)] hover:text-[var(--ant-color-primary-hover)] active:[border-color:var(--ant-color-primary-active)] active:text-[var(--ant-color-primary-active)]',
    ),
  text: (danger: boolean) =>
    cs(
      'border-none bg-transparent',
      danger
        ? 'text-[var(--ant-color-error)] hover:bg-[var(--ant-error-bg-color)] active:bg-[var(--ant-error-bg-color)]'
        : 'text-[var(--ant-dark-color)] hover:bg-[rgba(0,0,0,0.06)] active:bg-[rgba(0,0,0,.15)]',
    ),
  link: (danger: boolean) =>
    cs(
      'border-none bg-transparent',
      danger
        ? 'text-[var(--ant-color-error)] hover:text-[var(--ant-light-error-color)] active:text-[var(--ant-dark-error-color)]'
        : 'text-[var(--ant-color-primary)] hover:text-[var(--ant-color-primary-hover)] active:text-[var(--ant-color-primary-active)]',
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
        'relative cursor-pointer',
        'focus-visible:[outline:4px_solid_var(--ant-color-primary-border)] focus-visible:[outline-offset:1px]',
        mergedProps.class,
        sizeClassMap[mergedProps.size!],
        typeClassMap[mergedProps.type!](props.danger ?? false),
        loading() && 'opacity-65',
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
              ? '[--color:var(--ant-light-error-color)]'
              : '[--color:var(--ant-color-primary-hover)]',
            'absolute inset-0 rounded-inherit [background:radial-gradient(var(--color),rgba(0,0,0,0))] z--1 keyframes-button-border[inset:0px][inset:-6px] [animation:button-border_ease-out_.3s]',
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
        <span class="i-ant-design:loading [vertical-align:-0.125em] keyframes-spin [animation:spin_1s_linear_infinite] mr-8px" />
      </Show>
      <span>{mergedProps.children}</span>
    </button>
  )
}

export default Button
