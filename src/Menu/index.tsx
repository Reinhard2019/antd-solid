import { For, Show, createMemo, mergeProps, useContext, type Component, type JSX } from 'solid-js'
import { isEmpty, omit } from 'lodash-es'
import cs from 'classnames'
import { Dynamic } from 'solid-js/web'
import ConfigProviderContext from '../ConfigProvider/context'
import { type StyleProps } from '../types'
import Fragment from '../Fragment'
import Popover, { type PopoverProps } from '../Popover'

export interface MenuItem {
  key: string
  label: JSX.Element
  children?: MenuItem[]
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
  onClick?: (info: { key: string; keyPath: string[] }) => void
}

interface InternalMenuProps extends MenuProps {
  parents?: MenuItem[]
}

const InternalMenu: Component<InternalMenuProps> = props => {
  return (
    <For each={props.items}>
      {item => {
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
              padding: 0,
            }}
            offset={[8, 0]}
          >
            <div
              class={cs(
                'relative m-4px leading-40px rounded-[var(--ant-border-radius-lg)] text-[var(--ant-color-text)] cursor-pointer',
                'hover:bg-[var(--ant-color-bg-text-hover)]',
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
              {item.label}

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
  const { cssVariables } = useContext(ConfigProviderContext)
  const props = mergeProps(
    {
      mode: 'vertical',
      selectable: true,
    } as const,
    _props,
  )

  return (
    <div
      class={props.class}
      style={{
        ...cssVariables(),
        ...props.style,
      }}
    >
      <InternalMenu {...omit(props, ['parents'])} />
    </div>
  )
}

export default Menu
