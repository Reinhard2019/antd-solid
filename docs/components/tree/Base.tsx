import { type Component } from 'solid-js'
import { Tree } from 'antd-solid'

const Index: Component = () => {
  const treeData = [
    {
      title: 'parent 1',
      children: [
        {
          title: 'parent 1-0',
          disabled: true,
          children: [
            {
              title: 'leaf',
            },
            {
              title: 'leaf',
            },
          ],
        },
        {
          title: 'parent 1-1',
          children: [{ title: () => <span style={{ color: '#1677ff' }}>sss</span> }],
        },
      ],
    },
  ]

  return (
    <Tree
      blockNode
      checkable
      defaultExpandAll
      treeData={treeData}
      onCheck={nodes => {
        console.log('onCheck', nodes)
      }}
    />
  )
}

export default Index
