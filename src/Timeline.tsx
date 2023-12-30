import { type Accessor, type Component, For, type JSXElement } from 'solid-js'
import { type TimelineItemProps as TimelineItemAntdProps } from 'antd'

interface TimelineItemProps extends Omit<TimelineItemAntdProps, 'children' | 'dot' | 'label'> {
  dot?: JSXElement
  label?: JSXElement
  children?: Accessor<JSXElement>
}

interface TimelineProps {
  class?: string
  items: TimelineItemProps[]
}

const Timeline: Component<TimelineProps> = props => {
  return (
    <div class="ant-flex ant-flex-col ant-gap-[16px]">
      <For each={props.items}>
        {(item, i) => (
          <div class="ant-flex ant-relative">
            {i() !== props.items.length - 1 && (
              <div class="ant-absolute ant-top-[8px] ant-bottom-[-24px] ant-left-[4px] ant-w-[2px] ant-bg-[rgba(5,5,5,.06)]" />
            )}
            <div class="ant-w-[10px] ant-h-[10px] ant-border-solid ant-border-width-[3px] ant-border-[var(--ant-color-primary)] ant-bg-white ant-rounded-[50%] ant-mt-[8px]" />
            <div class="ant-ml-[8px]">{item.children?.()}</div>
          </div>
        )}
      </For>
    </div>
  )
}

export default Timeline
