import {
  type Component,
  For,
  createSelector,
  createSignal,
  untrack,
  type JSX,
  onCleanup,
  mergeProps,
  Switch,
  Match,
  createEffect,
  on,
  children,
  Show,
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
  /**
   * 默认 'top'
   * 对于 'segment' 类型不生效
   */
  placement?: 'top' | 'bottom' | 'left' | 'right'
  class?: string
  style?: JSX.CSSProperties
  navClass?: string
  navItemClass?: string
  contentClass?: string
  items: Tab[]
  addonBefore?: JSX.Element
  addonAfter?: JSX.Element
}

const Tabs: Component<TabsProps> = _props => {
  const props = mergeProps(
    {
      type: 'line',
      placement: 'top',
    } as const,
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

  let lineNav: HTMLDivElement | undefined
  const updateSelectedBarStyle = () => {
    if (!lineNav) return

    const el = lineNav.querySelector<HTMLElement>(':scope > [aria-label="selected"]')
    if (!el) return

    if (props.placement === 'top' || props.placement === 'bottom') {
      setSelectedBarStyle({
        left: `${el.offsetLeft}px`,
        width: `${el.clientWidth}px`,
      })
    } else {
      setSelectedBarStyle({
        top: `${el.offsetTop}px`,
        height: `${el.clientHeight}px`,
      })
    }
  }
  createEffect(
    on([() => props.type, () => props.placement], () => {
      if (!lineNav) return

      updateSelectedBarStyle()

      const resizeObserver = new ResizeObserver(() => {
        updateSelectedBarStyle()
      })

      resizeObserver.observe(lineNav)
      onCleanup(() => {
        resizeObserver.disconnect()
      })
    }),
  )

  const resolvedAddonBefore = children(() => props.addonBefore)
  const resolvedAddonAfter = children(() => props.addonAfter)

  return (
    <div
      class={cs(
        props.class,
        'flex',
        props.placement === 'top' && 'flex-col',
        props.placement === 'bottom' && 'flex-col-reverse',
        props.placement === 'right' && 'flex-row-reverse',
      )}
      style={props.style}
    >
      <div
        class={cs(
          'shrink-0 flex items-center gap-16px',
          props.navClass,
          props.type === 'segment'
            ? 'mb-16px'
            : [
              'border-solid border-[var(--ant-color-border-secondary)] border-0',
              props.placement === 'top' && '!border-b-1px mb-16px',
              props.placement === 'bottom' && '!border-t-1px mt-16px',
              props.placement === 'left' && '!border-r-1px mr-16px',
              props.placement === 'right' && '!border-l-1px ml-16px',
              (props.placement === 'left' || props.placement === 'right') && 'flex-col',
            ],
        )}
      >
        <Show when={resolvedAddonBefore()}>
          <div>{resolvedAddonBefore()}</div>
        </Show>

        <Switch>
          <Match when={props.type === 'line'}>
            <div
              ref={lineNav!}
              class={cs(
                'grow flex relative',
                (props.placement === 'top' || props.placement === 'bottom') && 'gap-32px',
                (props.placement === 'left' || props.placement === 'right') && 'flex-col gap-16px',
                props.navClass,
              )}
            >
              <For each={props.items}>
                {item => (
                  <div
                    class={cs(
                      'cursor-pointer',
                      'hover:text-[var(--ant-color-primary)]',
                      props.navItemClass,
                      isSelectedItem(item.key) && 'text-[var(--ant-color-primary)]',
                      (props.placement === 'top' || props.placement === 'bottom') && 'py-12px',
                      (props.placement === 'left' || props.placement === 'right') &&
                        'px-24px py-8px',
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
                class={cs(
                  'absolute bg-[var(--ant-color-primary)] transition-left,top',
                  props.placement === 'top' && '-bottom-1px',
                  props.placement === 'bottom' && '-top-1px',
                  props.placement === 'left' && '-right-1px',
                  props.placement === 'right' && '-left-1px',
                  (props.placement === 'top' || props.placement === 'bottom') && 'h-2px',
                  (props.placement === 'left' || props.placement === 'right') && 'w-2px',
                )}
                style={selectedBarStyle()}
              />
            </div>
          </Match>
          <Match when={props.type === 'segment'}>
            <Segmented
              class="grow"
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
              class={cs(
                'grow flex gap-2px relative',
                (props.placement === 'left' || props.placement === 'right') && 'flex-col',
                props.navClass,
              )}
            >
              <For each={props.items}>
                {item => (
                  <div
                    class={cs(
                      'px-16px py-8px cursor-pointer border-solid border-[var(--ant-color-border-secondary)] border-1px relative',
                      'hover:text-[var(--ant-color-primary)]',
                      props.placement === 'top' &&
                        'rounded-t-[var(--ant-border-radius-lg)] !border-b-0px',
                      props.placement === 'bottom' &&
                        'rounded-b-[var(--ant-border-radius-lg)] !border-t-0px',
                      props.placement === 'left' &&
                        'rounded-l-[var(--ant-border-radius-lg)] !border-r-0px',
                      props.placement === 'right' &&
                        'rounded-r-[var(--ant-border-radius-lg)] !border-l-0px',
                      props.navItemClass,
                      isSelectedItem(item.key)
                        ? [
                          'text-[var(--ant-color-primary)] bg-[var(--ant-color-bg-container)]',
                          [
                            'after:content-empty after:block after:absolute after:bg-inherit',
                            props.placement === 'top' && 'after:bottom--1px',
                            props.placement === 'bottom' && 'after:top--1px',
                            props.placement === 'left' && 'after:right--1px',
                            props.placement === 'right' && 'after:left--1px',
                            (props.placement === 'top' || props.placement === 'bottom') &&
                                'after:left-0 after:right-0 after:h-1px',
                            (props.placement === 'left' || props.placement === 'right') &&
                                'after:top-0 after:bottom-0 after:w-1px',
                          ],
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

        <Show when={resolvedAddonAfter()}>
          <div>{resolvedAddonAfter()}</div>
        </Show>
      </div>

      <For each={props.items}>
        {item => (
          <DelayShow when={isSelectedItem(item.key)}>
            <div
              class={cs(props.contentClass, 'grow')}
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
