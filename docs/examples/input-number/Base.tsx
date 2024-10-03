import { type Component } from 'solid-js'
import { InputNumber } from 'antd-solid'

const Base: Component = () => {
  return (
    <InputNumber
      placeholder="请输入"
      onChange={value => {
        console.log('onChange', value)
      }}
    />
  )
}

export default Base
