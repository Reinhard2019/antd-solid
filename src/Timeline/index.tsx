import { type Accessor, type Component, For, type JSXElement } from 'solid-js'
import Element from '../Element'

interface TimelineItemProps {
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
    <Element class="flex flex-col gap-[16px]">
      <For each={props.items}>
        {(item, i) => (
          <div class="flex relative">
            {i() !== props.items.length - 1 && (
              <div class="absolute top-[8px] bottom-[-24px] left-[4px] w-[2px] bg-[rgba(5,5,5,.06)]" />
            )}
            <div class="w-[10px] h-[10px] border-solid border-width-[3px] border-[var(--ant-color-primary)] bg-white rounded-[50%] mt-[8px]" />
            <div class="ml-[8px]">{item.children?.()}</div>
          </div>
        )}
      </For>
    </Element>
  )
}

export default Timeline
