import { type Component } from 'solid-js'
import { Button, Drawer, type DrawerInstance } from 'antd-solid'

const App: Component = () => {
  let ref: DrawerInstance

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
      <Drawer ref={ref!} title="Basic Modal">
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Drawer>
    </>
  )
}

export default App
