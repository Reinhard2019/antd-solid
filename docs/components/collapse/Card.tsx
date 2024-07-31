import { type Component } from 'solid-js'
import { Collapse, type CollapseProps } from 'antd-solid'

const text = () => (
  <div>
    A dog is a type of domesticated animal. Known for its loyalty and faithfulness, it can be found
    as a welcome guest in many households across the world.
  </div>
)

const items: CollapseProps['each'] = [
  {
    key: '1',
    label: 'This is panel header 1',
    children: text,
  },
  {
    key: '2',
    label: 'This is panel header 2',
    children: text,
  },
  {
    key: '3',
    label: 'This is panel header 3',
    children: text,
  },
]
const App: Component = () => (
  <Collapse each={items} type="card" defaultActiveItems={['1']}>
    {item => <Collapse.Item label={item.label}>{item.children}</Collapse.Item>}
  </Collapse>
)

export default App
