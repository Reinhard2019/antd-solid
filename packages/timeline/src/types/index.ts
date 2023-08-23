import { Dayjs } from 'dayjs'
import { Accessor, JSXElement, Setter } from 'solid-js'

export interface TimelineItem {
  date: Dayjs | [Dayjs, Dayjs]
  node: JSXElement
}

export interface SignalObj<T> {
  value: Accessor<T>
  setValue: Setter<T>
}
