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
import Segmented from '../Segmented'
import { type StringOrJSXElement } from '../types'
import { unwrapStringOrJSXElement } from '../utils/solid'
import DelayShow from '../DelayShow'

export interface Tab {
  key: string
  label: StringOrJSXElement
  children?: StringOrJSXElement
}

export interface TabsProps {
  /**
   * 默认 'line'
   */
  type?: 'line' | 'card' | 'segment'
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

    const el = nav.querySelector<HTMLElement>(':scope > [aria-label="selected"]')
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
              'mb-16px flex gap-32px [border-bottom:solid_1px_var(--ant-color-border-secondary)] relative',
              props.navClass,
            )}
          >
            <For each={props.items}>
              {item => (
                <div
                  class={cs(
                    'py-12px cursor-pointer',
                    'hover:text-[var(--ant-color-primary)]',
                    props.navItemClass,
                    isSelectedItem(item.key) && 'text-[var(--ant-color-primary)]',
                  )}
                  aria-label={isSelectedItem(item.key) ? 'selected' : undefined}
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
              aria-label="selected-bar"
              class="absolute -bottom-1px bg-[var(--ant-color-primary)] h-2px transition-left"
              style={selectedBarStyle()}
            />
          </div>
        </Match>
        <Match when={props.type === 'segment'}>
          <Segmented
            class={cs('mb-16px', props.navClass)}
            block
            options={props.items.map(item => ({
              label: item.label,
              value: item.key,
              onClick: () => setSelectedItem(item),
            }))}
          />
        </Match>
        <Match when={props.type === 'card'}>
          <div
            ref={nav!}
            class={cs(
              'mb-16px flex gap-2px [border-bottom:solid_1px_var(--ant-color-border-secondary)] relative',
              props.navClass,
            )}
          >
            <For each={props.items}>
              {item => (
                <div
                  class={cs(
                    'px-16px py-8px cursor-pointer [border:solid_1px_var(--ant-color-border-secondary)] border-b-0px rounded-t-[var(--ant-border-radius-lg)] relative',
                    'hover:text-[var(--ant-color-primary)]',
                    props.navItemClass,
                    isSelectedItem(item.key)
                      ? [
                        'text-[var(--ant-color-primary)] bg-[var(--ant-color-bg-container)]',
                        'after:content-empty after:block after:absolute after:bg-inherit after:left-0 after:right-0 after:bottom--1px after:h-1px',
                      ]
                      : 'bg-[var(--ant-tabs-card-bg)]',
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
          </div>
        </Match>
      </Switch>

      <For each={props.items}>
        {item => (
          <DelayShow when={isSelectedItem(item.key)}>
            <div
              class={props.contentClass}
              style={{ display: isSelectedItem(item.key) ? 'block' : 'none' }}
            >
              {unwrapStringOrJSXElement(item.children)}
            </div>
          </DelayShow>
        )}
      </For>
    </div>
  )
}

export default Tabs
