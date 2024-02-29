import { type Component } from 'solid-js'
import { Radio } from 'antd-solid'

const App: Component = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Radio disabled>Radio</Radio>
      <Radio checked disabled>
        Radio
      </Radio>
    </div>
  )
}

export default App
