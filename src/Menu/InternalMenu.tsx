import { For, Show, createMemo, useContext, type Component } from 'solid-js'
import { isEmpty, last } from 'lodash-es'
import cs from 'classnames'
import { Dynamic } from 'solid-js/web'
import Fragment from '../Fragment'
import Popover, { type PopoverProps } from '../Popover'
import DropdownContext from '../Dropdown/context'
import { unwrapStringOrJSXElement } from '../utils/solid'
import { type MenuItem, type MenuDividerType, type MenuProps } from '.'

function isMenuDividerType(value: MenuItem): value is MenuDividerType {
  return (value as MenuDividerType).type === 'divider'
}

interface InternalMenuProps<T = any>
  extends Pick<MenuProps<T>, 'items' | 'selectable' | 'onClick'> {
  /**
   * 当前展开的 SubMenu 菜单项 key 数组
   */
  openKeys: T[]
  /**
   * SubMenu 展开/关闭的回调
   */
  onOpenChange: (openKeys: T[]) => void
  hoverKeys: T[]
  onHoverChange: (hoverKeys: T[]) => void
  parentKeys?: T[]
}

function InternalMenu<T = any>(props: InternalMenuProps<T>) {
  const { inDropdown } = useContext(DropdownContext)

  return (
    <For each={props.items}>
      {item => {
        if (isMenuDividerType(item))
          return <div class="h-1px bg-[var(--ant-color-split)] my-[var(--ant-margin-xxs)]" />

        const keyPath = createMemo(() => [...(props.parentKeys ?? []), item.key])
        const open = createMemo(() => props.openKeys?.includes(item.key))

        return (
          <Dynamic<Component<PopoverProps>>
            component={isEmpty(item.children) ? (Fragment as any) : Popover}
            trigger="hover"
            open={open()}
            onOpenChange={value => {
              if (value) {
                props.onOpenChange(keyPath())
                return
              }

              const lastKey = last(props.openKeys)
              if (item.key === lastKey) {
                props.onOpenChange(props.hoverKeys)
              }
            }}
            placement="rightTop"
            arrow={false}
            content={() => (
              <div
                onMouseEnter={() => {
                  props.onHoverChange(keyPath())
                }}
                onMouseLeave={() => {
                  props.onHoverChange([])
                }}
              >
                <InternalMenu
                  {...props}
                  items={item.children}
                  parentKeys={keyPath()}
                  onClick={info => {
                    props.onOpenChange([])
                    props.onClick?.(info)
                  }}
                />
              </div>
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
                    keyPath: keyPath(),
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

export default InternalMenu
