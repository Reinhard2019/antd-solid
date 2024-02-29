import { type Component } from 'solid-js'
import { Button } from 'antd-solid'

const App: Component = () => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
      }}
    >
      <Button type="primary">Primary Button</Button>
      <Button>Default Button</Button>
      <Button type="dashed">Dashed Button</Button>
      <Button type="text">Text Button</Button>
      <Button type="link">Link Button</Button>
    </div>
  )
}

export default App
