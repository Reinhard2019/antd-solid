import { type Component } from 'solid-js'
import { Menu, type MenuItem } from 'antd-solid'

const items: MenuItem[] = [
  {
    key: 'sub1',
    label: 'Navigation One',
    children: [
      {
        key: '1-1',
        label: '1-1',
        children: [
          {
            key: '1-1-1',
            label: '1-1-1',
          },
          {
            key: '1-1-2',
            label: '1-1-2',
          },
          {
            key: '1-1-3',
            label: '1-1-3',
          },
        ],
      },
      {
        key: '1-2',
        label: '1-2',
      },
    ],
  },
  {
    key: 'sub2',
    label: 'Navigation Two',
    children: [
      {
        key: '2-1',
        label: '2-1',
      },
      {
        key: '2-2',
        label: '2-2',
      },
      {
        key: '2-3',
        label: '2-3',
      },
    ],
  },
  {
    key: 'sub3',
    label: 'Navigation Three',
  },
]

const App: Component = () => {
  return <Menu mode="vertical" items={items} style={{ width: '256px' }} onClick={console.log} />
}

export default App
