import { type Component } from 'solid-js'
import { Input } from 'antd-solid'

const AllowClear: Component = () => {
  return <Input placeholder="可清空" allowClear />
}

export default AllowClear
