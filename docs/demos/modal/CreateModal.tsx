import { type Component } from 'solid-js'
import { Button, Modal, Command } from 'antd-solid'

interface ExampleModalProps {
  title: string
}
interface ExampleModalResolveValue {
  msg: string
}
const ExampleModal = Command.createCommand<ExampleModalProps, ExampleModalResolveValue>(
  (props: ExampleModalProps) => {
    const { open, onCancel, onOk, dispose } = Command.useCommandProps<ExampleModalResolveValue>()

    return (
      <Modal
        {...props}
        open={open()}
        onCancel={onCancel}
        onAfterExit={dispose}
        // eslint-disable-next-line solid/reactivity
        onOk={async () => {
          await new Promise<void>(_resolve => {
            setTimeout(() => {
              _resolve()
              onOk({ msg: '点击确定成功' })
            }, 3000)
          })
        }}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Modal>
    )
  },
)

const App: Component = () => {
  return (
    <>
      <Button
        type="primary"
        onClick={() => {
          ExampleModal.show({
            title: 'Basic Modal',
          })
            .then(value => {
              console.log('确定', value.msg)
            })
            .catch(() => {
              console.log('取消')
            })
        }}
      >
        Open Modal
      </Button>
    </>
  )
}

export default App
