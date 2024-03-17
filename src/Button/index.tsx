import {
  type Component,
  mergeProps,
  type ParentProps,
  type JSX,
  Show,
  createSignal,
  createMemo,
  splitProps,
} from 'solid-js'
import cs from 'classnames'
import './index.scss'
import { wave } from '../utils/animation'

export interface ButtonProps
  extends ParentProps,
  JSX.CustomAttributes<HTMLButtonElement>,
  JSX.HTMLAttributes<HTMLButtonElement> {
  type?: 'default' | 'primary' | 'dashed' | 'text' | 'link'
  onClick?: ((e: MouseEvent) => void) | ((e: MouseEvent) => Promise<unknown>)
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
  disabled?: boolean
  /**
   * 是否开启自动 loading
   * 当按钮 click 事件返回 promise 对象时，会自动开启 loading 状态
   */
  autoLoading?: boolean
}

const sizeClassMap = {
  large: 'px-15px py-7px h-40px leading-24px rounded-[var(--ant-border-radius-lg)]',
  middle: 'px-15px py-4px h-32px leading-22px rounded-[var(--ant-border-radius)]',
  small: 'px-7px h-24px leading-22px rounded-[var(--ant-border-radius-sm)]',
} as const

// 有边框按钮的 disabled 样式
const disabledWithBorderClass =
  '[border:1px_solid_var(--ant-button-border-color-disabled)] bg-[var(--ant-color-bg-container-disabled)] text-[var(--ant-color-text-disabled)]'
// 无边框按钮的 disabled 样式
const disabledWithNoBorderClass = 'text-[var(--ant-color-text-disabled)]'

const typeClassMap = {
  default: (danger: boolean, disabled: boolean) =>
    disabled
      ? disabledWithBorderClass
      : cs(
        'bg-white',
        danger
          ? '[border:1px_solid_var(--ant-color-error)] text-[var(--ant-color-error)] hover:[border-color:var(--ant-color-error-border-hover)] hover:text-[var(--ant-color-error-border-hover)] active:[border-color:var(--ant-color-error-active)] active:text-[var(--ant-color-error-active)]'
          : '[border:1px_solid_var(--ant-color-border)] text-[var(--ant-button-default-color)] hover:[border-color:var(--ant-color-primary-hover)] hover:text-[var(--ant-color-primary-hover)] active:[border-color:var(--ant-color-primary-active)] active:text-[var(--ant-color-primary-active)]',
      ),
  primary: (danger: boolean, disabled: boolean) =>
    disabled
      ? disabledWithBorderClass
      : cs(
        'text-white',
        danger
          ? '[border:1px_solid_var(--ant-color-error)] bg-[var(--ant-color-error)] hover:[border-color:var(--ant-color-error-border-hover)] hover:bg-[var(--ant-color-error-border-hover)] active:[border-color:var(--ant-color-error-active)] active:bg-[var(--ant-color-error-active)]'
          : '[border:1px_solid_var(--ant-color-primary)] bg-[var(--ant-color-primary)] hover:[border-color:var(--ant-color-primary-hover)] hover:bg-[var(--ant-color-primary-hover)] active:[border-color:var(--ant-color-primary-active)] active:bg-[var(--ant-color-primary-active)]',
      ),
  dashed: (danger: boolean, disabled: boolean) =>
    disabled
      ? disabledWithBorderClass
      : cs(
        ' bg-white',
        danger
          ? '[border:1px_dashed_var(--ant-color-error)] text-[var(--ant-color-error)] hover:[border-color:var(--ant-color-error-border-hover)] hover:text-[var(--ant-color-error-border-hover)] active:[border-color:var(--ant-color-error-active)] active:text-[var(--ant-color-error-active)]'
          : '[border:1px_dashed_var(--ant-color-border)] text-[var(--ant-button-default-color)] hover:[border-color:var(--ant-color-primary-hover)] hover:text-[var(--ant-color-primary-hover)] active:[border-color:var(--ant-color-primary-active)] active:text-[var(--ant-color-primary-active)]',
      ),
  text: (danger: boolean, disabled: boolean) =>
    disabled
      ? disabledWithNoBorderClass
      : cs(
        'border-none bg-transparent',
        danger
          ? 'text-[var(--ant-color-error)] hover:bg-[var(--ant-color-error-bg)] active:bg-[var(--ant-color-error-bg)]'
          : 'text-[var(--ant-color-text)] hover:bg-[var(--ant-color-bg-text-hover)] active:bg-[var(--ant-color-bg-text-active)]',
      ),
  link: (danger: boolean, disabled: boolean) =>
    disabled
      ? disabledWithNoBorderClass
      : cs(
        'border-none bg-transparent',
        danger
          ? 'text-[var(--ant-color-error)] hover:text-[var(--ant-color-error-border-hover)] active:text-[var(--ant-color-error-active)]'
          : 'text-[var(--ant-color-primary)] hover:text-[var(--ant-color-primary-hover)] active:text-[var(--ant-color-primary-active)]',
      ),
} as const

const Button: Component<ButtonProps> = _props => {
  const props = mergeProps(
    { type: 'default', size: 'middle', danger: false, disabled: false } as const,
    _props,
  )
  const [, buttonElementProps] = splitProps(props, ['type', 'size', 'loading', 'danger'])
  const [innerLoading, setLoading] = createSignal(false)
  const loading = createMemo(() => props.loading ?? innerLoading())

  return (
    <button
      {...buttonElementProps}
      ref={props.ref}
      class={cs(
        `ant-btn ant-btn-${props.type}`,
        'relative cursor-pointer',
        'focus-visible:[outline:4px_solid_var(--ant-color-primary-border)] focus-visible:[outline-offset:1px]',
        props.class,
        sizeClassMap[props.size!],
        props.disabled && 'cursor-not-allowed',
        typeClassMap[props.type!](props.danger, props.disabled),
        loading() && 'opacity-65',
      )}
      style={props.style}
      disabled={props.disabled}
      onClick={e => {
        const res = props.onClick?.(e)
        if (props.autoLoading && res instanceof Promise) {
          setLoading(true)
          res.finally(() => setLoading(false))
        }

        if (props.type === 'default' || props.type === 'primary' || props.type === 'dashed') {
          wave(
            e.currentTarget,
            props.danger ? 'var(--ant-color-error-border-hover)' : 'var(--ant-color-primary-hover)',
          )
        }
      }}
    >
      <Show when={loading()}>
        <span class="i-ant-design:loading [vertical-align:-0.125em] keyframes-spin [animation:spin_1s_linear_infinite] mr-8px" />
      </Show>
      <span class="inline-block leading-inherit">{props.children}</span>
    </button>
  )
}

export default Button
