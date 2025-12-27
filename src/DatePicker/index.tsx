import { splitProps } from 'solid-js'
import dayjs from 'dayjs'
import { type Key } from '../types'
import createControllableValue from '../hooks/createControllableValue'
import SelectInput, { type SelectInputProps } from '../SelectInput'
import Button from '../Button'
import RangePicker from './RangePicker'
import Panel, { type PanelProps } from './Panel'
import useLocale from '../hooks/useLocale'

export interface DatePickerProps
  extends Pick<
  SelectInputProps<Key>,
  | 'ref'
  | 'multiple'
  | 'allowClear'
  | 'class'
  | 'style'
  | 'disabled'
  | 'placeholder'
  | 'status'
  | 'size'
  | 'variant'
  | 'suffixIcon'
  | 'placement'
  | 'getPopupContainer'
  | 'defaultOpen'
  | 'open'
  | 'onOpenChange'
  > {
  defaultValue?: dayjs.Dayjs | null
  value?: dayjs.Dayjs | null
  onChange?: (date: dayjs.Dayjs | undefined, dateString: string | undefined) => void
}

export interface DatePickerLocale {
  placeholder: string
  today: string
  Mon: string
  Tue: string
  Wed: string
  Thu: string
  Fri: string
  Sat: string
  Sun: string
}

function DatePicker(props: DatePickerProps) {
  const locale = useLocale()

  const [selectInputProps] = splitProps(props, [
    'ref',
    'multiple',
    'allowClear',
    'class',
    'style',
    'disabled',
    'placeholder',
    'status',
    'size',
    'variant',
    'suffixIcon',
    'placement',
    'getPopupContainer',
    'defaultOpen',
    'open',
    'onOpenChange',
  ])
  const [value, _setValue] = createControllableValue<dayjs.Dayjs | null | undefined>(props, {
    trigger: false,
  })
  const setValue = (v: dayjs.Dayjs | undefined) => {
    _setValue(v)

    props.onChange?.(v, v?.format('YYYY-MM-DD'))
  }

  return (
    <SelectInput
      placeholder={locale().DatePicker.placeholder}
      {...selectInputProps}
      style={{
        '--ant-select-popup-match-width': undefined, // 覆盖掉内部的值
        ...selectInputProps.style,
      }}
      value={value()?.format('YYYY-MM-DD')}
      content={close => (
        <div>
          <Panel
            {...(props as PanelProps)}
            onChange={date => {
              if (!Array.isArray(date)) {
                setValue(date)
                close()
              }
            }}
          />

          <div class="h-40px flex justify-center items-center border-t border-solid border-[--ant-color-border]">
            <Button
              type="link"
              onClick={() => {
                setValue(dayjs())
                close()
              }}
            >
              {locale().DatePicker.today}
            </Button>
          </div>
        </div>
      )}
    />
  )
}

DatePicker.RangePicker = RangePicker

export default DatePicker
