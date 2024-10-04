import { type Component } from 'solid-js'
import { Button, message } from 'antd-solid'

const App: Component = () => {
  const [messageApi, contextHolder] = message.useMessage()

  const info = () => {
    messageApi.open({
      type: 'info',
      content: 'Hello, Ant Design!',
    })
  }

  return (
    <>
      {contextHolder}
      <Button type="primary" onClick={info}>
        Display normal message
      </Button>
    </>
  )
}

export default App
