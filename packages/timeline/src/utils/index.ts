import { Dayjs } from 'dayjs'
import { Accessor, createMemo } from 'solid-js'
import numeral from 'numeral'
import { TimelineItem, SignalObj } from '../types'

/**
 * 将 data 转化为布局信息
 * @param data
 * @param scaleTime
 * @param textWidth
 * @param lineHeight
 * @returns
 */
export function createLayout(
  data: Accessor<Array<SignalObj<TimelineItem>>>,
  scaleTime: (day: Dayjs) => number,
  textWidth: number,
  lineHeight: number,
) {
  const layout = createMemo(() => {
    // 每一行的当前长度列表
    const lineLenList: number[] = []
    const layoutData = data().map(item => {
      let width = textWidth
      let left = 0
      const date = item.value().date
      if (Array.isArray(date)) {
        left = scaleTime(date[0])
        width = scaleTime(date[1]) - left
      } else {
        left = scaleTime(date)
      }

      const right = numeral(left).add(Math.max(width, textWidth)).value()!

      let lineIndex = lineLenList.findIndex(len => {
        return len <= left
      })
      if (lineIndex === -1) {
        lineIndex = lineLenList.length
        lineLenList.push(right)
      } else {
        lineLenList[lineIndex] = right
      }

      const top = lineIndex * lineHeight
      return {
        ...item,
        left,
        top,
        width,
      }
    })
    return {
      data: layoutData,
      /**
       * 行数
       */
      line: lineLenList.length,
    }
  })
  return layout
}
