import { type Component } from 'solid-js'
import { Input } from 'antd-solid'

const Status: Component = () => {
  return (
    <div
      style={{
        display: 'flex',
        'flex-direction': 'column',
        gap: '8px',
      }}
    >
      <Input
        placeholder="Error"
        status="error"
        onChange={e => {
          console.log('onChange', e.target.value)
        }}
      />
      <Input
        placeholder="Warning"
        status="warning"
        onChange={e => {
          console.log('onChange', e.target.value)
        }}
      />
    </div>
  )
}

export default Status
