import { type ParentProps, type Component } from 'solid-js'
import Popover, { type PopoverProps } from '../Popover'
import Menu, { type MenuProps } from '../Menu'

export interface DropdownProps extends ParentProps, PopoverProps {
  menu: MenuProps
}

const Dropdown: Component<DropdownProps> = props => {
  return (
    <Popover
      arrow={props.arrow ?? false}
      content={<Menu {...props.menu} />}
      contentStyle={{ padding: 0 }}
      placement="bottomLeft"
    >
      {props.children}
    </Popover>
  )
}

export default Dropdown
