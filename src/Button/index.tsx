import {
  type Component,
  mergeProps,
  type ParentProps,
  type JSX,
  Show,
  createSignal,
  createMemo,
  splitProps,
  children,
  useContext,
} from 'solid-js'
import cs from 'classnames'
import './index.scss'
import { wave } from '../utils/animation'
import Element from '../Element'
import useComponentSize from '../hooks/useComponentSize'
import { type StringOrJSXElement } from '../types'
import { unwrapStringOrJSXElement } from '../utils/solid'
import CompactContext from '../Compact/context'

export interface ButtonProps
  extends ParentProps,
  JSX.CustomAttributes<HTMLButtonElement>,
  JSX.HTMLAttributes<HTMLButtonElement> {
  type?: 'default' | 'primary' | 'dashed' | 'text' | 'link'
  onClick?: ((e: MouseEvent) => void) | ((e: MouseEvent) => Promise<unknown>)
  /**
   * 默认: middle
   */
  size?: 'small' | 'middle' | 'large'
  class?: string
  style?: JSX.CSSProperties
  /**
   * 按钮加载中状态
   * 'auto' 代表开启自动 loading，当按钮 click 事件返回 promise 对象时，会自动开启 loading 状态
   */
  loading?: boolean | 'auto'
  /**
   * 当 loading 为 true 时，是否隐藏子元素
   */
  hideChildrenWhenLoading?: boolean
  /**
   * 设置危险按钮
   */
  danger?: boolean
  disabled?: boolean
  /**
   * 将按钮宽度调整为其父宽度的选项
   */
  block?: boolean
  contentHTMLAttributes?: JSX.HTMLAttributes<HTMLDivElement>
  icon?: StringOrJSXElement
}

const sizeClassMap = {
  large: 'px-15px py-7px h-40px leading-24px',
  middle: 'px-15px py-4px h-32px leading-22px',
  small: 'px-7px h-24px leading-22px',
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
        'bg-[var(--ant-button-default-bg)]',
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
        ' bg-[var(--ant-button-default-bg)]',
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
  const props = mergeProps({ type: 'default', danger: false, disabled: false } as const, _props)
  const size = useComponentSize(() => props.size)
  const [, buttonElementProps] = splitProps(props, ['type', 'size', 'loading', 'danger'])
  const [innerLoading, setLoading] = createSignal(false)
  const loading = createMemo(() =>
    typeof props.loading === 'boolean' ? props.loading : innerLoading(),
  )
  const resolvedChildren = children(() => props.children)
  const resolvedIcon = children(() => unwrapStringOrJSXElement(props.icon))
  const { compact } = useContext(CompactContext)

  return (
    <Element<JSX.ButtonHTMLAttributes<HTMLButtonElement>>
      tag="button"
      {...buttonElementProps}
      ref={props.ref}
      class={cs(
        `ant-btn ant-btn-${props.type}`,
        'inline-flex justify-center items-center gap-8px',
        'relative cursor-pointer [font-size:var(--ant-font-size)] rounded-[--ant-button-border-radius]',
        'focus-visible:[outline:4px_solid_var(--ant-color-primary-border)] focus-visible:[outline-offset:1px]',
        props.block && 'block w-full',
        props.class,
        sizeClassMap[size()],
        props.disabled && 'cursor-not-allowed',
        typeClassMap[props.type!](props.danger, props.disabled),
        loading() && 'opacity-65',
        compact && 'ant-compact-item',
      )}
      style={{
        '--ant-button-border-radius': {
          small: 'var(--ant-border-radius-sm)',
          middle: 'var(--ant-border-radius)',
          large: 'var(--ant-border-radius-lg)',
        }[size()],
        ...props.style,
      }}
      disabled={props.disabled}
      onClick={e => {
        const res = props.onClick?.(e)
        if (props.loading === 'auto' && res instanceof Promise) {
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
      <Show
        when={loading()}
        fallback={
          <Show when={resolvedIcon()}>
            <span class="inline-block leading-inherit">{resolvedIcon()}</span>
          </Show>
        }
      >
        <span class="i-ant-design:loading [vertical-align:-0.125em] keyframes-spin [animation:spin_1s_linear_infinite]" />
      </Show>

      <Show when={resolvedChildren() && !(props.hideChildrenWhenLoading && loading())}>
        <span
          {...props.contentHTMLAttributes}
          class={cs('inline-block leading-inherit', props.contentHTMLAttributes?.class)}
        >
          {resolvedChildren()}
        </span>
      </Show>
    </Element>
  )
}

export default Button
