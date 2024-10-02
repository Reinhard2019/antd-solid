import { type Component } from 'solid-js'
import { Segmented } from 'antd-solid'

const App: Component = () => {
  const options = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly']

  return (
    <div class="flex flex-col gap-8px">
      <Segmented size="large" options={options} />
      <Segmented options={options} />
      <Segmented size="small" options={options} />
    </div>
  )
}

export default App
