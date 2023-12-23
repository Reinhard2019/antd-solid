import { type JSX, type JSXElement, type Component, For, Show } from 'solid-js'
import cs from 'classnames'
import { Transition } from 'solid-transition-group'
import { type Key } from '../types'
import createControllableValue from '../hooks/createControllableValue'

export interface CollapseItem {
  key: Key
  label: JSXElement
  children: JSXElement
}

export interface CollapseProps {
  class?: string
  defaultActiveKey?: Key[]
  activeKey?: Key[]
  items: CollapseItem[]
  style?: JSX.CSSProperties
}

const Collapse: Component<CollapseProps> = props => {
  const [activeKey, setActiveKey] = createControllableValue<Key[]>(props, {
    defaultValuePropName: 'defaultActiveKey',
    valuePropName: 'activeKey',
    defaultValue: [],
  })

  return (
    <div
      class={cs(
        'ant-rounded-[var(--ant-border-radius-lg)] ant-[border:1px_solid_var(--ant-color-border)] ant-border-b-0',
        props.class,
      )}
      style={props.style}
    >
      <For each={props.items}>
        {item => (
          <div class="ant-[border-bottom:1px_solid_var(--ant-color-border)] first:ant-rounded-t-[var(--ant-border-radius-lg)] last:ant-rounded-b-[var(--ant-border-radius-lg)] ant-cursor-pointer">
            <div
              class="ant-bg-[var(--ant-collapse-header-bg)] ant-text-[var(--ant-color-text-heading)] ant-p-[var(--ant-collapse-header-padding)]"
              onClick={() => {
                setActiveKey(keys => {
                  if (keys.includes(item.key)) {
                    return keys.filter(key => key !== item.key)
                  }
                  return [...keys, item.key]
                })
              }}
            >
              <span
                class={cs(
                  'i-ant-design:right-outlined',
                  'ant-mr-[var(--ant-margin-sm)] ant-duration-.3s',
                  activeKey().includes(item.key) && 'ant-rotate-[90deg]',
                )}
              />
              {item.label}
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
                <div class="ant-overflow-hidden">
                  <div class="ant-p-[var(--ant-padding-sm)] ant-[border-top:1px_solid_var(--ant-color-border)]">
                    {item.children}
                  </div>
                </div>
              </Show>
            </Transition>
          </div>
        )}
      </For>
    </div>
  )
}

export default Collapse
