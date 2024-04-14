import { type ParentProps, type Component, mergeProps, useContext } from 'solid-js'
import cs from 'classnames'
import ConfigProviderContext from '../ConfigProvider/context'

export interface AlertProps extends ParentProps {
  /**
   * 指定警告提示的样式，有四种选择 success、info、warning、error
   * 默认 'info'
   */
  type?: 'success' | 'info' | 'warning' | 'error'
}

const TypeClassDict = {
  success:
    'bg-[var(--ant-color-success-bg)] [border:var(--ant-line-width)_var(--ant-line-type)_var(--ant-color-success-border)]',
  info: 'bg-[var(--ant-color-info-bg)] [border:var(--ant-line-width)_var(--ant-line-type)_var(--ant-color-info-border)]',
  warning:
    'bg-[var(--ant-color-warning-bg)] [border:var(--ant-line-width)_var(--ant-line-type)_var(--ant-color-warning-border)]',
  error:
    'bg-[var(--ant-color-error-bg)] [border:var(--ant-line-width)_var(--ant-line-type)_var(--ant-color-error-border)]',
} as const

const Alert: Component<AlertProps> = _props => {
  const { cssVariables } = useContext(ConfigProviderContext)
  const props = mergeProps({ type: 'info' } as Required<AlertProps>, _props)

  return (
    <div
      class={cs(
        'p-[var(--ant-alert-default-padding)] rounded-[var(--ant-border-radius-lg)] text-[var(--ant-color-text)]',
        TypeClassDict[props.type],
      )}
      style={cssVariables()}
    >
      {props.children}
    </div>
  )
}

export default Alert
