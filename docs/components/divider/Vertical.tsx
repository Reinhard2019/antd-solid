import { type Component } from 'solid-js'
import { Divider } from 'antd-solid'

const App: Component = () => {
  return (
    <>
      Text
      <Divider type="vertical">111123123123</Divider>
      <a href="#">Link</a>
      <Divider type="vertical" />
      <a href="#">Link</a>
    </>
  )
}

export default App
