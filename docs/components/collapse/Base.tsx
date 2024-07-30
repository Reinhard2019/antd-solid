import { type Component } from 'solid-js'
import { Collapse } from 'antd-solid'

const App: Component = () => {
  const items = [
    {
      label: 'Tab 1',
      children: 'Content of Tab Pane 1',
    },
    {
      label: 'Tab 2',
      children: 'Content of Tab Pane 2',
    },
    {
      label: 'Tab 3',
      children: 'Content of Tab Pane 3',
    },
  ]
  return (
    <Collapse each={items}>
      {item => <Collapse.Item label={item.label}>{item.children}</Collapse.Item>}
    </Collapse>
  )
}

export default App
