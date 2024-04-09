import { type Component } from 'solid-js'
import { Tabs } from 'antd-solid'

const App: Component = () => {
  const items = [
    {
      key: '1',
      label: () => 'Tab 1',
      children: () => (
        <div style={{ 'line-height': '50px', background: 'gray' }}>Content of Tab Pane 1</div>
      ),
    },
    {
      key: '2',
      label: () => 'Tab 2',
      children: () => (
        <div style={{ 'line-height': '100px', background: 'gray' }}>Content of Tab Pane 2</div>
      ),
    },
    {
      key: '3',
      label: () => 'Tab 3',
      children: () => (
        <div style={{ 'line-height': '150px', background: 'gray' }}>Content of Tab Pane 3</div>
      ),
    },
  ]
  return <Tabs items={items} allowClear />
}

export default App
