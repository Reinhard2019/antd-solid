import { type Component, type JSXElement, Show } from 'solid-js'
import Tooltip, { Content, type TooltipProps } from './Tooltip'

interface PopoverProps extends TooltipProps {
  title?: JSXElement
}

const Popover: Component<PopoverProps> = props => {
  return (
    <Tooltip
      mode="light"
      {...props}
      content={close => (
        <div>
          <Show when={props.title}>
            <div class="mb-8px flex items-center">
              <span class="text-[rgba(0,0,0,0.88)] font-600">{props.title}</span>
            </div>
          </Show>

          <div class="text-[rgba(0,0,0,0.88)]">
            <Content content={props.content} close={close} />
          </div>
        </div>
      )}
    />
  )
}

export default Popover
