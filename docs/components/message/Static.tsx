import { type Component } from 'solid-js'
import { Button, message } from 'antd-solid'

const success = () => {
  message.success('This is a success message', 0)
}

const error = () => {
  message.error('This is a error message')
}

const warning = () => {
  message.warning('This is a warning message')
}

const App: Component = () => (
  <div class="flex flex-col gap-8px">
    <Button onClick={success}>Success</Button>
    <Button onClick={error}>Error</Button>
    <Button onClick={warning}>Warning</Button>
  </div>
)

export default App
