import { type Component } from 'solid-js'
import { Input } from 'antd-solid'

const PrefixAndSuffix: Component = () => {
  return (
    <div class="ant-flex ant-flex-col ant-gap-8px">
      <Input prefix="http://" suffix=".com" defaultValue="mysite" />
      <Input prefix="http://" defaultValue="mysite" />
      <Input suffix=".com" defaultValue="mysite" />
    </div>
  )
}

export default PrefixAndSuffix
