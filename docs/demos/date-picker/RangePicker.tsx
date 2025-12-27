import { type Component } from 'solid-js'
import { DatePicker } from 'antd-solid'

const App: Component = () => {
  return (
    <DatePicker.RangePicker
      onChange={date => {
        console.log(date)
      }}
    />
  )
}

export default App
