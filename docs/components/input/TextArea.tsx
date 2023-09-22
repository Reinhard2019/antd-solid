import { type Component } from 'solid-js'
import { Input } from 'antd-solid'

const TextArea: Component = () => {
  return (
    <Input.TextArea
      onChange={e => {
        console.log('onChange', e.target.value)
      }}
    />
  )
}

export default TextArea
