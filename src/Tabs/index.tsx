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
  /**
   * 是否允许清空 activeKey
   */
  allowClear?: boolean
}

const Tabs: Component<TabsProps> = _props => {
  const props = mergeProps(
    {
      type: 'line',
      placement: 'top',
      allowClear: false,
    } as const,
    _props,
  )

  const [activeKey, setActiveKey] = createSignal<string | undefined>(
    untrack(() => props.items[0]?.key),
  )
  const [clear, setClear] = createSignal(false)
  const isActiveKey = createSelector(activeKey)
  const [activeBarStyle, setActiveBarStyle] = createSignal<JSX.CSSProperties>({
    left: '0px',
    width: '0px',
  })
  const onTabClick = (item: Tab) => {
    if (props.allowClear && isActiveKey(item.key)) {
      setClear(v => !v)
      return
    }

    setActiveKey(item.key)
    setClear(false)
  }

  let lineNav: HTMLDivElement | undefined
  const updateActiveBarStyle = () => {
    if (!lineNav) return

    const el = lineNav.querySelector<HTMLElement>(':scope > [aria-label="selected"]')
    if (!el) return

    if (props.placement === 'top' || props.placement === 'bottom') {
      setActiveBarStyle({
        left: `${el.offsetLeft}px`,
        width: `${el.clientWidth}px`,
      })
    } else {
      setActiveBarStyle({
        top: `${el.offsetTop}px`,
        height: `${el.clientHeight}px`,
      })
    }
  }
  createEffect(
    on([() => props.type, () => props.placement], () => {
      if (!lineNav) return

      updateActiveBarStyle()

      const resizeObserver = new ResizeObserver(() => {
        updateActiveBarStyle()
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
                      isActiveKey(item.key) && !clear() && 'text-[var(--ant-color-primary)]',
                      (props.placement === 'top' || props.placement === 'bottom') && 'py-12px',
                      (props.placement === 'left' || props.placement === 'right') &&
                        'px-24px py-8px',
                    )}
                    aria-label={isActiveKey(item.key) && !clear() ? 'selected' : undefined}
                    onClick={() => {
                      onTabClick(item)
                      updateActiveBarStyle()
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
                  clear() && 'hidden',
                )}
                style={activeBarStyle()}
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
                onClick: () => {
                  onTabClick(item)
                },
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
                      isActiveKey(item.key) && !clear()
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
                      onTabClick(item)
                      updateActiveBarStyle()
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
        {item => {
          let ref: HTMLDivElement | undefined
          createEffect(
            on([clear, () => isActiveKey(item.key)], (input, prevInput) => {
              if (input[1] !== prevInput?.[1]) {
                ref?.style.removeProperty('width')
                ref?.style.removeProperty('height')
              }

              if (input[0] === prevInput?.[0] || !input[1] || !ref) return

              if (props.placement === 'top' || props.placement === 'bottom') {
                if (clear()) {
                  ref.style.height = `${ref.scrollHeight}px`
                  requestAnimationFrame(() => {
                    ref!.style.height = '0px'
                  })
                } else {
                  ref.style.height = '0px'
                  requestAnimationFrame(() => {
                    ref!.style.height = `${ref!.scrollHeight}px`
                  })
                  const onTransitionEnd = () => {
                    ref!.style.removeProperty('height')
                    ref!.removeEventListener('transitionend', onTransitionEnd)
                  }
                  ref.addEventListener('transitionend', onTransitionEnd)
                }
              } else {
                if (clear()) {
                  ref.style.width = `${ref.scrollWidth}px`
                  requestAnimationFrame(() => {
                    ref!.style.width = '0px'
                  })
                } else {
                  ref.style.width = '0px'
                  requestAnimationFrame(() => {
                    ref!.style.width = `${ref!.scrollWidth}px`
                  })
                  const onTransitionEnd = () => {
                    ref!.style.removeProperty('width')
                    ref!.removeEventListener('transitionend', onTransitionEnd)
                  }
                  ref.addEventListener('transitionend', onTransitionEnd)
                }
              }
            }),
          )

          return (
            <DelayShow when={isActiveKey(item.key) && !clear()}>
              <div
                ref={ref}
                class={cs(
                  props.contentClass,
                  'grow transition-height transition-300 overflow-hidden',
                )}
                style={{ display: isActiveKey(item.key) ? 'block' : 'none' }}
              >
                {unwrapStringOrJSXElement(item.children)}
              </div>
            </DelayShow>
          )
        }}
      </For>
    </div>
  )
}

export default Tabs
