import { type Component, For, type JSX, mergeProps, Show } from 'solid-js'
import cs from 'classnames'
import { isEmpty } from 'lodash-es'
import { type StringOrJSXElement, type Key, type StyleProps } from '../types'
import createControllableValue from '../hooks/createControllableValue'
import { unwrapStringOrJSXElement } from '../utils/solid'
import Element from '../Element'
import useComponentSize from '../hooks/useComponentSize'
import CollapseItemComponent, { type CollapseItemProps } from './Item'
import CollapseContext from './context'
import { getElementClass, getElementCssVariables } from './utils'

export interface CollapseItem extends StyleProps {
  key: Key
  label: StringOrJSXElement
  children: StringOrJSXElement
  /**
   * 自定义渲染每个面板右上角的内容
   */
  extra?: StringOrJSXElement
  /**
   * 是否禁用 children
   */
  disabledChildren?: boolean
}

export interface CollapseProps
  extends StyleProps,
  Pick<
  CollapseItemProps,
  | 'bordered'
  | 'size'
  | 'type'
  | 'expandIcon'
  | 'expandIconPosition'
  | 'headerStyle'
  | 'bodyStyle'
  > {
  defaultActiveKey?: Key[]
  activeKey?: Key[]
  /**
   * 切换面板的回调
   */
  onChange?: (value: Key[]) => void
  items: CollapseItem[] | undefined | null
  fallback?: JSX.Element
  divider?: boolean
}

const Collapse: Component<CollapseProps> & {
  Item: typeof CollapseItemComponent
} = _props => {
  const props = mergeProps(
    {
      divider: true,
      type: 'line',
    } as const,
    _props,
  )
  const size = useComponentSize(() => props.size)
  const [activeKey, setActiveKey] = createControllableValue<Key[]>(props, {
    defaultValuePropName: 'defaultActiveKey',
    valuePropName: 'activeKey',
    defaultValue: [],
  })

  return (
    <Show when={!isEmpty(props.items)} fallback={props.fallback}>
      <Element
        class={cs(getElementClass(props.type), props.class)}
        style={{
          ...getElementCssVariables(props.type, size()),
          ...props.style,
        }}
      >
        <CollapseContext.Provider
          value={{
            list: true,
          }}
        >
          <For each={props.items}>
            {(item, index) => (
              <>
                <Show when={index() !== 0 && props.divider}>
                  <div
                    class={cs(
                      'h-1px bg-[var(--ant-color-split)]',
                      props.type === 'line' && 'm-[--ant-collapse-divider-margin]',
                    )}
                  />
                </Show>

                <CollapseItemComponent
                  {...item}
                  open={activeKey().includes(item.key)}
                  onOpenChange={open => {
                    if (open) {
                      setActiveKey([...activeKey(), item.key])
                    } else {
                      setActiveKey(activeKey().filter(key => key !== item.key))
                    }
                  }}
                  size={size()}
                  type={props.type}
                  bordered={props.bordered}
                  expandIcon={props.expandIcon}
                  expandIconPosition={props.expandIconPosition}
                  headerStyle={props.headerStyle}
                  bodyStyle={props.bodyStyle}
                >
                  {unwrapStringOrJSXElement(item.children)}
                </CollapseItemComponent>
              </>
            )}
          </For>
        </CollapseContext.Provider>
      </Element>
    </Show>
  )
}

Collapse.Item = CollapseItemComponent

export default Collapse
