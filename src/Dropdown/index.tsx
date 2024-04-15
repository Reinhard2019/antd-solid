import { type ParentProps, type Component } from 'solid-js'
import Popover, { type PopoverProps } from '../Popover'
import Menu, { type MenuProps } from '../Menu'
import Context from './context'

export interface DropdownProps extends ParentProps, PopoverProps {
  menu: MenuProps
}

const Dropdown: Component<DropdownProps> = props => {
  return (
    <Context.Provider value={{ inDropdown: true }}>
      <Popover
        arrow={props.arrow ?? false}
        content={<Menu {...props.menu} />}
        contentStyle={{ padding: 0 }}
        placement="bottomLeft"
      >
        {props.children}
      </Popover>
    </Context.Provider>
  )
}

export default Dropdown
