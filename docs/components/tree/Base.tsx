import { type Component } from 'solid-js'
import { Tree } from 'antd-solid'

const Index: Component = () => {
  const treeData = [
    {
      title: 'parent 1',
      key: '0-0',
      children: [
        {
          title: 'parent 1-0',
          key: '0-0-0',
          disabled: true,
          children: [
            {
              title: 'leaf',
              key: '0-0-0-0',
            },
            {
              title: 'leaf',
              key: '0-0-0-1',
            },
          ],
        },
        {
          title: 'parent 1-1',
          key: '0-0-1',
          children: [{ title: <span style={{ color: '#1677ff' }}>sss</span>, key: '0-0-1-0' }],
        },
      ],
    },
  ]

  return (
    <Tree
      blockNode
      titleRender={node => node.title}
      children={node => node.children as any}
      treeData={treeData}
    />
  )
}

export default Index
