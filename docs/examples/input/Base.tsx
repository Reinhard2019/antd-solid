import { type Component } from 'solid-js'
import { Input } from 'antd-solid'

const Base: Component = () => {
  return (
    <Input
      placeholder="Basic usage"
      onChange={e => {
        console.log('onChange', e.target.value)
      }}
    />
  )
}

export default Base
