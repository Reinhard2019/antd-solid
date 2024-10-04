import { type Component } from 'solid-js'
import { Input } from 'antd-solid'

const AddonBeforeAndAfter: Component = () => {
  return (
    <div
      style={{
        display: 'flex',
        'flex-direction': 'column',
        gap: '8px',
      }}
    >
      <Input addonBefore="http://" addonAfter=".com" defaultValue="mysite" />
      <Input addonBefore="http://" defaultValue="mysite" />
      <Input addonAfter=".com" defaultValue="mysite" />
    </div>
  )
}

export default AddonBeforeAndAfter
