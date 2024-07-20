import { type Component } from 'solid-js'
import { Select } from 'antd-solid'

const App: Component = () => {
  return (
    <div
      style={{
        display: 'flex',
        'flex-direction': 'column',
        gap: '4px',
      }}
    >
      <Select size="small" defaultValue="0" placeholder="请选择" />
      <Select defaultValue="0" placeholder="请选择" />
      <Select size="large" defaultValue="0" placeholder="请选择" />
      <Select size="small" multiple defaultValue={['0', '1']} placeholder="请选择" />
      <Select multiple defaultValue={['0', '1']} placeholder="请选择" />
      <Select size="large" multiple defaultValue={['0', '1']} placeholder="请选择" />
    </div>
  )
}

export default App
