import { type Component } from 'solid-js'
import { Collapse } from 'antd-solid'

const extra = () => (
  <span
    class="i-ant-design:setting"
    onClick={event => {
      // If you don't want click extra trigger collapse, you can prevent this:
      event.stopPropagation()
    }}
  />
)

const App: Component = () => {
  const items = [
    {
      key: '1',
      label: 'Tab 1',
      children: 'Content of Tab Pane 1',
      extra,
    },
    {
      key: '2',
      label: 'Tab 2',
      children: 'Content of Tab Pane 2',
      extra,
    },
    {
      key: '3',
      label: 'Tab 3',
      children: 'Content of Tab Pane 3',
      extra,
    },
  ]
  return <Collapse items={items} />
}

export default App
