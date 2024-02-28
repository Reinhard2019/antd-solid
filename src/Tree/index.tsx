import {
  createSignal,
  untrack,
  createSelector,
  createMemo,
  type JSXElement,
  mergeProps,
} from 'solid-js'
import { get, isEmpty, pull } from 'lodash-es'
import createControllableValue from '../hooks/createControllableValue'
import { type Key } from '../types'
import SingleLevelTree from './SingleLevelTree'
import { type CheckboxProps } from '../Checkbox'

export interface CheckNode<T extends {} = TreeNode> extends CheckboxProps {
  key: Key
  parent?: CheckNode<T>
  treeNode: T
  checkedChildCount?: number
  totalChildCount?: number
}

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
  onCheck?: (
    checkedKeys: Key[],
    e: {
      checked: boolean
      halfCheckedKeys: Key[]
    },
  ) => void
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
  /**
   * 默认 'all'
   * 设置勾选策略来指定勾选回调返回的值，all 表示回调函数值为全部选中节点；parent 表示回调函数值为父节点（当父节点下所有子节点都选中时）；child 表示回调函数值为子节点
   */
  checkStrategy?: 'all' | 'parent' | 'child'
  /**
   * 是否允许点击节点进行勾选，仅在 checkable 为 true 时生效
   */
  checkOnClick?: boolean
}

function Tree<T extends {} = TreeNode>(_props: TreeProps<T>) {
  const props = mergeProps(
    {
      checkStrategy: 'all' as const,
    },
    _props,
  )
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
    const map = new Map<Key, CheckNode<T>>()
    const checkedKeyDict = new Map(checkedKeys()?.map(k => [k, true]))

    const treeForEach = (
      list: T[] | undefined,
      parent?: CheckNode<T>,
    ): Omit<CheckNode<T>, 'key' | 'parent' | 'treeNode'> => {
      let checked = true
      let indeterminate = false
      let checkedChildCount = 0

      list?.forEach(item => {
        const key = getKey(item)
        const children = getChildren(item)

        const checkNode: CheckNode<T> = {
          key,
          checked: checkedKeyDict.has(key),
          indeterminate: false,
          parent,
          treeNode: item,
        }

        // 对外部传值进行修补
        switch (props.checkStrategy) {
          case 'all': {
            if (parent?.checked) {
              checkNode.checked = true
              if (!checkedKeyDict.has(key)) {
                checkedKeyDict.set(key, true)
                checkedKeys().push(key)
              }
            }
            break
          }
          case 'parent': {
            if (parent?.checked) {
              checkNode.checked = true
              if (checkedKeyDict.has(key)) {
                checkedKeyDict.delete(key)
                pull(checkedKeys(), key)
              } else {
                checkedKeyDict.set(key, true)
              }
            }
            break
          }
          case 'child': {
            if (isEmpty(children)) {
              if (!checkedKeyDict.has(key) && parent?.checked) {
                checkedKeyDict.set(key, true)
                checkedKeys().push(key)
              }
            } else {
              if (checkedKeyDict.has(key)) {
                checkedKeyDict.delete(key)
                pull(checkedKeys(), key)
              }
            }
            break
          }
        }

        if (isEmpty(children)) {
          checkNode.checked = !!parent?.checked || checkedKeyDict.has(key)
        } else {
          Object.assign(checkNode, treeForEach(children!, checkNode))
          checkNode.totalChildCount = children?.length
        }

        map.set(key, checkNode)

        if (!checkNode.checked) {
          checked = false
        } else {
          checkedChildCount++
        }

        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (checkNode.checked || checkNode.indeterminate) {
          indeterminate = true
        }
      })

      return {
        checked,
        indeterminate,
        totalChildCount: list?.length,
        checkedChildCount,
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
    <div>
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
