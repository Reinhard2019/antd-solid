import { type Component } from 'solid-js'
import { Checkbox } from 'antd-solid'

const App: Component = () => {
  return (
    <>
      <Checkbox defaultChecked={false} disabled />
      <br />
      <Checkbox indeterminate disabled />
      <br />
      <Checkbox defaultChecked disabled />
    </>
  )
}

export default App
