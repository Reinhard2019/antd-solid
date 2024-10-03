import { type Component } from 'solid-js'
import { Switch } from 'antd-solid'

const App: Component = () => {
  const onChange = (checked: boolean) => {
    console.log(`switch to ${checked}`)
  }

  return <Switch onChange={onChange} />
}

export default App
