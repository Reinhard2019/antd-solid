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
      <Button disabled type="primary">
        Primary Button
      </Button>
      <Button disabled>Default Button</Button>
      <Button disabled type="dashed">
        Dashed Button
      </Button>
      <Button disabled type="text">
        Text Button
      </Button>
      <Button disabled type="link">
        Link Button
      </Button>
    </div>
  )
}

export default App
