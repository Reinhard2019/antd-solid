import { type Component } from 'solid-js'
import cs from 'classnames'
import createControllableValue from '../hooks/createControllableValue'

export interface SwitchProps {
  defaultChecked?: boolean
  checked?: boolean
  onChange?: (checked: boolean) => void
}

const Switch: Component<SwitchProps> = props => {
  const [checked, setChecked] = createControllableValue<boolean>(props, {
    defaultValuePropName: 'defaultChecked',
    valuePropName: 'checked',
  })
  return (
    <button
      class={cs(
        'w-44px h-22px rounded-100px relative',
        checked() ? 'bg-[var(--ant-color-primary)]' : 'bg-[rgba(0,0,0,0.45)]',
      )}
      onClick={() => setChecked(c => !c)}
    >
      <div
        class={cs(
          'w-18px h-18px rounded-50% bg-white absolute top-1/2 -translate-y-1/2 transition-left',
          checked() ? 'left-[calc(100%-20px)]' : 'left-2px',
        )}
      />
    </button>
  )
}

export default Switch
