import { type ParentProps, type Component, Show, mergeProps, createMemo, children } from 'solid-js'
import cs from 'classnames'
import { useSize } from '../hooks'
import Element from '../Element'
import { type StyleProps } from '../types'

export interface DividerProps extends ParentProps, StyleProps {
  dashed?: boolean
  /**
   * 分割线标题的位置
   * 默认 'center'
   */
  orientation?: 'left' | 'right' | 'center'
  /**
   * 水平还是垂直类型
   * 默认 'horizontal'
   */
  type?: 'horizontal' | 'vertical'
}

const Divider: Component<DividerProps> = _props => {
  const props = mergeProps(
    {
      orientation: 'center',
      type: 'horizontal',
    } as const,
    _props,
  )

  let container: HTMLDivElement | undefined
  const containerSize = useSize(() => container)
  const containerWidth = createMemo(() => containerSize()?.width ?? 0)

  let childrenRef: HTMLSpanElement | undefined
  const childrenSize = useSize(() => childrenRef)
  const childrenWidth = createMemo(() => childrenSize()?.width ?? 0)

  const orientationMargin = 0.05

  const childrenStart = createMemo(
    () =>
      ({
        left: containerWidth() * orientationMargin,
        center: containerWidth() / 2 - childrenWidth() / 2,
        right: containerWidth() * (1 - orientationMargin) - childrenWidth(),
      })[props.orientation]!,
  )

  const resolvedChildren = children(() => props.children)

  return (
    <Show
      when={resolvedChildren() && props.type === 'horizontal'}
      fallback={
        <Element
          class={cs(
            props.class,
            'border-[--ant-color-split]',
            props.type === 'horizontal'
              ? 'my-[--ant-margin-lg] border-width-[1px_0_0]'
              : 'mx-[--ant-margin-xs] inline-block border-width-[0_1px_0_0] h-0.9em [vertical-align:middle]',
            props.dashed ? 'border-dashed' : 'border-solid',
          )}
          style={props.style}
        />
      }
    >
      <Element
        ref={container}
        class={cs(
          props.class,
          'my-[var(--ant-margin)] flex items-center relative',
          [
            'before:content-empty before:block before:absolute before:left-0 before:w-[var(--ant-divider-children-start)] before:border-width-[1px_0_0] before:border-[var(--ant-color-split)]',
            props.dashed ? 'before:border-dashed' : 'before:border-solid',
          ],
          [
            'after:content-empty after:block after:absolute after:left-[var(--ant-divider-children-end)] after:right-0 after:border-width-[1px_0_0] after:border-[var(--ant-color-split)]',
            props.dashed ? 'after:border-dashed' : 'after:border-solid',
          ],
        )}
        style={{
          '--ant-divider-text-padding-inline': '1em',
          '--ant-divider-children-start': `${childrenStart()}px`,
          '--ant-divider-children-end': `${childrenStart() + childrenWidth()}px`,
          ...props.style,
        }}
      >
        <span
          ref={childrenRef}
          class="inline-block px-[var(--ant-divider-text-padding-inline)]"
          style={{
            transform: `translateX(${childrenStart()}px)`,
          }}
        >
          {resolvedChildren()}
        </span>
      </Element>
    </Show>
  )
}

export default Divider
