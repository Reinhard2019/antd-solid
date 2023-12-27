import { type Component } from 'solid-js'
import { Input } from 'antd-solid'

const App: Component = () => {
  return (
    <div
      style={{
        display: 'flex',
        'flex-direction': 'column',
        gap: '8px',
      }}
    >
      <Input disabled placeholder="disabled" />
      <Input.TextArea disabled placeholder="disabled" />
    </div>
  )
}

export default App
