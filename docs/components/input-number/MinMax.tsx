import { type Component } from 'solid-js'
import { InputNumber } from 'antd-solid'

const Index: Component = () => {
  return (
    <InputNumber
      min={1}
      max={10}
      placeholder="最小值 & 最大值"
      onChange={value => {
        console.log('onChange', value)
      }}
    />
  )
}

export default Index
