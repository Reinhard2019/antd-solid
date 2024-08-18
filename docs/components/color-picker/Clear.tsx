import { type Component } from 'solid-js'
import { ColorPicker } from 'antd-solid'

const Base: Component = () => {
  return (
    <ColorPicker
      defaultValue="#1677ff"
      allowClear
      onChange={value => {
        console.log('onChange', value)
      }}
    />
  )
}

export default Base
