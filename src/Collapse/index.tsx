import { type Component, For, mergeProps, Show } from 'solid-js'
import cs from 'classnames'
import { Transition } from 'solid-transition-group'
import { type StringOrJSXElement, type Key, type StyleProps } from '../types'
import createControllableValue from '../hooks/createControllableValue'
import { unwrapStringOrJSXElement } from '../utils/solid'
import Element from '../Element'

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
   * @param value
   * @returns
   */
  onChange?: (value: Key[]) => void
  items: CollapseItem[]
  /**
   * 设置折叠面板大小
   * 默认 'middle'
   */
  size?: 'small' | 'middle' | 'large'
}

const Collapse: Component<CollapseProps> = _props => {
  const props = mergeProps(
    {
      size: 'middle',
    },
    _props,
  )
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
              class={cs(
                'bg-[var(--ant-collapse-header-bg)] text-[var(--ant-color-text-heading)] flex justify-between items-center',
                {
                  small: 'py-[--ant-padding-xs] px-[--ant-padding-sm]',
                  middle: 'p-[var(--ant-collapse-header-padding)]',
                  large: 'py-[--ant-padding] px-[--ant-padding-lg]',
                }[props.size],
              )}
              onClick={() => {
                if (item.children === false) return

                setActiveKey(keys => {
                  if (keys.includes(item.key)) {
                    return keys.filter(key => key !== item.key)
                  }
                  return [...keys, item.key]
                })
              }}
            >
              <span>
                <Show when={item.children !== false}>
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
              <Show when={activeKey().includes(item.key) && item.children !== false}>
                <div class="overflow-hidden">
                  <div
                    class={cs(
                      '[border-top:1px_solid_var(--ant-color-border)]',
                      {
                        small: 'p-[--ant-padding-sm]',
                        middle: 'p-[--ant-collapse-content-padding]',
                        large: 'p-[--ant-padding-lg]',
                      }[props.size],
                    )}
                  >
                    {unwrapStringOrJSXElement(item.children as StringOrJSXElement)}
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
