import { Dayjs } from 'dayjs'
import { Component, createMemo } from 'solid-js'
import { TimelineItem, SignalObj } from './types'

interface BarTimeProps {
  data: Array<SignalObj<TimelineItem>>
  startDate: Dayjs
  endDate: Dayjs
  index: number
}

const BarTime: Component<BarTimeProps> = props => {
  const width = createMemo(() => {
    const date = props.data[props.index]?.value().date
    const currentDate = Array.isArray(date) ? date[0] : date
    const startDateValue = props.startDate.valueOf()
    const width =
      (currentDate.valueOf() - startDateValue) / (props.endDate.valueOf() - startDateValue)
    return `${width * 100}%`
  })

  return (
    <div class="relative bg-[rgba(209,213,219,0.3)] h-[20px]">
      <div class="h-full bg-[rgba(156,163,175,0.8)]" style={{ width: width() }} />
      <span class="absolute top-1/2 transform -translate-y-1/2 text-xs text-opacity-50 text-black">
        {props.startDate.format('YYYY年MM月')}
      </span>
      <span class="absolute top-1/2 transform -translate-y-1/2 right-0 text-xs text-opacity-50 text-black">
        {props.endDate.format('YYYY年MM月')}
      </span>
    </div>
  )
}

export default BarTime
