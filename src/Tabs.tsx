import {
  type Component,
  For,
  createSelector,
  createSignal,
  onMount,
  untrack,
  type JSX,
  onCleanup,
  mergeProps,
  Switch,
  Match,
} from 'solid-js'
import cs from 'classnames'
import Segmented from './Segmented'
import { type StringOrJSXElement } from './types'
import { unwrapStringOrJSXElement } from './utils/solid'

export interface Tab {
  key: string
  label: StringOrJSXElement
  children?: StringOrJSXElement
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

  let nav: HTMLDivElement | undefined
  const updateSelectedBarStyle = () => {
    if (!nav) return

    const el = nav.querySelector(':scope > .selected')!
    if (!el) return

    setSelectedBarStyle({
      left: `${el.offsetLeft}px`,
      width: `${el.clientWidth}px`,
    })
  }
  onMount(() => {
    if (!nav) return

    updateSelectedBarStyle()

    const resizeObserver = new ResizeObserver(() => {
      updateSelectedBarStyle()
    })

    resizeObserver.observe(nav)
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
                  {unwrapStringOrJSXElement(item.label)}
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
            options={props.items.map(item => ({
              label: item.label,
              value: item.key,
              onClick: () => setSelectedItem(item),
            }))}
          />
        </Match>
      </Switch>

      <div class={props.contentClass}>{unwrapStringOrJSXElement(selectedItem()?.children)}</div>
    </div>
  )
}

export default Tabs
