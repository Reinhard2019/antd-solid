import { type Component } from 'solid-js'
import { Segmented } from 'antd-solid'

const App: Component = () => {
  const options = [
    'Daily',
    { label: 'Weekly', value: 'Weekly', disabled: true },
    'Monthly',
    { label: 'Quarterly', value: 'Quarterly', disabled: true },
    'Yearly',
  ]

  return (
    <div
      style={{
        display: 'flex',
        'flex-direction': 'column',
        'align-items': 'flex-start',
        gap: '8px',
      }}
    >
      <Segmented disabled options={options} onChange={console.log} />
      <Segmented options={options} onChange={console.log} />
    </div>
  )
}

export default App
