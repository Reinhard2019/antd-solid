import { type Component } from 'solid-js'
import { Button, Drawer, type DrawerInstance } from 'antd-solid'

const App: Component = () => {
  let ref: DrawerInstance

  const onClose = () => {
    ref!.close()
  }

  return (
    <>
      <Button
        type="primary"
        onClick={() => {
          ref!.open()
        }}
      >
        Open
      </Button>
      <Drawer
        ref={ref!}
        title="Basic Modal"
        extra={
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
        }
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
