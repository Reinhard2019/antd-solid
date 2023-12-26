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
  onCleanup,
  mergeProps,
  Switch,
  Match,
} from 'solid-js'
import cs from 'classnames'
import { isNil } from 'lodash-es'
import Segmented from './Segmented'

export interface Tab {
  key: string
  label: JSXElement
  children?: JSXElement
}

export interface TabsProps {
  type?: 'line' | 'segment'
  class?: string
  navClass?: string
  navItemClass?: string
  contentClass?: string
  items: Tab[]
}

const Tabs: Component<TabsProps> = _props => {
  const props = mergeProps(
    {
      type: 'line',
    } as TabsProps,
    _props,
  )

  const [selectedItem, setSelectedItem] = createSignal<Tab | undefined>(
    untrack(() => props.items[0]),
  )
  const isSelectedItem = createSelector(() => selectedItem()?.key)
  const [selectedBarStyle, setSelectedBarStyle] = createSignal<JSX.CSSProperties>({
    left: '0px',
    width: '0px',
  })
  const updateSelectedBarStyle = () => {
    const el = nav.querySelector(':scope > .selected') as HTMLElement
    if (!el) return

    setSelectedBarStyle({
      left: `${el.offsetLeft}px`,
      width: `${el.clientWidth}px`,
    })
  }

  let nav: HTMLDivElement
  onMount(() => {
    updateSelectedBarStyle()

    const resizeObserver = new ResizeObserver(() => {
      updateSelectedBarStyle()
    })

    resizeObserver.observe(nav!)
    onCleanup(() => {
      resizeObserver.disconnect()
    })
  })

  return (
    <div class={props.class}>
      <Switch>
        <Match when={props.type === 'line'}>
          <div
            ref={nav!}
            class={cs(
              'ant-mb-16px ant-flex ant-gap-32px ant-[border-bottom:solid_1px_rgba(5,5,5,0.1)] ant-relative',
              props.navClass,
            )}
          >
            <For each={props.items}>
              {item => (
                <div
                  class={cs(
                    'ant-py-12px ant-cursor-pointer',
                    props.navItemClass,
                    isSelectedItem(item.key) && 'ant-text-[var(--primary-color)] selected',
                  )}
                  onClick={() => {
                    setSelectedItem(item)
                    updateSelectedBarStyle()
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
        </Match>
        <Match when={props.type === 'segment'}>
          <Segmented
            block
            options={props.items.map(item => ({ label: item.label, value: item.key, onClick: () => setSelectedItem(item) }))}
          />
        </Match>
      </Switch>

      <Show when={!isNil(selectedItem()?.children)}>
        <div class={props.contentClass}>{selectedItem()?.children}</div>
      </Show>
    </div>
  )
}

export default Tabs
