import { type Component, createMemo, createSignal, For, Show } from 'solid-js'
import cs from 'classnames'
import dayjs from 'dayjs'
import createControllableValue from '../hooks/createControllableValue'
import Button from '../Button'
import useLocale from '../hooks/useLocale'

export interface PanelProps {
  defaultValue?: dayjs.Dayjs | dayjs.Dayjs[] | undefined
  value?: dayjs.Dayjs | dayjs.Dayjs[] | undefined
  onChange?: (date: dayjs.Dayjs | dayjs.Dayjs[] | undefined) => void
  multiple?: boolean
}

const monthList = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const Panel: Component<PanelProps> = props => {
  const locale = useLocale()

  const [value, setValue] = createControllableValue<dayjs.Dayjs | dayjs.Dayjs[] | undefined>(props)
  const valueArr = createMemo(() => {
    const _value = value()
    if (!_value) return []
    return Array.isArray(_value) ? _value : [_value]
  })

  const [currentMonth, setCurrentMonth] = createSignal(dayjs().startOf('month'))

  return (
    <div>
      <div class="h-40px flex items-center border-0 border-b border-solid border-[--ant-color-border]">
        <Button
          type="text"
          onClick={() => {
            setCurrentMonth(prev => prev.subtract(1, 'M'))
          }}
        >
          <span class="i-ant-design:left-outlined" />
        </Button>
        <div class="w-full flex justify-center">
          <Button type="text">
            {locale().locale === 'en'
              ? monthList[currentMonth().month()]
              : `${currentMonth().year()}年`}
          </Button>
          <Button type="text">
            {locale().locale === 'en' ? currentMonth().year() : `${currentMonth().month() + 1}月`}
          </Button>
          <Show when={props.multiple}>
            <Button type="text">{`${currentMonth().add(1, 'M').year()}年`}</Button>
            <Button type="text">{`${currentMonth().add(1, 'M').month() + 1}月`}</Button>
          </Show>
        </div>
        <Button
          type="text"
          onClick={() => {
            setCurrentMonth(prev => prev.add(1, 'M'))
          }}
        >
          <span class="i-ant-design:right-outlined" />
        </Button>
      </div>

      <div class="flex">
        <Weeks
          month={currentMonth()}
          value={valueArr()}
          onChange={date => {
            if (props.multiple) {
              setValue([date, valueArr()[1]] as dayjs.Dayjs[])
            } else {
              setValue(date)
            }
          }}
        />

        <Show when={props.multiple}>
          <Weeks
            month={currentMonth().add(1, 'M')}
            value={valueArr()}
            onChange={date => {
              if (props.multiple) {
                setValue([valueArr()[0], date] as dayjs.Dayjs[])
              } else {
                setValue(date)
              }
            }}
          />
        </Show>
      </div>
    </div>
  )
}

const Weeks: Component<{
  month: dayjs.Dayjs
  value: dayjs.Dayjs[]
  onChange: (date: dayjs.Dayjs | undefined) => void
}> = props => {
  const locale = useLocale()

  // 添加6周的天数
  const weeks = createMemo(() => {
    const month = props.month
    let startDay: number = month.day()
    startDay = startDay === 0 ? 7 : startDay
    const start = month.add(startDay === 1 ? 0 : 1 - startDay, 'day')

    return Array.from({ length: 6 }, (_, weekIndex) =>
      Array.from({ length: 7 }, (__, dayIndex) => start.add(weekIndex * 7 + dayIndex, 'day')),
    )
  })

  return (
    <div class="p-[var(--ant-padding-xs)_calc(var(--ant-padding)+.5*var(--ant-padding-xxs))]">
      <table>
        <thead>
          <tr>
            <th class="w-36px h-36px">{locale().DatePicker.Mon}</th>
            <th class="w-36px h-36px">{locale().DatePicker.Tue}</th>
            <th class="w-36px h-36px">{locale().DatePicker.Wed}</th>
            <th class="w-36px h-36px">{locale().DatePicker.Thu}</th>
            <th class="w-36px h-36px">{locale().DatePicker.Fri}</th>
            <th class="w-36px h-36px">{locale().DatePicker.Sat}</th>
            <th class="w-36px h-36px">{locale().DatePicker.Sun}</th>
          </tr>
        </thead>
        <tbody>
          <For each={weeks()}>
            {week => (
              <tr>
                <For each={week}>
                  {day => (
                    <td class="w-36px h-36px">
                      <div
                        class={cs(
                          day.isSame(props.value[0]) || day.isSame(props.value[1])
                            ? 'bg-[--ant-color-primary]'
                            : day.isAfter(props.value[0]) &&
                                props.value[1] &&
                                day.isBefore(props.value[1])
                              ? 'bg-#e6f4ff'
                              : 'hover:bg-[--ant-date-picker-cell-hover-bg]',
                          !day.isSame(props.month, 'M') && 'text-[--ant-color-text-disabled]',
                          'w-full h-full cursor-pointer flex justify-center items-center rounded-[--ant-border-radius-sm]',
                        )}
                        onClick={() => {
                          props.onChange(day)
                        }}
                      >
                        {day.date()}
                      </div>
                    </td>
                  )}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  )
}

export default Panel
