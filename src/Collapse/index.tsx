import { type Component, For, Show } from 'solid-js'
import cs from 'classnames'
import { Transition } from 'solid-transition-group'
import { type StringOrJSXElement, type Key, type StyleProps } from '../types'
import createControllableValue from '../hooks/createControllableValue'
import { unwrapStringOrJSXElement } from '../utils/solid'
import Element from '../Element'

export interface CollapseItem extends StyleProps {
  key: Key
  label: StringOrJSXElement
  children: StringOrJSXElement
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
   * @param value
   * @returns
   */
  onChange?: (value: Key[]) => void
  items: CollapseItem[]
}

const Collapse: Component<CollapseProps> = props => {
  const [activeKey, setActiveKey] = createControllableValue<Key[]>(props, {
    defaultValuePropName: 'defaultActiveKey',
    valuePropName: 'activeKey',
    defaultValue: [],
  })

  return (
    <Element
      class={cs(
        'rounded-[var(--ant-border-radius-lg)] [border:1px_solid_var(--ant-color-border)] [font-size:var(--ant-font-size)] text-[var(--ant-color-text)] leading-[var(--ant-line-height)]',
        props.class,
      )}
      style={props.style}
    >
      <For each={props.items}>
        {item => (
          <div
            class={cs(
              item.class,
              '[&:not(:last-child)]:[border-bottom:1px_solid_var(--ant-color-border)] first:rounded-t-[var(--ant-border-radius-lg)] last:rounded-b-[var(--ant-border-radius-lg)] cursor-pointer',
            )}
            style={item.style}
          >
            <div
              class="bg-[var(--ant-collapse-header-bg)] text-[var(--ant-color-text-heading)] p-[var(--ant-collapse-header-padding)] flex justify-between items-center"
              onClick={() => {
                setActiveKey(keys => {
                  if (keys.includes(item.key)) {
                    return keys.filter(key => key !== item.key)
                  }
                  return [...keys, item.key]
                })
              }}
            >
              <span>
                <span
                  class={cs(
                    'i-ant-design:right-outlined',
                    'mr-[var(--ant-margin-sm)] duration-.3s',
                    activeKey().includes(item.key) && 'rotate-[90deg]',
                  )}
                />
                {unwrapStringOrJSXElement(item.label)}
              </span>

              <Show when={item.extra}>
                <span>{unwrapStringOrJSXElement(item.extra)}</span>
              </Show>
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
              <Show when={activeKey().includes(item.key)}>
                <div class="overflow-hidden">
                  <div class="p-[var(--ant-collapse-content-padding)] [border-top:1px_solid_var(--ant-color-border)]">
                    {unwrapStringOrJSXElement(item.children)}
                  </div>
                </div>
              </Show>
            </Transition>
          </div>
        )}
      </For>
    </Element>
  )
}

export default Collapse
