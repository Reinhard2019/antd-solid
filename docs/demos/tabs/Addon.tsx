import { type Component } from 'solid-js'
import { Button, Tabs } from 'antd-solid'

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
  return (
    <Tabs
      addonBefore={<Button>addonBefore</Button>}
      items={items}
      addonAfter={<Button>addonAfter</Button>}
    />
  )
}

export default App
