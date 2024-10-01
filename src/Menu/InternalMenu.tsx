import { For, type JSXElement, Match, Show, Switch, createMemo, useContext } from 'solid-js'
import { isEmpty, last } from 'lodash-es'
import cs from 'classnames'
import Popover from '../Popover'
import DropdownContext from '../Dropdown/context'
import { unwrapStringOrJSXElement } from '../utils/solid'
import { type MenuItem, type MenuDividerType, type MenuProps } from '.'
import DelayShow from '../DelayShow'

function isMenuDividerType(value: MenuItem): value is MenuDividerType {
  return (value as MenuDividerType).type === 'divider'
}

interface InternalMenuProps<T = any>
  extends Pick<
  MenuProps<T>,
  'mode' | 'items' | 'selectable' | 'onClick' | 'onSelect' | 'onDeselect'
  > {
  /**
   * 当前选中的菜单项 key 数组
   */
  selectedKeys: T[]
  /**
   * 当前展开的 SubMenu 菜单项 key 数组
   */
  expandedKeys: T[]
  /**
   * SubMenu 展开/关闭的回调
   */
  onExpandedKeysChange: (expandedKeys: T[]) => void
  /**
   * 当前 hover 的 key 的路径
   */
  hoverKeyPath: T[]
  /**
   * hoverKeyPath 变化的回调
   */
  onHoverKeyPathChange: (hoverKeyPath: T[]) => void
  /**
   * 父级 keys
   */
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
        const expanded = createMemo(() => props.expandedKeys?.includes(item.key))
        const hasChildren = createMemo(() => !isEmpty(item.children))

        const getLabel = (options?: { onClick?: () => void; expandIcon?: JSXElement }) => (
          <div
            class={cs(
              'relative rounded-[var(--ant-border-radius-lg)] cursor-pointer flex items-center',
              inDropdown ? 'min-h-32px' : 'min-h-40px m-[--ant-menu-item-margin]',
              props.selectedKeys.includes(item.key)
                ? 'bg-[--ant-control-item-bg-active] text-[--ant-color-primary]'
                : 'text-[--ant-color-text] hover:bg-[var(--ant-color-bg-text-hover)]',
              !hasChildren()
                ? [
                  'px-[var(--ant-padding)]',
                  props.selectable && 'active:bg-[var(--ant-control-item-bg-active)]',
                ]
                : 'pl-[var(--ant-padding)] pr-[calc(var(--ant-padding)+0.7em+var(--ant-margin-xs))]',
            )}
            onClick={() => {
              options?.onClick?.()

              if (!hasChildren()) {
                const info = {
                  key: item.key,
                  keyPath: keyPath(),
                }

                item.onClick?.(info)
                props.onClick?.(info)

                if (props.selectable) {
                  props.onSelect?.({
                    ...info,
                    selectedKeys: [item.key],
                  })
                }
              }
            }}
            style={{
              'padding-left':
                props.mode === 'inline'
                  ? `calc(${keyPath().length} * var(--ant-padding))`
                  : undefined,
            }}
          >
            {unwrapStringOrJSXElement(item.label)}

            <Show when={hasChildren()}>{options?.expandIcon}</Show>
          </div>
        )

        return (
          <Show when={hasChildren()} fallback={getLabel()}>
            <Switch>
              <Match when={props.mode === 'vertical'}>
                <Popover
                  trigger="hover"
                  open={expanded()}
                  onOpenChange={value => {
                    if (value) {
                      props.onExpandedKeysChange(keyPath())
                      return
                    }

                    const lastKey = last(props.expandedKeys)
                    if (item.key === lastKey) {
                      props.onExpandedKeysChange(props.hoverKeyPath)
                    }
                  }}
                  placement="rightTop"
                  arrow={false}
                  content={() => (
                    <div
                      onMouseEnter={() => {
                        props.onHoverKeyPathChange(keyPath())
                      }}
                      onMouseLeave={() => {
                        props.onHoverKeyPathChange([])
                      }}
                    >
                      <InternalMenu
                        {...props}
                        items={item.children}
                        parentKeys={keyPath()}
                        onClick={info => {
                          props.onExpandedKeysChange([])
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
                  {getLabel({
                    expandIcon: (
                      <span class="i-ant-design:right-outlined w-0.7em absolute top-1/2 right-[var(--ant-padding)] translate-y--1/2" />
                    ),
                  })}
                </Popover>
              </Match>

              <Match when={props.mode === 'inline'}>
                <div>
                  {getLabel({
                    onClick() {
                      if (hasChildren()) {
                        if (expanded()) {
                          props.onExpandedKeysChange(props.expandedKeys.filter(k => k !== item.key))
                        } else {
                          props.onExpandedKeysChange([...props.expandedKeys, item.key])
                        }
                      }
                    },
                    expandIcon: (
                      <Show
                        when={expanded()}
                        fallback={
                          <span class="i-ant-design:down-outlined w-0.7em absolute top-1/2 right-[var(--ant-padding)] translate-y--1/2" />
                        }
                      >
                        <span class="i-ant-design:up-outlined w-0.7em absolute top-1/2 right-[var(--ant-padding)] translate-y--1/2" />
                      </Show>
                    ),
                  })}

                  <DelayShow when={expanded()}>
                    <div style={{ display: expanded() ? 'block' : 'none' }}>
                      <InternalMenu {...props} items={item.children} parentKeys={keyPath()} />
                    </div>
                  </DelayShow>
                </div>
              </Match>
            </Switch>
          </Show>
        )
      }}
    </For>
  )
}

export default InternalMenu
