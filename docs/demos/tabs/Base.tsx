import { type Component } from 'solid-js'
import { Tabs } from 'antd-solid'

const App: Component = () => {
  const items = [
    {
      key: '1',
      label: () => 'Tab 1',
      children: () => 'Content of Tab Pane 1',
    },
    {
      key: '2',
      label: () => 'Tab 2',
      children: () => 'Content of Tab Pane 2',
    },
    {
      key: '3',
      label: () => 'Tab 3',
      children: () => 'Content of Tab Pane 3',
    },
  ]
  return <Tabs items={items} />
}

export default App
