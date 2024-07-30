import { type Accessor, createMemo, For, type JSX, mergeProps, Show, useContext } from 'solid-js'
import cs from 'classnames'
import { isEmpty } from 'lodash-es'
import { type StyleProps } from '../types'
import createControllableValue from '../hooks/createControllableValue'
import Element from '../Element'
import ConfigProviderContext from '../ConfigProvider/context'
import CollapseContext, { CollapseItemContext } from './context'
import CollapseItem from './CollapseItem'
export type * from './CollapseItem'

export interface CollapseProps<T = any> extends StyleProps {
  defaultActiveItems?: T[]
  activeItems?: T[]
  /**
   * 切换面板的回调
   */
  onChange?: (value: T[]) => void
  /**
   * 设置折叠面板大小
   * 默认 'middle'
   */
  size?: 'small' | 'middle' | 'large'
  /**
   * 带边框风格的折叠面板
   * 默认 true
   */
  bordered?: boolean
  each: T[] | undefined | null
  fallback?: JSX.Element
  children: (item: T, index: Accessor<number>) => JSX.Element
}

function Collapse<T = any>(_props: CollapseProps<T>) {
  const { componentSize } = useContext(ConfigProviderContext)
  const props = mergeProps(
    {
      bordered: true,
    } as const,
    _props,
  )
  const bordered = createMemo(() => props.bordered)
  const size = createMemo(() => props.size ?? componentSize())
  const [activeItems, setActiveItems] = createControllableValue<T[]>(props, {
    defaultValuePropName: 'defaultActiveItems',
    valuePropName: 'activeItems',
    defaultValue: [],
  })

  return (
    <Show when={!isEmpty(props.each)} fallback={props.fallback}>
      <Element
        class={cs(
          'rounded-[var(--ant-border-radius-lg)] overflow-hidden [font-size:var(--ant-font-size)] text-[var(--ant-color-text)] leading-[var(--ant-line-height)]',
          props.bordered && '[border:1px_solid_var(--ant-color-border)]',
          props.class,
        )}
        style={{
          '--ant-collapse-header-padding': '12px 16px',
          '--ant-collapse-content-padding': {
            small: 'var(--ant-padding-sm)',
            middle: 'var(--ant-padding)',
            large: 'var(--ant-padding-lg)',
          }[size()],
          ...props.style,
        }}
      >
        <CollapseContext.Provider
          value={{
            bordered,
            size,
            activeItems,
            setActiveItems,
          }}
        >
          <For each={props.each}>
            {(item, index) => (
              <CollapseItemContext.Provider
                value={{
                  item,
                }}
              >
                {props.children(item, index)}
              </CollapseItemContext.Provider>
            )}
          </For>
        </CollapseContext.Provider>
      </Element>
    </Show>
  )
}

Collapse.Item = CollapseItem

export default Collapse
