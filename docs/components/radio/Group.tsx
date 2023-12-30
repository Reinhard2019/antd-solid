import { type Component } from 'solid-js'
import { Radio } from 'antd-solid'

const App: Component = () => {
  return (
    <Radio.Group
      options={[
        { label: 'top', value: 'top' },
        { label: 'right', value: 'right' },
        { label: 'bottom', value: 'bottom' },
        { label: 'left', value: 'left' },
      ]}
      onChange={e => {
        console.log('radio checked', e.target.value)
      }}
    />
  )
}

export default App
