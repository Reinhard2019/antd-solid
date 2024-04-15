import { type Component, splitProps, mergeProps } from 'solid-js'
import Popover, { type PopoverProps } from '../Popover'
import Menu, { type MenuProps } from '../Menu'
import Context from './context'

export interface DropdownProps extends Omit<PopoverProps, 'placement'> {
  /**
   * 菜单配置项
   */
  menu: MenuProps
  /**
   * 菜单弹出位置
   * 默认 'bottomLeft'
   */
  placement?: 'top' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
}

const Dropdown: Component<DropdownProps> = _props => {
  const props = mergeProps(
    {
      placement: 'bottomLeft' as const,
    },
    _props,
  )
  const [, popoverProps] = splitProps(props, ['menu'])

  return (
    <Context.Provider value={{ inDropdown: true }}>
      <Popover
        arrow={props.arrow ?? false}
        content={close => (
          <Menu
            {...props.menu}
            onClick={info => {
              close()
              props.menu?.onClick?.(info)
            }}
          />
        )}
        contentStyle={{ padding: '4px' }}
        offset={[
          0,
          props.placement === 'top' ||
          props.placement === 'topLeft' ||
          props.placement === 'bottomRight'
            ? -4
            : 4,
        ]}
        {...popoverProps}
      >
        {props.children}
      </Popover>
    </Context.Provider>
  )
}

export default Dropdown
