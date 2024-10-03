import { type Component } from 'solid-js'
import { Segmented } from 'antd-solid'

const App: Component = () => {
  const options = ['第一章', '第二章', '第三章']

  return <Segmented block options={options} onChange={console.log} />
}

export default App
