import { type Component } from 'solid-js'
import { Select } from 'antd-solid'

const Base: Component = () => {
  return (
    <Select
      placeholder="请选择"
      options={[
        { value: 'jack', label: 'Jack' },
        { value: 'lucy', label: 'Lucy' },
        { value: 'yiminghe', label: 'Yiminghe' },
      ]}
    />
  )
}

export default Base
