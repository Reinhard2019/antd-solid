import { type Component } from 'solid-js'
import { Switch } from 'antd-solid'

const App: Component = () => {
  return (
    <div
      style={{
        display: 'flex',
        'align-items': 'center',
        gap: '4px',
      }}
    >
      <Switch size="small" defaultChecked />
      <Switch defaultChecked />
      <Switch size="large" defaultChecked />
    </div>
  )
}

export default App
