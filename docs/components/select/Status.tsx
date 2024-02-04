import { type Component } from 'solid-js'
import { Select } from 'antd-solid'

const App: Component = () => {
  return (
    <div
      style={{
        display: 'flex',
        'flex-direction': 'column',
        gap: '8px',
      }}
    >
      <Select placeholder="请选择" options={[]} status="error" />
      <Select placeholder="请选择" options={[]} status="warning" />
    </div>
  )
}

export default App
