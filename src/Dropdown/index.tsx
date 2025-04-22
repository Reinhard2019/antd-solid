import { type Component, splitProps, mergeProps, children } from 'solid-js'
import Popover, { type PopoverProps } from '../Popover'
import Menu, { type MenuProps } from '../Menu'
import { useSize } from '../hooks'

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

  const resolvedChildren = children(() => _props.children)
  const size = useSize(() => {
    const _children = resolvedChildren()
    return _children instanceof HTMLElement ? _children : undefined
  }, 'offset')

  return (
    <Popover
      arrow={props.arrow ?? false}
      content={close => (
        <Menu
          selectable={false}
          {...props.menu}
          style={{
            '--ant-menu-item-height': '32px',
            'min-width': `${size()?.width ?? 0}px`,
            ...props.menu.style,
          }}
          onClick={info => {
            close()
            props.menu?.onClick?.(info)
          }}
        />
      )}
      contentStyle={{ padding: 0 }}
      {...popoverProps}
    >
      {resolvedChildren()}
    </Popover>
  )
}

export default Dropdown
