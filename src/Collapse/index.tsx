import { type Component, createMemo, For, type JSX, mergeProps, Show, useContext } from 'solid-js'
import cs from 'classnames'
import { Transition } from 'solid-transition-group'
import { isEmpty } from 'lodash-es'
import { type StringOrJSXElement, type Key, type StyleProps } from '../types'
import createControllableValue from '../hooks/createControllableValue'
import { unwrapStringOrJSXElement } from '../utils/solid'
import Element from '../Element'
import ConfigProviderContext from '../ConfigProvider/context'

export interface CollapseItem extends StyleProps {
  key: Key
  label: StringOrJSXElement
  children: StringOrJSXElement
  /**
   * 自定义渲染每个面板右上角的内容
   */
  extra?: StringOrJSXElement
  disabledChildren?: boolean
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
}

const Collapse: Component<CollapseProps> = _props => {
  const { componentSize } = useContext(ConfigProviderContext)
  const props = mergeProps(
    {
      bordered: true,
    } as const,
    _props,
  )
  const type = createMemo(() => props.type ?? 'line')
  const size = createMemo(() => props.size ?? componentSize())
  const [activeKey, setActiveKey] = createControllableValue<Key[]>(props, {
    defaultValuePropName: 'defaultActiveKey',
    valuePropName: 'activeKey',
    defaultValue: [],
  })

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
                  onClick={() => {
                    if (item.disabledChildren) return

                    if (activeKey().includes(item.key)) {
                      setActiveKey(activeKey().filter(key => key !== item.key))
                      return
                    }
                    setActiveKey([...activeKey(), item.key])
                  }}
                >
                  <span>
                    <Show when={!item.disabledChildren}>
                      <span
                        class={cs(
                          'i-ant-design:right-outlined',
                          'mr-[var(--ant-margin-sm)] duration-.3s',
                          activeKey().includes(item.key) && 'rotate-[90deg]',
                        )}
                      />
                    </Show>
                    {unwrapStringOrJSXElement(item.label)}
                  </span>

                  <span>{unwrapStringOrJSXElement(item.extra)}</span>
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
                  <Show when={activeKey().includes(item.key) && !item.disabledChildren}>
                    <div class="overflow-hidden">
                      <div
                        class={cs(
                          'p-[--ant-collapse-content-padding]',
                          type() === 'card' && '[border-top:1px_solid_var(--ant-color-border)]',
                        )}
                      >
                        {unwrapStringOrJSXElement(item.children)}
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
