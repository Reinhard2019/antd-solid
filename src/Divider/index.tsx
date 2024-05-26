import { type ParentProps, type Component, Show, mergeProps, createMemo } from 'solid-js'
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
}

const Divider: Component<DividerProps> = _props => {
  const props = mergeProps(
    {
      orientation: 'center',
    },
    _props,
  )

  let container: HTMLDivElement | undefined
  const containerSize = useSize(() => container)
  const containerWidth = createMemo(() => containerSize()?.width ?? 0)

  let children: HTMLSpanElement | undefined
  const childrenSize = useSize(() => children)
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

  return (
    <Show
      when={props.children}
      fallback={
        <Element
          class={cs(
            props.class,
            'my-[var(--ant-margin-lg)] border-width-[1px_0_0] border-[var(--ant-color-split)]',
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
          ref={children}
          class="inline-block px-[var(--ant-divider-text-padding-inline)]"
          style={{
            transform: `translateX(${childrenStart()}px)`,
          }}
        >
          {props.children}
        </span>
      </Element>
    </Show>
  )
}

export default Divider
