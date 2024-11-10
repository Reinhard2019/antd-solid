import { type Component } from 'solid-js'
import { Button, Modal } from 'antd-solid'

const App: Component = () => {
  const [modal, contextHolder] = Modal.useModal()

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
      }}
    >
      <Button
        onClick={() => {
          modal.warning({
            title: 'Basic Modal',
          })
        }}
      >
        Warning
      </Button>

      {contextHolder()}
    </div>
  )
}

export default App
