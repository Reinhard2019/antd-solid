import { type Component } from 'solid-js'
import { Spin, Alert } from 'antd-solid'

const App: Component = () => {
  return (
    <Spin>
      <Alert type="success">
        如果你不能从热爱开始，那么那些热爱它的人会打败那些「喜欢」或「讨厌」它的人。
      </Alert>
    </Spin>
  )
}

export default App
