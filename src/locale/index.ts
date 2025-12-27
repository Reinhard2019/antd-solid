import { type DatePickerLocale } from '../DatePicker'
import { type ModalLocale } from '../Modal'
import { type PopconfirmLocale } from '../Popconfirm'

export interface Locale {
  locale: string
  Modal: ModalLocale
  Popconfirm: PopconfirmLocale
  DatePicker: DatePickerLocale
}
