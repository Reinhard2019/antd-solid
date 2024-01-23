import { createSignal, untrack, createSelector, createMemo, type JSXElement } from 'solid-js'
import createControllableValue from '../hooks/createControllableValue'
import { type StringOrJSXElement } from '../types'
import SingleLevelTree from './SingleLevelTree'
import { get, isEmpty } from 'lodash-es'
import { type CheckboxProps } from '../Checkbox'
import { unwrapStringOrJSXElement } from '../utils/solid'

export interface TreeNode {
  title: StringOrJSXElement
  children?: TreeNode[] | undefined
}

export interface TreeProps<T extends {} = TreeNode> {
  /**
   * 支持点选多个节点（节点本身）
   */
  multiple?: boolean
  defaultSelectedNodes?: T[] | undefined
  selectedNodes?: T[] | undefined
  onSelect?: (selectedNodes: T[]) => void
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
  defaultCheckedNodes?: T[]
  checkedNodes?: T[]
  onCheck?: (checkedNodes: T[]) => void
  /**
   * 自定义节点 title、key、children 的字段
   * 默认 { title: 'title', children: 'children' }
   */
  fieldNames?: {
    title?:
    | string
    | ((
      node: T,
      info: {
        indexes: number[]
      },
    ) => JSXElement)
    children?: string | ((node: T) => T[] | undefined)
  }
}

function Tree<T extends {} = TreeNode>(props: TreeProps<T>) {
  const fieldNames = Object.assign(
    {
      title: 'title' as string | ((node: T) => JSXElement),
      children: 'children' as string | ((node: T) => T[] | undefined),
    },
    untrack(() => props.fieldNames),
  )
  const getTitle = (
    node: T,
    info: {
      indexes: number[]
    },
  ): JSXElement => {
    const titleFieldName = fieldNames.title
    return typeof titleFieldName === 'function'
      ? titleFieldName(node, info)
      : unwrapStringOrJSXElement(get(node, titleFieldName) as StringOrJSXElement)
  }
  const getChildren = (node: T): T[] | undefined => {
    const childrenFieldName = fieldNames.children
    return typeof childrenFieldName === 'function'
      ? childrenFieldName(node)
      : get(node, childrenFieldName)
  }

  const [selectedNodes, setSelectedNodes] = createControllableValue<T[]>(props, {
    defaultValuePropName: 'defaultSelectedNodes',
    valuePropName: 'selectedNodes',
    trigger: 'onSelect',
    defaultValue: [],
  })

  const [expandedNodes, setExpandedNodes] = createSignal<T[]>(
    untrack(() => {
      if (!props.defaultExpandAll) return []
      const collectKeys = (list: T[] | undefined): T[] => {
        if (!list) return []
        return list.flatMap(item => [item, ...collectKeys(getChildren(item))])
      }
      return collectKeys(props.treeData)
    }),
  )

  const [checkedNodes, setCheckedNodes] = createControllableValue<T[]>(props, {
    defaultValuePropName: 'defaultCheckedKeys',
    valuePropName: 'checkedNodes',
    trigger: 'onCheck',
    defaultValue: [],
  })
  const checkedMap = createMemo(() => {
    const map = new Map<T, CheckboxProps>()
    const checkedNodeMap = new Map(checkedNodes().map(k => [k, true]))

    const treeForEach = (list: T[] | undefined): CheckboxProps => {
      let checked = true
      let indeterminate = false

      list?.forEach(item => {
        const key = item
        const children = getChildren(item)

        let res: CheckboxProps
        if (isEmpty(children)) {
          res = {
            checked: !!checkedNodeMap.get(key),
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
    <SingleLevelTree
      {...props}
      treeData={props.treeData}
      indent={0}
      selectedNodes={selectedNodes}
      setSelectedNodes={setSelectedNodes}
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
      expandedNodes={expandedNodes}
      setExpandedNodes={setExpandedNodes}
      checkedNodes={checkedNodes}
      setCheckedNodes={setCheckedNodes}
      getTitle={getTitle}
      getChildren={getChildren}
      checkedMap={checkedMap}
    />
  )
}

export default Tree
