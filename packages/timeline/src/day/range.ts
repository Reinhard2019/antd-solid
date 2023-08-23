import dayjs from 'dayjs'
import type { Dayjs, ManipulateType } from 'dayjs'

export default (_, __, dayjsFactory: typeof dayjs) => {
  dayjsFactory.range = function (
    start: Dayjs,
    end: Dayjs,
    interval?: ManipulateType,
    d: '[]' | '[)' = '[)',
  ) {
    const list: Dayjs[] = []
    let current = start
    while (current.isBetween(start, end, interval, d)) {
      list.push(current)
      current = current.add(1, interval)
    }
    return list
  }
}
