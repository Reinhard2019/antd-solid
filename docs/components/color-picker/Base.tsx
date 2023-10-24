import { type Component } from 'solid-js'
import { ColorPicker } from 'antd-solid'

const Base: Component = () => {
  return (
    <ColorPicker
      onChange={value => {
        console.log('onChange', value)
      }}
    />
  )
}

export default Base
