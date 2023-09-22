import { type Component } from 'solid-js'
import { Input } from 'antd-solid'

const AddonBeforeAndAfter: Component = () => {
  return (
    <div class='ant-flex ant-flex-col ant-gap-8px'>
      <Input addonBefore="http://" addonAfter=".com" defaultValue="mysite" />
      <Input addonBefore="http://" defaultValue="mysite" />
      <Input addonAfter=".com" defaultValue="mysite" />
    </div>
  )
}

export default AddonBeforeAndAfter
