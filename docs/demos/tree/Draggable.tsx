import { type Component } from 'solid-js'
import { Tree } from 'antd-solid'
import { get, set } from 'lodash-es'
import { createStore, produce } from 'solid-js/store'

const App: Component = () => {
  const [store, setStore] = createStore({
    treeData: [
      {
        title: '0-0',
        key: '0-0',
        children: [
          {
            title: '0-0-0',
            key: '0-0-0',
            children: [
              { title: '0-0-0-0', key: '0-0-0-0' },
              { title: '0-0-0-1', key: '0-0-0-1' },
              { title: '0-0-0-2', key: '0-0-0-2' },
            ],
          },
          {
            title: '0-0-1',
            key: '0-0-1',
            children: [
              { title: '0-0-1-0', key: '0-0-1-0' },
              { title: '0-0-1-1', key: '0-0-1-1' },
              { title: '0-0-1-2', key: '0-0-1-2' },
            ],
          },
          {
            title: '0-0-2',
            key: '0-0-2',
          },
        ],
      },
      {
        title: '0-1',
        key: '0-1',
        children: [
          { title: '0-1-0-0', key: '0-1-0-0' },
          { title: '0-1-0-1', key: '0-1-0-1' },
          { title: '0-1-0-2', key: '0-1-0-2' },
        ],
      },
      {
        title: '0-2',
        key: '0-2',
      },
    ],
  })

  return (
    <Tree
      blockNode
      defaultExpandAll
      draggable
      treeData={store.treeData}
      onDrop={({ dragIndexes, targetIndexes }) => {
        setStore(
          produce(s => {
            console.log('onDrop', dragIndexes, targetIndexes)
            const dragSiblings =
              dragIndexes.length === 1
                ? s.treeData
                : get(
                  s.treeData,
                  dragIndexes.slice(0, -1).flatMap(i => [i, 'children']),
                )
            const [moveItem] = dragSiblings.splice(dragIndexes.at(-1)!, 1)

            const targetSiblings =
              targetIndexes.length === 1
                ? s.treeData
                : get(
                  s.treeData,
                  targetIndexes.slice(0, -1).flatMap(i => [i, 'children']),
                )
            if (targetSiblings) {
              targetSiblings.splice(targetIndexes.at(-1)!, 0, moveItem)
            } else {
              set(
                s.treeData!,
                targetIndexes.slice(0, -1).flatMap(i => [i, 'children']),
                [moveItem],
              )
            }
          }),
        )
      }}
    />
  )
}

export default App
