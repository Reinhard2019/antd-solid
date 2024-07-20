import { type Component, createMemo, For, mergeProps, Show, useContext } from 'solid-js'
import cs from 'classnames'
import { Transition } from 'solid-transition-group'
import { type StringOrJSXElement, type Key, type StyleProps } from '../types'
import createControllableValue from '../hooks/createControllableValue'
import { unwrapStringOrJSXElement } from '../utils/solid'
import Element from '../Element'
import ConfigProviderContext from '../ConfigProvider/context'

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
   * 带边框风格的折叠面板
   * 默认 true
   */
  bordered?: boolean
}

const Collapse: Component<CollapseProps> = _props => {
  const { componentSize } = useContext(ConfigProviderContext)
  const props = mergeProps(
    {
      bordered: true,
    } as const,
    _props,
  )
  const size = createMemo(() => props.size ?? componentSize())
  const [activeKey, setActiveKey] = createControllableValue<Key[]>(props, {
    defaultValuePropName: 'defaultActiveKey',
    valuePropName: 'activeKey',
    defaultValue: [],
  })

  return (
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
      <For each={props.items}>
        {item => (
          <div
            class={cs(
              props.bordered &&
                '[&:not(:last-child)]:[border-bottom:1px_solid_var(--ant-color-border)]',
              item.class,
            )}
            style={item.style}
          >
            <div
              class={cs(
                'bg-[var(--ant-collapse-header-bg)] text-[var(--ant-color-text-heading)] flex justify-between items-center cursor-pointer',
                {
                  small: 'py-[--ant-padding-xs] px-[--ant-padding-sm]',
                  middle: 'p-[var(--ant-collapse-header-padding)]',
                  large: 'py-[--ant-padding] px-[--ant-padding-lg]',
                }[size()],
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
                      props.bordered &&
                        '[border-top:1px_solid_var(--ant-color-border)] p-[--ant-collapse-content-padding]',
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
