import { type Component } from 'solid-js'
import { ColorPicker } from 'antd-solid'

const Base: Component = () => {
  return (
    <ColorPicker
      onChange={(value, hex) => {
        console.log('onChange', value, hex)
      }}
    />
  )
}

export default Base
