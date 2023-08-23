import { type Component } from 'solid-js'
import createControllableValue from './hooks/createControllableValue'
import cs from 'classnames'

export interface SwitchProps {
  defaultChecked?: boolean
  checked?: boolean
  onChange?: (checked: boolean) => void
}

const Switch: Component<SwitchProps> = props => {
  const [checked, setChecked] = createControllableValue(props, {
    defaultValuePropName: 'defaultChecked',
    valuePropName: 'checked',
  })
  return (
    <button
      class={cs(
        'ant-w-44px ant-h-22px ant-rounded-100px ant-relative',
        checked() ? 'ant-bg-[var(--primary-color)]' : 'ant-bg-[rgba(0,0,0,0.45)]',
      )}
      onClick={() => setChecked(c => !c)}
    >
      <div
        class={cs(
          'ant-w-18px ant-h-18px ant-rounded-50% ant-bg-white ant-absolute ant-top-1/2 -ant-translate-y-1/2 ant-transition-left',
          checked() ? 'ant-left-[calc(100%-20px)]' : 'ant-left-2px',
        )}
      />
    </button>
  )
}

export default Switch
