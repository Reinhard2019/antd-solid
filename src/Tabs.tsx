import {
  type Component,
  For,
  type JSXElement,
  createSelector,
  createSignal,
  onMount,
  untrack,
  type JSX,
  Show,
} from 'solid-js'
import cs from 'classnames'
import { isNil } from 'lodash-es'

export interface Tab {
  key: string
  label: JSXElement
  children?: JSXElement
}

export interface TabsProps {
  class?: string
  navWrapClass?: string
  navItemClass?: string
  items: Tab[]
}

const Tabs: Component<TabsProps> = props => {
  const [selectedItem, setSelectedItem] = createSignal<Tab | undefined>(untrack(() => props.items[0]))
  const isSelectedItem = createSelector(() => selectedItem()?.key)
  const [selectedBarStyle, setSelectedBarStyle] = createSignal<JSX.CSSProperties>({
    left: '0px',
    width: '0px',
  })
  const updateSelectedBarStyle = (el: HTMLElement) => {
    setSelectedBarStyle({
      left: `${el.offsetLeft}px`,
      width: `${el.clientWidth}px`,
    })
  }

  let navWrap: HTMLDivElement
  onMount(() => {
    updateSelectedBarStyle(navWrap.children[0] as HTMLElement)
  })

  return (
    <div class={cs(props.class, 'ant-grid ant-[grid-template-rows:auto_1fr]')}>
      <div
        ref={navWrap!}
        class={cs(
          'ant-flex ant-gap-32px ant-[border-bottom:solid_1px_rgba(5,5,5,0.1)] ant-relative',
          props.navWrapClass,
        )}
      >
        <For each={props.items}>
          {item => (
            <div
              class={cs(
                'ant-py-12px ant-cursor-pointer',
                props.navItemClass,
                isSelectedItem(item.key) && 'ant-text-[var(--primary-color)]',
              )}
              onClick={e => {
                setSelectedItem(item)
                updateSelectedBarStyle(e.currentTarget)
              }}
            >
              {item.label}
            </div>
          )}
        </For>

        <div
          role={'selected-bar' as any}
          class="ant-absolute ant-bottom-0 ant-bg-[var(--primary-color)] ant-h-2px ant-transition-left"
          style={selectedBarStyle()}
        />
      </div>

      <Show when={!isNil(selectedItem()?.children)}>
        <div class="ant-px-12px ant-py-16px ant-overflow-auto">{selectedItem()?.children}</div>
      </Show>
    </div>
  )
}

export default Tabs
