import { createSignal, untrack, createSelector, createMemo, type JSXElement } from 'solid-js'
import createControllableValue from '../hooks/createControllableValue'
import { type Key } from '../types'
import SingleLevelTree from './SingleLevelTree'
import { get, isEmpty } from 'lodash-es'
import { type CheckboxProps } from '../Checkbox'

export interface TreeNode {
  key: Key
  title: JSXElement
  children?: TreeNode[] | undefined
}

export interface TreeProps<T extends {} = TreeNode> {
  /**
   * 支持点选多个节点（节点本身）
   */
  multiple?: boolean
  defaultSelectedKeys?: Key[] | undefined | null
  selectedKeys?: Key[] | undefined | null
  onSelect?: (selectedKeys: Key[]) => void
  treeData?: T[]
  /**
   * 是否节点占据一行
   */
  blockNode?: boolean
  defaultExpandAll?: boolean
  checkable?: boolean
  /**
   * 设置节点可拖拽
   */
  draggable?: boolean
  onDrop?: (info: {
    dragNode: T
    targetNode: T
    dragIndexes: number[]
    targetIndexes: number[]
  }) => void
  /**
   * 默认选中复选框的树节点
   */
  defaultCheckedKeys?: Key[]
  checkedKeys?: Key[]
  onCheck?: (checkedKeys: Key[]) => void
  /**
   * 自定义节点 title、key、children 的字段
   * 默认 { title: 'title', key: 'key', children: 'children' }
   */
  fieldNames?: {
    title?:
    | string
    | ((
      node: T,
      info: {
        indexPath: number[]
      },
    ) => JSXElement)
    key?: string | ((node: T) => Key)
    children?: string | ((node: T) => T[] | undefined)
  }
}

function Tree<T extends {} = TreeNode>(props: TreeProps<T>) {
  const fieldNames = Object.assign(
    {
      title: 'title' as string | ((node: T) => JSXElement),
      key: 'key' as string | ((node: T) => Key),
      children: 'children' as string | ((node: T) => T[] | undefined),
    },
    untrack(() => props.fieldNames),
  )
  const getTitle = (
    node: T,
    info: {
      indexPath: number[]
    },
  ): JSXElement => {
    const titleFieldName = fieldNames.title
    return typeof titleFieldName === 'function'
      ? titleFieldName(node, info)
      : get(node, titleFieldName)
  }
  const getKey = (node: T): Key => {
    const keyFieldName = fieldNames.key
    return typeof keyFieldName === 'function' ? keyFieldName(node) : get(node, keyFieldName)
  }
  const getChildren = (node: T): T[] | undefined => {
    const childrenFieldName = fieldNames.children
    return typeof childrenFieldName === 'function'
      ? childrenFieldName(node)
      : get(node, childrenFieldName)
  }

  const [selectedKeys, setSelectedKeys] = createControllableValue<Key[]>(props, {
    defaultValuePropName: 'defaultSelectedKeys',
    valuePropName: 'selectedKeys',
    trigger: 'onSelect',
    valueConvertor: v => (Array.isArray(v) ? v : []),
  })

  const [expandedKeys, setExpandedKeys] = createSignal<Key[]>(
    untrack(() => {
      if (!props.defaultExpandAll) return []
      const collectKeys = (list: T[] | undefined): Key[] => {
        if (!list) return []
        return list.flatMap(item => [getKey(item), ...collectKeys(getChildren(item))])
      }
      return collectKeys(props.treeData)
    }),
  )

  const [checkedKeys, setCheckedKeys] = createControllableValue<Key[]>(props, {
    defaultValuePropName: 'defaultCheckedKeys',
    valuePropName: 'checkedKeys',
    trigger: 'onCheck',
    valueConvertor: v => (Array.isArray(v) ? v : []),
  })
  const checkedMap = createMemo(() => {
    const map = new Map<Key, CheckboxProps>()
    const checkedKeyDict = Object.fromEntries(checkedKeys().map(k => [k, true]))

    const treeForEach = (list: T[] | undefined): CheckboxProps => {
      let checked = true
      let indeterminate = false

      list?.forEach(item => {
        const key = getKey(item)
        const children = getChildren(item)

        let res: CheckboxProps
        if (isEmpty(children)) {
          res = {
            checked: !!checkedKeyDict[key],
          }
        } else {
          res = treeForEach(children!)
        }

        map.set(key, res)

        if (!res.checked) {
          checked = false
        }

        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (res.checked || res.indeterminate) {
          indeterminate = true
        }
      })

      return {
        checked,
        indeterminate,
      }
    }
    treeForEach(props.treeData)

    return map
  })

  const [draggableNode, setDraggableNode] = createSignal<T | null>(null)
  const isDraggable = createSelector<T | null, T | null>(draggableNode)
  const [draggableIndexes, setDraggableIndexes] = createSignal<number[] | null>(null)

  const [targetNode, setTargetNode] = createSignal<T | null>(null)
  const isTarget = createSelector<T | null, T | null>(targetNode)
  const [targetIndexes, setTargetIndexes] = createSignal<number[] | null>(null)

  return (
    <div
      style={{
        '--ant-tree-node-hover-bg': 'rgba(0, 0, 0, 0.04)',
      }}
    >
      <SingleLevelTree
        {...props}
        treeData={props.treeData}
        indent={0}
        selectedKeys={selectedKeys}
        setSelectedKeys={setSelectedKeys}
        draggableNode={draggableNode}
        setDraggableNode={setDraggableNode}
        draggableIndexes={draggableIndexes}
        setDraggableIndexes={setDraggableIndexes}
        isDraggable={isDraggable}
        targetNode={targetNode}
        setTargetNode={setTargetNode}
        targetIndexes={targetIndexes}
        setTargetIndexes={setTargetIndexes}
        isTarget={isTarget}
        expandedKeys={expandedKeys}
        setExpandedKeys={setExpandedKeys}
        checkedKeys={checkedKeys}
        setCheckedKeys={setCheckedKeys}
        getTitle={getTitle}
        getKey={getKey}
        getChildren={getChildren}
        checkedMap={checkedMap}
      />
    </div>
  )
}

export default Tree
