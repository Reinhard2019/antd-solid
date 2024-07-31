import { children, type Component, type JSX, type ParentProps, Show, useContext } from 'solid-js'
import cs from 'classnames'
import { Transition } from 'solid-transition-group'
import { type StyleProps } from '../types'
import CollapseContext, { CollapseItemContext } from './context'

export interface CollapseItemProps extends StyleProps, ParentProps {
  label: JSX.Element
  /**
   * 自定义渲染每个面板右上角的内容
   */
  extra?: JSX.Element
  disabledChildren?: boolean
}

const CollapseItem: Component<CollapseItemProps> = props => {
  const { type, activeItems, setActiveItems } = useContext(CollapseContext)
  const { item, index } = useContext(CollapseItemContext)
  const resolvedChildren = children(() => props.children)
  const resolvedExtra = children(() => props.extra)

  return (
    <>
      <Show when={index() !== 0}>
        <div
          class={cs(
            'h-1px bg-[var(--ant-color-split)]',
            type() === 'line' && 'm-[--ant-collapse-divider-margin]',
          )}
        />
      </Show>

      <div class={props.class} style={props.style}>
        <div
          class={cs(
            'text-[--ant-color-text-heading] flex justify-between items-center cursor-pointer',
            type() === 'card' &&
              'bg-[var(--ant-collapse-header-bg)] p-[--ant-collapse-header-padding]',
          )}
          onClick={() => {
            if (props.disabledChildren) return

            if (activeItems().includes(item)) {
              setActiveItems(activeItems().filter(key => key !== item))
              return
            }
            setActiveItems([...activeItems(), item])
          }}
        >
          <span>
            <Show when={!props.disabledChildren}>
              <span
                class={cs(
                  'i-ant-design:right-outlined',
                  'mr-[var(--ant-margin-sm)] duration-.3s',
                  activeItems().includes(item) && 'rotate-[90deg]',
                )}
              />
            </Show>
            {props.label}
          </span>

          <Show when={resolvedExtra()}>
            <span>{resolvedExtra()}</span>
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
          <Show when={activeItems().includes(item) && !props.disabledChildren}>
            <div class="overflow-hidden">
              <div
                class={cs(
                  'p-[--ant-collapse-content-padding]',
                  type() === 'card' && '[border-top:1px_solid_var(--ant-color-border)]',
                )}
              >
                {resolvedChildren()}
              </div>
            </div>
          </Show>
        </Transition>
      </div>
    </>
  )
}

export default CollapseItem
