import { type JSXElement, type Component, For, Show, createEffect } from 'solid-js'
import cs from 'classnames'
import { type Key } from '../types'
import createControllableValue from '../hooks/createControllableValue'

export interface CollapseItem {
  key: Key
  label: JSXElement
  children: JSXElement
}

export interface CollapseProps {
  defaultActiveKey?: Key[]
  activeKey?: Key[]
  items: CollapseItem[]
}

const Collapse: Component<CollapseProps> = props => {
  const [activeKey, setActiveKey] = createControllableValue<Key[]>(props, {
    defaultValuePropName: 'defaultActiveKey',
    valuePropName: 'activeKey',
    defaultValue: [],
  })
  createEffect(() => {
    console.log('activeKey', activeKey())
  })
  return (
    <div class="ant-rounded-[var(--ant-border-radius-lg)] ant-[border:1px_solid_var(--ant-color-border)] ant-border-b-0">
      <For each={props.items}>
        {item => (
          <div class="ant-[border-bottom:1px_solid_var(--ant-color-border)] first:ant-rounded-t-[var(--ant-border-radius-lg)] last:ant-rounded-b-[var(--ant-border-radius-lg)]">
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
            <Show when={activeKey().includes(item.key)}>
              <div class="ant-p-[var(--ant-padding-sm)] ant-[border-top:1px_solid_var(--ant-color-border)]">
                {item.children}
              </div>
            </Show>
          </div>
        )}
      </For>
    </div>
  )
}

export default Collapse
