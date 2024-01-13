import { type Component } from 'solid-js'
import { Button, Modal } from 'antd-solid'

interface ExampleModalProps {
  title: string
}
interface ExampleModalResolveValue {
  msg: string
}
const ExampleModal = Modal.createModal<ExampleModalProps, ExampleModalResolveValue>(
  (props: ExampleModalProps) => {
    const { open, onCancel, onOk } = Modal.useModalProps<ExampleModalResolveValue>()
    return (
      <Modal
        open={open()}
        onCancel={onCancel}
        {...props}
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

const Index: Component = () => {
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

export default Index
