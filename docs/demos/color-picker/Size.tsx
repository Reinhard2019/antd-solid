import { type Component } from 'solid-js'
import { ColorPicker } from 'antd-solid'

const App: Component = () => {
  return (
    <div style={{ display: 'flex', gap: '8px', 'align-items': 'center' }}>
      <ColorPicker defaultValue="#1677ff" size="small" />
      <ColorPicker defaultValue="#1677ff" />
      <ColorPicker defaultValue="#1677ff" size="large" />
    </div>
  )
}

export default App
