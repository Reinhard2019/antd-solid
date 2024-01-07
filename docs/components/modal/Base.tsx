import { createSignal, type Component } from 'solid-js'
import { Button, Modal } from 'antd-solid'

const Index: Component = () => {
  const [open, setOpen] = createSignal(false)
  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Open Modal
      </Button>
      <Modal
        open={open()}
        title="Basic Modal"
        // eslint-disable-next-line solid/reactivity
        onOk={async () => {
          await new Promise<void>(resolve => {
            setTimeout(() => {
              console.log('onOk')
              resolve()
              setOpen(false)
            }, 3000)
          })
        }}
        onCancel={() => {
          console.log('onCancel')
          setOpen(false)
        }}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Modal>
    </>
  )
}

export default Index
