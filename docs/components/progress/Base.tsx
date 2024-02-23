import { type Component } from 'solid-js'
import { Progress } from 'antd-solid'

const App: Component = () => {
  return (
    <div style={{ display: 'flex', 'flex-direction': 'column', gap: '8px' }}>
      <Progress percent={30} />
      <Progress percent={70} status="error" />
      <Progress percent={100} />
      <Progress percent={50} showInfo={false} />
    </div>
  )
}

export default App
