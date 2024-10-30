import { createMemo, createSignal, mergeProps } from 'solid-js'
import { type StringOrJSXElement, type StyleProps } from '../types'
import Element from '../Element'
import InternalMenu from './InternalMenu'
import createControllableValue from '../hooks/createControllableValue'

export interface MenuItemType<T = any> {
  key: T
  label: StringOrJSXElement
  disabled?: boolean
  children?: MenuItem[]
  onClick?: (info: { key: T; keyPath: T[] }) => void
}

export interface MenuDividerType {
  type: 'divider'
}

export type MenuItem<T = any> = MenuItemType<T> | MenuDividerType

export interface MenuProps<T = any> extends StyleProps {
  /**
   * 菜单类型
   * 默认 'vertical' | 'inline'
   */
  mode?: 'vertical' | 'inline'
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
  defaultExpandedKeys?: T[]
  /**
   * 当前展开的 SubMenu 菜单项 key 数组
   */
  expandedKeys?: T[]
  /**
   * SubMenu 展开/关闭的回调
   */
  onExpandedKeysChange?: (expandedKeys: T[]) => void
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
   * 被选中时调用
   */
  onSelect?: (info: { key: T; keyPath: T[]; selectedKeys: T[] }) => void
  /**
   * 取消选中时调用，仅在 multiple 生效
   */
  onDeselect?: (info: { key: T; keyPath: T[]; selectedKeys: T[] }) => void
}

function Menu<T = any>(_props: MenuProps<T>) {
  const props = mergeProps(
    {
      mode: 'vertical',
      selectable: true,
    } as const,
    _props,
  )

  const [_selectedKeys, setSelectedKeys] = createControllableValue<T[] | undefined>(props, {
    defaultValuePropName: 'defaultSelectedKeys',
    valuePropName: 'selectedKeys',
    trigger: null,
  })
  const selectedKeys = createMemo(() => _selectedKeys() ?? [])

  const [_expandedKeys, setExpandedKeys] = createControllableValue<T[] | undefined>(props, {
    defaultValuePropName: 'defaultExpandedKeys',
    valuePropName: 'expandedKeys',
    trigger: 'onExpandedKeysChange',
  })
  const expandedKeys = createMemo(() => _expandedKeys() ?? [])

  const [hoverKeyPath, setHoverKeyPathChange] = createSignal<T[]>([])

  return (
    <Element
      class={props.class}
      style={{
        '--ant-menu-item-margin': 'var(--ant-margin-xxs)',
        ...props.style,
      }}
    >
      <InternalMenu
        {...props}
        selectedKeys={selectedKeys()}
        onSelect={info => {
          props.onSelect?.(info)
          setSelectedKeys(info.selectedKeys)
        }}
        onDeselect={info => {
          props.onDeselect?.(info)
          setSelectedKeys(info.selectedKeys)
        }}
        expandedKeys={expandedKeys()}
        onExpandedKeysChange={setExpandedKeys}
        hoverKeyPath={hoverKeyPath()}
        onHoverKeyPathChange={setHoverKeyPathChange}
      />
    </Element>
  )
}

export default Menu
