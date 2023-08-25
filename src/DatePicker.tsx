import { DatePicker as DatePickerAntd } from 'antd'
import { reactToSolidComponent, replaceClassName } from './utils/component'

const RangePicker = replaceClassName(reactToSolidComponent(DatePickerAntd.RangePicker))

const _DatePicker = replaceClassName(reactToSolidComponent(DatePickerAntd))
const DatePicker = _DatePicker as typeof _DatePicker & {
  RangePicker: typeof RangePicker
}
DatePicker.RangePicker = RangePicker

export default DatePicker
