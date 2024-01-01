import { DatePicker as DatePickerAntd } from 'antd'
import { type DatePickerProps, type RangePickerProps } from 'antd/es/date-picker'
import { reactToSolidComponent, replaceClassName } from '../utils/component'

const RangePicker = replaceClassName(
  reactToSolidComponent<
  RangePickerProps & {
    dropdownClassName?: string | undefined
    popupClassName?: string | undefined
    rootClassName?: string | undefined
  }
  >(DatePickerAntd.RangePicker),
)

const _DatePicker = replaceClassName(
  reactToSolidComponent<
  DatePickerProps & {
    status?: '' | 'error' | 'warning' | undefined
    hashId?: string | undefined
    popupClassName?: string | undefined
    rootClassName?: string | undefined
  }
  >(DatePickerAntd),
)
const DatePicker = _DatePicker as typeof _DatePicker & {
  RangePicker: typeof RangePicker
}
DatePicker.RangePicker = RangePicker

export default DatePicker
