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

      <Drawer title="Basic Modal" open={open()} onClose={onClose}>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Drawer>
    </>
  )
}

export default App
