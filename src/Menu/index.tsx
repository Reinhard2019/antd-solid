import { createSignal, mergeProps } from 'solid-js'
import { type StringOrJSXElement, type StyleProps } from '../types'
import Element from '../Element'
import InternalMenu from './InternalMenu'
import createControllableValue from '../hooks/createControllableValue'

export interface MenuItemType<T = any> {
  key: T
  label: StringOrJSXElement
  children?: MenuItem[]
}

export interface MenuDividerType {
  type: 'divider'
}

export type MenuItem<T = any> = MenuItemType<T> | MenuDividerType

export interface MenuProps<T = any> extends StyleProps {
  /**
   * 菜单类型
   * 默认 'vertical'
   */
  mode?: 'vertical'
  /**
   * 菜单项
   */
  items?: Array<MenuItem<T>>
  /**
   * 点击 MenuItem 调用此函数
   */
  onClick?: (info: { key: T; keyPath: T[] }) => void
  /**
   * 初始展开的 SubMenu 菜单项 key 数组
   */
  defaultOpenKeys?: T[]
  /**
   * 当前展开的 SubMenu 菜单项 key 数组
   */
  openKeys?: T[]
  /**
   * SubMenu 展开/关闭的回调
   */
  onOpenChange?: (openKeys: T[]) => void
  /**
   * 是否允许选中
   */
  selectable?: boolean
  /**
   * 初始选中的菜单项 key 数组
   */
  defaultSelectedKeys?: T[]
  /**
   * 当前选中的菜单项 key 数组
   */
  selectedKeys?: T[]
  /**
   * 选中/取消选中的回调
   */
  onSelectChange?: (selectedKeys: T[]) => void
}

function Menu<T = any>(_props: MenuProps<T>) {
  const props = mergeProps(
    {
      mode: 'vertical',
      selectable: true,
    } as const,
    _props,
  )

  const [openKeys, setOpenKeys] = createControllableValue(props, {
    defaultValuePropName: 'defaultOpenKeys',
    valuePropName: 'openKeys',
    trigger: 'onOpenChange',
  })

  const [hoverKeys, setHoverKeys] = createSignal<T[]>([])

  return (
    <Element class={props.class} style={props.style}>
      <InternalMenu
        {...props}
        openKeys={openKeys()}
        onOpenChange={setOpenKeys}
        hoverKeys={hoverKeys()}
        onHoverChange={setHoverKeys}
      />
    </Element>
  )
}

export default Menu
