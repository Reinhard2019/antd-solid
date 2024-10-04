import { createSignal, type Component } from 'solid-js'
import { Button, Drawer } from 'antd-solid'

const App: Component = () => {
  const [open, setOpen] = createSignal(false)

  const showDrawer = () => {
    setOpen(true)
  }

  const onClose = () => {
    setOpen(false)
  }

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
      <Button type="primary" onClick={showDrawer}>
        Open
      </Button>
      <Drawer title="Basic Modal" open={open()} onClose={onClose} getContainer={false}>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Drawer>
    </div>
  )
}

export default App
