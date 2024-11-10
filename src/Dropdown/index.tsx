import { type Component, splitProps, mergeProps } from 'solid-js'
import Popover, { type PopoverProps } from '../Popover'
import Menu, { type MenuProps } from '../Menu'
import Context from './context'
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
  /**
   * 下拉菜单和选择器同宽
   * 默认 true
   */
  popupMatchWidth?: boolean
}

const Dropdown: Component<DropdownProps> = _props => {
  let ref: HTMLSpanElement | undefined
  const size = useSize(() => ref, 'offset')
  const props = mergeProps(
    {
      placement: 'bottomLeft' as const,
      popupMatchWidth: true,
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
            style={{
              ...props.menu.style,
              'min-width': `${size()?.width ?? 0}px`,
              width: props.popupMatchWidth ? `${size()?.width ?? 0}px` : undefined,
              padding: '4px',
            }}
            onClick={info => {
              close()
              props.menu?.onClick?.(info)
            }}
          />
        )}
        contentStyle={{ padding: 0 }}
        offset={[
          0,
          props.placement === 'top' ||
          props.placement === 'topLeft' ||
          props.placement === 'bottomRight'
            ? -4
            : 4,
        ]}
        displayInMouseTrigger
        {...popoverProps}
      >
        <span ref={ref} class="cursor-pointer inline-block">
          {props.children}
        </span>
      </Popover>
    </Context.Provider>
  )
}

export default Dropdown
