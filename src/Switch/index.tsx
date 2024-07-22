import { createMemo, mergeProps, useContext, type Component, type JSX } from 'solid-js'
import cs from 'classnames'
import createControllableValue from '../hooks/createControllableValue'
import Element from '../Element'
import ConfigProviderContext from '../ConfigProvider/context'

export interface SwitchProps {
  defaultChecked?: boolean
  checked?: boolean
  onChange?: (checked: boolean) => void
  /**
   * 开关大小
   * 默认 'middle'
   */
  size?: 'small' | 'middle' | 'large'
  /**
   * 是否禁用
   */
  disabled?: boolean
}

const Switch: Component<SwitchProps> = _props => {
  const { componentSize } = useContext(ConfigProviderContext)
  const props = mergeProps({ size: 'middle' } as const, _props)
  const size = createMemo(() => componentSize() ?? props.size)
  const [checked, setChecked] = createControllableValue<boolean>(props, {
    defaultValuePropName: 'defaultChecked',
    valuePropName: 'checked',
  })

  return (
    <Element<JSX.ButtonHTMLAttributes<HTMLButtonElement>>
      tag="button"
      class={cs(
        'rounded-100px relative vertical-middle',
        {
          large: 'w-56px h-28px',
          middle: 'w-40px h-22px',
          small: 'w-28px h-16px',
        }[size()],
        checked() ? 'bg-[var(--ant-color-primary)]' : 'bg-[rgba(0,0,0,0.45)]',
        props.disabled && 'opacity-[--ant-opacity-loading] cursor-not-allowed',
      )}
      onClick={() => {
        if (props.disabled) return
        setChecked(c => !c)
      }}
    >
      <div
        class={cs(
          'rounded-50% bg-white absolute top-1/2 -translate-y-1/2 transition-left',
          {
            large: 'w-24px h-24px',
            middle: 'w-18px h-18px',
            small: 'w-12px h-12px',
          }[size()],
          checked() ? 'right-2px' : 'left-2px',
        )}
      />
    </Element>
  )
}

export default Switch
