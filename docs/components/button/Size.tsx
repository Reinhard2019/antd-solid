import { type Component } from 'solid-js'
import { Button } from 'antd-solid'

const App: Component = () => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        'align-items': 'center',
      }}
    >
      <Button size="small">Small Button</Button>
      <Button size="middle">Middle Button</Button>
      <Button size="large">Large Button</Button>
    </div>
  )
}

export default App
