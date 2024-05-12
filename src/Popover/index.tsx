import { type Component, type JSXElement, Show } from 'solid-js'
import Tooltip, { getContent, type TooltipProps } from '../Tooltip'

export interface PopoverProps extends TooltipProps {
  title?: JSXElement
}

const Popover: Component<PopoverProps> = props => {
  return (
    <Tooltip
      plain
      {...props}
      content={close => (
        <div>
          <Show when={props.title}>
            <div class="mb-8px flex items-center">
              <span class="font-600">{props.title}</span>
            </div>
          </Show>

          <div>{getContent(props.content, close)}</div>
        </div>
      )}
    />
  )
}

export default Popover
