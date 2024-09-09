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
    <>
      <Button type="primary" onClick={showDrawer}>
        Open
      </Button>
      <Drawer
        title="Basic Modal"
        open={open()}
        onClose={onClose}
        extra={() => (
          <div
            style={{
              display: 'flex',
              gap: '8px',
            }}
          >
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" onClick={onClose}>
              OK
            </Button>
          </div>
        )}
        destroyOnClose
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Drawer>
    </>
  )
}

export default App
