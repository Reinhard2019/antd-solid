import { type Component } from 'solid-js'
import { Button, Drawer, type DrawerInstance } from 'antd-solid'

const App: Component = () => {
  let ref: DrawerInstance

  return (
    <div
      style={{
        position: 'relative',
        height: '200px',
        display: 'flex',
        'justify-content': 'center',
        'align-items': 'center',
        'flex-direction': 'column',
        gap: '8px',
      }}
    >
      <span>Render in this</span>
      <Button
        type="primary"
        onClick={() => {
          ref!.open()
        }}
      >
        Open
      </Button>
      <Drawer ref={ref!} title="Basic Modal" getContainer={false}>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Drawer>
    </div>
  )
}

export default App
