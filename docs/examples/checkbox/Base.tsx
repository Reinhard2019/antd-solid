import { type Component } from 'solid-js'
import { Checkbox } from 'antd-solid'

const App: Component = () => {
  return (
    <Checkbox
      onChange={e => {
        console.log(e.target.checked)
      }}
    >
      Checkbox
    </Checkbox>
  )
}

export default App
