import { type Component } from 'solid-js'
import { Select } from 'antd-solid'

const App: Component = () => {
  return (
    <Select
      multiple
      allowClear
      placeholder="请选择"
      options={[
        { value: 'jack', label: 'Jack' },
        { value: 'lucy', label: 'Lucy' },
        { value: 'yiminghe', label: 'Yiminghe' },
      ]}
      onChange={console.log}
    />
  )
}

export default App
