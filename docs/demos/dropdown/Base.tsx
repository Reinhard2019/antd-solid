import { type Component } from 'solid-js'
import { Dropdown, type MenuItem } from 'antd-solid'

const items: MenuItem[] = [
  {
    key: '1',
    label: '1st menu item',
  },
  {
    key: '2',
    label: '2nd menu item',
  },
  {
    key: '3',
    label: '3rd menu item',
    children: [
      {
        key: '1',
        label: '1st menu item',
      },
      {
        key: '2',
        label: '2nd menu item',
      },
      {
        key: '3',
        label: '3rd menu item',
      },
    ],
  },
]

const App: Component = () => {
  return (
    <Dropdown menu={{ items }}>
      <a
        onClick={e => {
          e.preventDefault()
        }}
      >
        Hover me
        <span class="i-ant-design:down-outlined" style={{ 'margin-left': '4px' }} />
      </a>
    </Dropdown>
  )
}

export default App
