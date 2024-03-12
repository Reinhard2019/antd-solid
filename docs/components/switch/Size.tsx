import { type Component } from 'solid-js'
import { Switch } from 'antd-solid'

const App: Component = () => {
  return (
    <>
      <Switch defaultChecked />
      <br />
      <Switch size="small" defaultChecked />
    </>
  )
}

export default App
