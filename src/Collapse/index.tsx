import {
  type Accessor,
  type Component,
  createMemo,
  createSelector,
  For,
  type JSX,
  mergeProps,
  Show,
} from 'solid-js'
import cs from 'classnames'
import { Transition } from 'solid-transition-group'
import { isEmpty } from 'lodash-es'
import { type StringOrJSXElement, type Key, type StyleProps } from '../types'
import createControllableValue from '../hooks/createControllableValue'
import { unwrapStringOrJSXElement } from '../utils/solid'
import Element from '../Element'
import useComponentSize from '../hooks/useComponentSize'

export interface CollapseItem extends StyleProps {
  key: Key
  label: StringOrJSXElement
  children: StringOrJSXElement | false
  /**
   * 自定义渲染每个面板右上角的内容
   */
  extra?: StringOrJSXElement
}

export interface CollapseProps extends StyleProps {
  defaultActiveKey?: Key[]
  activeKey?: Key[]
  /**
   * 切换面板的回调
   */
  onChange?: (value: Key[]) => void
  items: CollapseItem[] | undefined | null
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
  bordered?: boolean
  fallback?: JSX.Element
  /**
   * 自定义切换图标
   * 为 false 代表不显示图标
   */
  expandIcon?: boolean | ((options: { isActive: Accessor<boolean> }) => JSX.Element)
  /**
   * 设置图标位置
   * 默认 'left'
   */
  expandIconPosition?: 'left' | 'right' | 'end'
  /**
   * collapse header style
   */
  headerStyle?: JSX.CSSProperties
}

const Collapse: Component<CollapseProps> = _props => {
  const props = mergeProps(
    {
      bordered: true,
      expandIconPosition: 'left',
    } as const,
    _props,
  )
  const type = createMemo(() => props.type ?? 'line')
  const size = useComponentSize(() => props.size)
  const [activeKey, setActiveKey] = createControllableValue<Key[]>(props, {
    defaultValuePropName: 'defaultActiveKey',
    valuePropName: 'activeKey',
    defaultValue: [],
  })

  const isActive = createSelector<Key[], Key>(activeKey, (a, b) => b.includes(a))
  const getExpandIcon = (
    item: CollapseItem,
    position: Required<CollapseProps>['expandIconPosition'],
  ) => {
    return (
      <Show
        when={
          item.children !== false &&
          props.expandIcon !== false &&
          props.expandIconPosition === position
        }
      >
        {typeof props.expandIcon === 'function' ? (
          props.expandIcon({ isActive: () => isActive(item.key) })
        ) : (
          <span
            class={cs(
              'i-ant-design:right-outlined',
              'duration-.3s',
              isActive(item.key) && 'rotate-[90deg]',
            )}
          />
        )}
      </Show>
    )
  }

  return (
    <Show when={!isEmpty(props.items)} fallback={props.fallback}>
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
        <For each={props.items}>
          {(item, index) => (
            <>
              <Show when={index() !== 0}>
                <div
                  class={cs(
                    'h-1px bg-[var(--ant-color-split)]',
                    type() === 'line' && 'm-[--ant-collapse-divider-margin]',
                  )}
                />
              </Show>

              <div class={item.class} style={item.style}>
                <div
                  class={cs(
                    'text-[--ant-color-text-heading] flex justify-between items-center cursor-pointer',
                    type() === 'card' &&
                      'bg-[var(--ant-collapse-header-bg)] p-[--ant-collapse-header-padding]',
                  )}
                  style={props.headerStyle}
                  onClick={() => {
                    if (item.children === false) return

                    if (activeKey().includes(item.key)) {
                      setActiveKey(activeKey().filter(key => key !== item.key))
                      return
                    }
                    setActiveKey([...activeKey(), item.key])
                  }}
                >
                  <span class="inline-flex items-center gap-[--ant-margin-sm]">
                    {getExpandIcon(item, 'left')}
                    {unwrapStringOrJSXElement(item.label)}
                    {getExpandIcon(item, 'right')}
                  </span>

                  <span class="inline-flex items-center gap-[--ant-margin-sm]">
                    {unwrapStringOrJSXElement(item.extra)}
                    {getExpandIcon(item, 'end')}
                  </span>
                </div>

                <Transition
                  onEnter={(el, done) => {
                    el.animate([{ height: '0px' }, { height: `${el.scrollHeight}px` }], {
                      duration: 300,
                    }).finished.finally(done)
                  }}
                  onExit={(el, done) => {
                    el.animate([{ height: `${el.scrollHeight}px` }, { height: '0px' }], {
                      duration: 300,
                    }).finished.finally(done)
                  }}
                >
                  <Show when={activeKey().includes(item.key) && item.children !== false}>
                    <div class="overflow-hidden">
                      <div
                        class={cs(
                          'p-[--ant-collapse-content-padding]',
                          type() === 'card' && '[border-top:1px_solid_var(--ant-color-border)]',
                        )}
                      >
                        {unwrapStringOrJSXElement(item.children as StringOrJSXElement)}
                      </div>
                    </div>
                  </Show>
                </Transition>
              </div>
            </>
          )}
        </For>
      </Element>
    </Show>
  )
}

export default Collapse
