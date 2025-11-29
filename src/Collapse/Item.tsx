import {
  type Accessor,
  type Component,
  type JSX,
  mergeProps,
  type ParentProps,
  Show,
  useContext,
} from 'solid-js'
import cs from 'classnames'
import { Transition } from 'solid-transition-group'
import { Dynamic } from 'solid-js/web'
import { unwrapStringOrJSXElement } from '../utils/solid'
import { type StyleProps, type StringOrJSXElement } from '../types'
import { type CollapseProps } from '.'
import createControllableValue from '../hooks/createControllableValue'
import Element from '../Element'
import CollapseContext from './context'
import useComponentSize from '../hooks/useComponentSize'
import { getElementClass, getElementCssVariables } from './utils'

export interface CollapseItemProps extends ParentProps, StyleProps {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  label: StringOrJSXElement
  /**
   * 类型
   * 默认 'line'
   */
  type?: 'line' | 'card'
  bordered?: boolean
  /**
   * 设置折叠面板大小
   * 默认 'middle'
   */
  size?: 'small' | 'middle' | 'large'
  /**
   * 自定义渲染每个面板右上角的内容
   */
  extra?: StringOrJSXElement
  /**
   * 是否禁用 children
   */
  disabledChildren?: boolean
  /**
   * 自定义切换图标
   * 为 false 代表不显示图标
   */
  expandIcon?: boolean | ((options: { isActive: Accessor<boolean> }) => JSX.Element)
  /**
   * 设置图标位置
   * 默认 'left'
   */
  expandIconPosition?: 'left' | 'right' | 'end'
  /**
   * collapse header style
   */
  headerStyle?: JSX.CSSProperties
  bodyStyle?: JSX.CSSProperties
}

const CollapseItem: Component<CollapseItemProps> = _props => {
  const props = mergeProps(
    {
      type: 'line',
      bordered: true,
      expandIconPosition: 'left',
    } as const,
    _props,
  )
  const { list } = useContext(CollapseContext)
  const size = useComponentSize(() => props.size)
  const [open, setOpen] = createControllableValue<boolean | undefined>(props, {
    defaultValuePropName: 'defaultOpen',
    valuePropName: 'open',
    trigger: 'onOpenChange',
  })

  const getExpandIcon = (position: Required<CollapseProps>['expandIconPosition']) => {
    return (
      <Show
        when={
          !props.disabledChildren &&
          props.expandIcon !== false &&
          props.expandIconPosition === position
        }
      >
        {typeof props.expandIcon === 'function' ? (
          props.expandIcon({ isActive: () => !!open() })
        ) : (
          <span
            class={cs('i-ant-design:right-outlined', 'duration-.3s', open() && 'rotate-[90deg]')}
          />
        )}
      </Show>
    )
  }

  return (
    <Dynamic
      component={list ? 'div' : Element}
      class={list ? props.class : cs(getElementClass(props.type), props.class)}
      style={{
        ...(list ? {} : getElementCssVariables(props.type, size())),
        ...props.style,
      }}
    >
      <div
        class={cs(
          'text-[--ant-color-text-heading] flex justify-between items-center cursor-pointer',
          props.type === 'card' &&
            'bg-[var(--ant-collapse-header-bg)] p-[--ant-collapse-header-padding]',
        )}
        style={props.headerStyle}
        onClick={() => {
          if (props.disabledChildren) return
          setOpen(!open())
        }}
      >
        <span class="inline-flex items-center gap-[--ant-margin-sm]">
          {getExpandIcon('left')}
          <span>{unwrapStringOrJSXElement(props.label)}</span>
          {getExpandIcon('right')}
        </span>

        <span class="inline-flex items-center gap-[--ant-margin-sm]">
          <span>{unwrapStringOrJSXElement(props.extra)}</span>
          {getExpandIcon('end')}
        </span>
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
        <Show when={open()}>
          <div class="overflow-hidden">
            <div
              class={cs(
                'p-[--ant-collapse-content-padding]',
                props.type === 'card' && '[border-top:1px_solid_var(--ant-color-border)]',
              )}
              style={props.bodyStyle}
            >
              {props.children}
            </div>
          </div>
        </Show>
      </Transition>
    </Dynamic>
  )
}

export default CollapseItem
