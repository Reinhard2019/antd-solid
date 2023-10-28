import { type Component } from 'solid-js'
import { Button, Modal, type ModalInstance } from 'antd-solid'

const Index: Component = () => {
  let ref: ModalInstance

  const showModal = () => {
    ref.open()
  }

  const handleOk = () => {
    console.log('确定')
    return true
  }

  const afterClose = () => {
    console.log('取消')
  }

  return (
    <>
      <Button type="primary" onClick={showModal}>
        Open Modal
      </Button>
      <Modal ref={ref!} title="Basic Modal" onOk={handleOk} afterClose={afterClose}>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Modal>
    </>
  )
}

export default Index
