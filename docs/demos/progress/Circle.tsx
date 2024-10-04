import { type Component } from 'solid-js'
import { Progress } from 'antd-solid'

const App: Component = () => {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Progress.Circle percent={75} />
      <Progress.Circle percent={70} status="error" />
      <Progress.Circle percent={100} />
    </div>
  )
}

export default App
