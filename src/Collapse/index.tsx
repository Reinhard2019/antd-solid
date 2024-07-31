import { type Accessor, createMemo, For, type JSX, Show, useContext } from 'solid-js'
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
   * 类型
   * 默认 'line'
   */
  type?: 'line' | 'card'
  each: T[] | undefined | null
  fallback?: JSX.Element
  children: (item: T, index: Accessor<number>) => JSX.Element
}

function Collapse<T = any>(props: CollapseProps<T>) {
  const { componentSize } = useContext(ConfigProviderContext)
  const size = createMemo(() => props.size ?? componentSize())
  const type = createMemo(() => props.type ?? 'line')
  const [activeItems, setActiveItems] = createControllableValue<T[]>(props, {
    defaultValuePropName: 'defaultActiveItems',
    valuePropName: 'activeItems',
    defaultValue: [],
  })

  return (
    <Show when={!isEmpty(props.each)} fallback={props.fallback}>
      <Element
        class={cs(
          '[font-size:var(--ant-font-size)] text-[var(--ant-color-text)] leading-[var(--ant-line-height)]',
          type() === 'card' &&
            'rounded-[var(--ant-border-radius-lg)] overflow-hidden [border:1px_solid_var(--ant-color-border)]',
          props.class,
        )}
        style={{
          '--ant-collapse-header-padding': {
            small: 'var(--ant-padding-xs) var(--ant-padding-sm)',
            middle: 'var(--ant-padding-sm) var(--ant-padding)',
            large: 'var(--ant-padding) var(--ant-padding-lg)',
          }[size()],
          '--ant-collapse-content-padding':
            type() === 'line'
              ? {
                small: 'var(--ant-padding-sm) 0 0 0',
                middle: 'var(--ant-padding) 0 0 0',
                large: 'var(--ant-padding-lg) 0 0 0',
              }[size()]
              : {
                small: 'var(--ant-padding-sm)',
                middle: 'var(--ant-padding)',
                large: 'var(--ant-padding-lg)',
              }[size()],
          '--ant-collapse-divider-margin': {
            small: 'var(--ant-margin-sm) 0',
            middle: 'var(--ant-margin) 0',
            large: 'var(--ant-margin-lg) 0',
          }[size()],
          ...props.style,
        }}
      >
        <CollapseContext.Provider
          value={{
            type,
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
                  index,
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
