import { type Component, splitProps, mergeProps } from 'solid-js'
import cs from 'classnames'
import Popover, { type PopoverProps } from '../Popover'
import Menu, { type MenuProps } from '../Menu'
import Context from './context'
import { useSize } from '../hooks'
import { type StyleProps } from '../types'

export interface DropdownProps extends Omit<PopoverProps, 'placement'>, StyleProps {
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
  let ref: HTMLSpanElement | undefined
  const size = useSize(() => ref, 'offset')
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
            style={{
              ...props.menu.style,
              'min-width': props.trigger === 'contextMenu' ? undefined : `${size()?.width ?? 0}px`,
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
        {...popoverProps}
      >
        <span ref={ref} class={cs('cursor-pointer inline-block', props.class)} style={props.style}>
          {props.children}
        </span>
      </Popover>
    </Context.Provider>
  )
}

export default Dropdown
