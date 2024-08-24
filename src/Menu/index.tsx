import { For, Show, createMemo, mergeProps, useContext, type Component } from 'solid-js'
import { isEmpty, omit } from 'lodash-es'
import cs from 'classnames'
import { Dynamic } from 'solid-js/web'
import { type StringOrJSXElement, type StyleProps } from '../types'
import Fragment from '../Fragment'
import Popover, { type PopoverProps } from '../Popover'
import DropdownContext from '../Dropdown/context'
import Element from '../Element'
import { unwrapStringOrJSXElement } from '../utils/solid'

export interface MenuItemType {
  key: any
  label: StringOrJSXElement
  children?: MenuItem[]
}

export interface MenuDividerType {
  type: 'divider'
}

export type MenuItem = MenuItemType | MenuDividerType

function isMenuDividerType(value: MenuItem): value is MenuDividerType {
  return (value as MenuDividerType).type === 'divider'
}

export interface MenuProps extends StyleProps {
  /**
   * 菜单类型
   * 默认 'vertical'
   */
  mode?: 'vertical'
  /**
   * 菜单项
   */
  items?: MenuItem[]
  /**
   * 是否允许选中
   */
  selectable?: boolean
  /**
   * 点击 MenuItem 调用此函数
   */
  onClick?: (info: { key: any; keyPath: any[] }) => void
}

interface InternalMenuProps extends MenuProps {
  parents?: MenuItemType[]
}

const InternalMenu: Component<InternalMenuProps> = props => {
  const { inDropdown } = useContext(DropdownContext)

  return (
    <For each={props.items}>
      {item => {
        if (isMenuDividerType(item))
          return <div class="h-1px bg-[var(--ant-color-split)] my-[var(--ant-margin-xxs)]" />

        const parents = createMemo(() => [...(props.parents ?? []), item])
        return (
          <Dynamic<Component<PopoverProps>>
            component={isEmpty(item.children) ? (Fragment as any) : Popover}
            trigger="click"
            placement="rightTop"
            arrow={false}
            content={close => (
              <InternalMenu
                {...props}
                items={item.children}
                parents={parents()}
                onClick={info => {
                  close()
                  props.onClick?.(info)
                }}
              />
            )}
            contentStyle={{
              padding: inDropdown ? '4px' : 0,
            }}
            offset={[8, 0]}
          >
            <div
              class={cs(
                'relative rounded-[var(--ant-border-radius-lg)] text-[var(--ant-color-text)] cursor-pointer',
                'hover:bg-[var(--ant-color-bg-text-hover)]',
                inDropdown ? 'leading-32px' : 'leading-40px m-4px',
                isEmpty(item.children)
                  ? [
                    'px-[var(--ant-padding)]',
                    props.selectable && 'active:bg-[var(--ant-control-item-bg-active)]',
                  ]
                  : 'pl-[var(--ant-padding)] pr-[calc(var(--ant-padding)+0.7em+var(--ant-margin-xs))]',
              )}
              onClick={() => {
                if (isEmpty(item.children)) {
                  props.onClick?.({
                    key: item.key,
                    keyPath: parents().map(v => v.key),
                  })
                }
              }}
            >
              {unwrapStringOrJSXElement(item.label)}

              <Show when={!isEmpty(item.children)}>
                <span class="i-ant-design:right-outlined w-0.7em absolute top-1/2 right-[var(--ant-padding)] translate-y--1/2" />
              </Show>
            </div>
          </Dynamic>
        )
      }}
    </For>
  )
}

const Menu: Component<MenuProps> = _props => {
  const props = mergeProps(
    {
      mode: 'vertical',
      selectable: true,
    } as const,
    _props,
  )

  return (
    <Element class={props.class} style={props.style}>
      <InternalMenu {...omit(props, ['parents'])} />
    </Element>
  )
}

export default Menu
