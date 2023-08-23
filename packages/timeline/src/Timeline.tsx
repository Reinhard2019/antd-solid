import type { Dayjs } from 'dayjs'
import { Accessor, Component, createMemo, createSignal, For, onMount } from 'solid-js'
import dayjs from './day'
import { TimelineItem } from './types'
import { createLayout } from './utils'
import { SignalObj } from './types'

interface TimelineProps {
  // fitView?: boolean
  data: Array<SignalObj<TimelineItem>>
  index: number
  startDate: Accessor<Dayjs>
  endDate: Accessor<Dayjs>
  setIndex: (value: number) => void
}

const svgBarHeight = 30
const lineHeight = 30
const textWidth = 200
const margin = { left: 40, right: 20 + textWidth }

const Timeline: Component<TimelineProps> = props => {
  let container: HTMLDivElement
  const [containerWidth, setContainerWidth] = createSignal(0)
  const list = createMemo(() => dayjs.range(props.startDate(), props.endDate(), 'd', '[]'))
  const days = createMemo(() => dayjs(props.endDate()).diff(props.startDate(), 'd'))
  const scaleTime = (day: Dayjs) => day.diff(props.startDate(), 'd') * textWidth
  const layout = createLayout(() => props.data, scaleTime, textWidth, lineHeight)

  const scrollWidth = createMemo(() => {
    const timeLength = days() * textWidth
    return Math.max(margin.left + timeLength + margin.right, containerWidth())
  })

  onMount(() => {
    setContainerWidth(container.clientWidth)
  })

  return (
    <div ref={container} class="simple-scrollbar overflow-auto bg-white bg-opacity-10">
      <style>
        {`
          .simple-scrollbar::-webkit-scrollbar {
            position: absolute;
            transform: translateY(100%);
            height: 4px;
          }
          .simple-scrollbar::-webkit-scrollbar-thumb {
            background: transparent;
            border-radius: 5px;
          }
          .simple-scrollbar:hover::-webkit-scrollbar-thumb {
            background: #d9d9d9;
          }
        `}
      </style>
      <svg
        class="text-white text-opacity-50 block"
        font-size="10"
        height={svgBarHeight + layout().line * lineHeight}
        width={scrollWidth()}
      >
        <g transform={`translate(0,${svgBarHeight - 1})`}>
          <path stroke="currentColor" d={`M${margin.left},0H${scrollWidth() - margin.right}`} />
          <For each={list()}>
            {(day, index) => (
              <g transform={`translate(${margin.left + index() * textWidth},0)`}>
                <line stroke="currentColor" y2="-6" />
                <text
                  class="hover:text-[red]"
                  fill="currentColor"
                  y="-9"
                  style={{ 'text-anchor': 'middle' }}
                >
                  {day.format('YYYY-MM-DD')}
                </text>
              </g>
            )}
          </For>
        </g>

        <g transform={`translate(${margin.left},${svgBarHeight})`}>
          <For each={layout().data}>
            {(item, i) => (
              <g
                class={cs(
                  'cursor-pointer',
                  i() === props.index ? 'text-blue-400' : 'text-white text-opacity-85',
                )}
                transform={`translate(${item.left},0)`}
                onClick={() => props.setIndex(i())}
              >
                <line stroke="currentColor" y1="-1" y2={item.top + lineHeight} />
                <foreignObject y={item.top} width={item.width} height={lineHeight}>
                  <div
                    class={cs(
                      'h-[24px] leading-[24px] border border-solid translate-y-[6px] px-[4px]',
                      i() === props.index ? 'border-blue-400' : 'border-gray-400',
                    )}
                  >
                    {item.value().node}
                  </div>
                </foreignObject>
              </g>
            )}
          </For>
        </g>
      </svg>
    </div>
  )
}

export default Timeline
