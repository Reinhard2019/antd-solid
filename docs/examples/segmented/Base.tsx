import { type Component } from 'solid-js'
import { Segmented } from 'antd-solid'

const App: Component = () => {
  const options = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly']

  return <Segmented options={options} onChange={console.log} />
}

export default App
