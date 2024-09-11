import { type Component } from 'solid-js'
import { CodeInput } from 'antd-solid'

const App: Component = () => {
  return (
    <CodeInput
      onChange={value => {
        console.log('value', value)
      }}
    />
  )
}

export default App
