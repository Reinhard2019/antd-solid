import { mergeProps, useContext, type Component } from 'solid-js'
import cs from 'classnames'
import createControllableValue from '../hooks/createControllableValue'
import ConfigProviderContext from '../ConfigProvider/context'

export interface SwitchProps {
  defaultChecked?: boolean
  checked?: boolean
  onChange?: (checked: boolean) => void
  /**
   * 开关大小
   * 默认 'default'
   */
  size?: 'default' | 'small'
}

const Switch: Component<SwitchProps> = _props => {
  const { cssVariables } = useContext(ConfigProviderContext)
  const props = mergeProps({ size: 'default' } as const, _props)
  const [checked, setChecked] = createControllableValue<boolean>(props, {
    defaultValuePropName: 'defaultChecked',
    valuePropName: 'checked',
  })

  return (
    <button
      class={cs(
        'rounded-100px relative vertical-middle',
        {
          default: 'w-44px h-22px',
          small: 'w-28px h-16px',
        }[props.size],
        checked() ? 'bg-[var(--ant-color-primary)]' : 'bg-[rgba(0,0,0,0.45)]',
      )}
      onClick={() => setChecked(c => !c)}
      style={cssVariables()}
    >
      <div
        class={cs(
          'rounded-50% bg-white absolute top-1/2 -translate-y-1/2 transition-left',
          {
            default: 'w-18px h-18px',
            small: 'w-12px h-12px',
          }[props.size],
          checked() ? 'right-2px' : 'left-2px',
        )}
      />
    </button>
  )
}

export default Switch
