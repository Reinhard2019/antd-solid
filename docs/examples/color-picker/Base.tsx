import { type Component } from 'solid-js'
import { ColorPicker } from 'antd-solid'

const App: Component = () => {
  return (
    <ColorPicker
      defaultValue="#1677ff"
      onChange={value => {
        console.log('onChange', value)
      }}
    />
  )
}

export default App
