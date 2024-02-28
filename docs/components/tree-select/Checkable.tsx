import { type Component } from 'solid-js'
import { TreeSelect } from 'antd-solid'

const options = [
  {
    label: '0-0',
    value: '0-0',
    children: [
      {
        label: '0-0-0',
        value: '0-0-0',
        children: [
          { label: '0-0-0-0', value: '0-0-0-0' },
          { label: '0-0-0-1', value: '0-0-0-1' },
          { label: '0-0-0-2', value: '0-0-0-2' },
        ],
      },
      {
        label: '0-0-1',
        value: '0-0-1',
        children: [
          { label: '0-0-1-0', value: '0-0-1-0' },
          { label: '0-0-1-1', value: '0-0-1-1' },
          { label: '0-0-1-2', value: '0-0-1-2' },
        ],
      },
      {
        label: '0-0-2',
        value: '0-0-2',
      },
    ],
  },
  {
    label: '0-1',
    value: '0-1',
    children: [
      { label: '0-1-0-0', value: '0-1-0-0' },
      { label: '0-1-0-1', value: '0-1-0-1' },
      { label: '0-1-0-2', value: '0-1-0-2' },
    ],
  },
  {
    label: '0-2',
    value: '0-2',
  },
]

const App: Component = () => {
  return (
    <TreeSelect
      placeholder="请选择"
      treeData={options}
      multiple
      allowClear
      checkable
      checkStrategy="parent"
    />
  )
}

export default App
