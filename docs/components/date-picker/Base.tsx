import { type Component } from 'solid-js'
import { DatePicker } from 'antd-solid'

const Index: Component = () => {
  return (
    <DatePicker
      placeholder="请选择日期"
      onChange={value => {
        console.log('onChange', value)
      }}
    />
  )
}

export default Index
