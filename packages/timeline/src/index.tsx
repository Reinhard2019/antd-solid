import dayjs from './day'
import { Component, createMemo, createSignal } from 'solid-js'
import BarTime from './BarTime'
import TimelineInner from './Timeline'
import { TimelineItem, SignalObj } from './types'

interface TimelineProps {
  class?: string
  data: Array<SignalObj<TimelineItem>>
}

const Timeline: Component<TimelineProps> = props => {
  const startDate = createMemo(() =>
    dayjs.min(
      props.data.map(item => {
        const date = item.value().date
        return Array.isArray(date) ? date[0] : date
      }),
    ),
  )
  const endDate = createMemo(() =>
    dayjs.max(
      props.data.map(item => {
        const date = item.value().date
        return Array.isArray(date) ? date[1] : date
      }),
    ),
  )

  const [index, setIndex] = createSignal(0)

  return (
    <div class={cs('min-h-[100px]', props.class)}>
      <TimelineInner
        data={props.data}
        startDate={startDate}
        endDate={endDate}
        index={index()}
        setIndex={setIndex}
      />
      <BarTime startDate={startDate()} endDate={endDate()} data={props.data} index={index()} />
    </div>
  )
}

export default Timeline
