import { type Component } from 'solid-js'
import type dayjs from 'dayjs'
import RangeInput from '../RangeInput'
import createControllableValue from '../hooks/createControllableValue'
import Panel from './Panel'

export interface RangePickerProps {
  value?: dayjs.Dayjs[]
  defaultValue?: dayjs.Dayjs[]
  onChange?: (value: dayjs.Dayjs[]) => void
  disabled?: boolean
  allowClear?: boolean
}

const RangePicker: Component<RangePickerProps> = props => {
  const [value, setValue] = createControllableValue<dayjs.Dayjs[] | undefined>(props)

  return (
    <RangeInput
      {...props}
      optionLabelRender={v => v?.format('YYYY-MM-DD')}
      value={value()}
      onChange={setValue}
      placeholder={['开始日期', '结束日期']}
      content={() => (
        <Panel
          {...props}
          multiple
          onChange={date => {
            setValue(date as dayjs.Dayjs[] | undefined)
          }}
        />
      )}
      tooltipContentStyle={{
        width: 'fit-content',
      }}
    />
  )
}

export default RangePicker
