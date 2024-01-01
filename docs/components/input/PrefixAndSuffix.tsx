import { type Component } from 'solid-js'
import { Input } from 'antd-solid'

const PrefixAndSuffix: Component = () => {
  return (
    <div
      style={{
        display: 'flex',
        'flex-direction': 'column',
        gap: '8px',
      }}
    >
      <Input prefix="http://" suffix=".com" defaultValue="mysite" />
      <Input prefix="http://" defaultValue="mysite" />
      <Input suffix=".com" defaultValue="mysite" />
    </div>
  )
}

export default PrefixAndSuffix
