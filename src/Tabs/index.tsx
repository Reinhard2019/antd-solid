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
import { Dynamic } from 'solid-js/web'
import Segmented from '../Segmented'
import { type StyleProps, type StringOrJSXElement, type ComponentSize, type Key } from '../types'
import { unwrapStringOrJSXElement } from '../utils/solid'
import DelayShow from '../DelayShow'
import Element from '../Element'
import createControllableValue from '../hooks/createControllableValue'
import useComponentSize from '../hooks/useComponentSize'

export interface TabItem {
  key: Key
  label: StringOrJSXElement
  children?: StringOrJSXElement
}

export interface TabsProps extends StyleProps {
  /**
   * 默认 'line'
   */
  type?: 'line' | 'card' | 'segment'
  /**
   * 默认 'top'
   * 对于 'segment' 类型不生效
   */
  placement?: 'top' | 'bottom' | 'left' | 'right'
  /**
   * 大小，提供 large middle 和 small 三种大小
   * 默认 'middle'
   */
  size?: ComponentSize
  navClass?: string
  navItemClass?: string
  contentClass?: string
  defaultActiveKey?: string
  /**
   * 当前激活 tab 面板的 key
   */
  activeKey?: Key
  /**
   * 切换面板的回调
   * @param activeKey
   * @returns
   */
  onChange?: (activeKey: string) => void
  items: TabItem[]
  addonBefore?: JSX.Element
  addonAfter?: JSX.Element
  disabled?: boolean
  /**
   * 被隐藏时是否销毁 DOM 结构
   */
  destroyInactiveTabPane?: boolean
  /** tab bar 的样式对象 */
  tabBarStyle?: JSX.CSSProperties
}

const Tabs: Component<TabsProps> = _props => {
  const props = mergeProps(
    {
      type: 'line',
      placement: 'top',
      disabled: false,
    } as const,
    _props,
  )

  const size = useComponentSize(() => props.size)
  const [activeKey, setActiveKey] = createControllableValue<Key>(props, {
    defaultValuePropName: 'defaultActiveKey',
    valuePropName: 'activeKey',
    trigger: 'onChange',
    defaultValue: untrack(() => props.items[0]?.key),
  })
  const isSelectedItem = createSelector(() => activeKey())
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
    <Element
      class={cs(
        props.class,
        'flex [font-size:var(--ant-font-size)] text-[var(--ant-color-text)] leading-[var(--ant-line-height)]',
        props.placement === 'top' && 'flex-col',
        props.placement === 'bottom' && 'flex-col-reverse',
        props.placement === 'right' && 'flex-row-reverse',
      )}
      style={{
        // nav 和 content 之间的间隔
        '--ant-tabs-gap': 'var(--ant-margin)',
        ...props.style,
      }}
    >
      <div
        class={cs(
          'shrink-0 flex items-center gap-16px',
          props.navClass,
          props.type === 'segment'
            ? 'mb-[--ant-tabs-gap]'
            : [
              'border-solid border-[var(--ant-color-border-secondary)] border-0',
              props.placement === 'top' && '!border-b-1px mb-[--ant-tabs-gap]',
              props.placement === 'bottom' && '!border-t-1px mt-[--ant-tabs-gap]',
              props.placement === 'left' && '!border-r-1px mr-[--ant-tabs-gap]',
              props.placement === 'right' && '!border-l-1px ml-[--ant-tabs-gap]',
              (props.placement === 'left' || props.placement === 'right') && 'flex-col',
            ],
          {
            small: '[font-size:var(--ant-font-size)]',
            middle: '[font-size:var(--ant-font-size)]',
            large: '[font-size:var(--ant-font-size-lg)]',
          }[size()],
        )}
        style={props.tabBarStyle}
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
                      (props.placement === 'top' || props.placement === 'bottom') &&
                        {
                          small: 'py-[--ant-padding-xs]',
                          middle: 'py-[--ant-padding-sm]',
                          large: 'py-[--ant-padding]',
                        }[size()],
                      (props.placement === 'left' || props.placement === 'right') &&
                        'px-24px py-8px',
                    )}
                    aria-label={isSelectedItem(item.key) ? 'selected' : undefined}
                    onClick={() => {
                      setActiveKey(item.key)
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
              size={size()}
              disabled={props.disabled}
              value={activeKey()}
              onChange={key => {
                setActiveKey(key as string)
              }}
              options={props.items.map(item => ({
                label: item.label,
                value: item.key,
              }))}
            />
          </Match>
          <Match when={props.type === 'card'}>
            <div
              class={cs(
                'grow flex gap-2px relative',
                (props.placement === 'left' || props.placement === 'right') && 'flex-col',
              )}
            >
              <For each={props.items}>
                {item => (
                  <div
                    class={cs(
                      {
                        small: 'py-6px',
                        middle: 'py-8px',
                        large: 'py-8px',
                      }[size()],
                      'px-16px cursor-pointer border-solid border-[var(--ant-color-border-secondary)] border-1px relative',
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
                      setActiveKey(item.key)
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
          <Dynamic
            component={props.destroyInactiveTabPane ? Show : DelayShow}
            when={isSelectedItem(item.key)}
          >
            <div
              class={cs(props.contentClass, 'grow')}
              style={{ display: isSelectedItem(item.key) ? 'block' : 'none' }}
            >
              {unwrapStringOrJSXElement(item.children)}
            </div>
          </Dynamic>
        )}
      </For>
    </Element>
  )
}

export default Tabs
