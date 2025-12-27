import { type Component } from 'solid-js'
import { DatePicker } from 'antd-solid'

const App: Component = () => {
  return (
    <DatePicker
      style={{
        width: '140px',
      }}
      onChange={(date, dateString) => {
        console.log(date, dateString)
      }}
    />
  )
}

export default App
