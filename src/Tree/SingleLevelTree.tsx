/**
 * 单层级 tree
 */
import { isEmpty, last, uniq } from 'lodash-es'
import { Show, For, createMemo, type Accessor, type Setter, type JSXElement } from 'solid-js'
import cs from 'classnames'
import Checkbox from '../Checkbox'
import { type CheckNode, type TreeNode, type TreeProps } from '.'
import { type Key } from '../types'

interface SingleLevelTreeProps<T extends {} = TreeNode>
  extends Pick<
  TreeProps<T>,
  | 'treeData'
  | 'draggable'
  | 'onDrop'
  | 'blockNode'
  | 'checkable'
  | 'multiple'
  | 'checkStrategy'
  | 'checkOnClick'
  > {
  indent: number
  parentIndexes?: number[]
  selectedKeys: Accessor<Key[]>
  setSelectedKeys: Setter<Key[]>
  draggableNode: Accessor<T | null>
  setDraggableNode: Setter<T | null>
  draggableIndexes: Accessor<number[] | null>
  setDraggableIndexes: Setter<number[] | null>
  isDraggable: (key: T | null) => boolean
  targetNode: Accessor<T | null>
  setTargetNode: Setter<T | null>
  targetIndexes: Accessor<number[] | null>
  setTargetIndexes: Setter<number[] | null>
  isTarget: (key: T | null) => boolean
  expandedKeys: Accessor<Key[]>
  setExpandedKeys: Setter<Key[]>
  setCheckedKeys: Setter<Key[]>
  checkedMap: Accessor<Map<Key, CheckNode<T>>>
  getTitle: (
    node: T,
    info: {
      indexPath: number[]
    },
  ) => JSXElement
  getKey: (node: T) => Key
  getChildren: (node: T) => T[] | undefined
}

const SingleLevelTree = <T extends {} = TreeNode>(props: SingleLevelTreeProps<T>) => {
  return (
    <For each={props.treeData}>
      {(item, i) => {
        const indexes = createMemo(() => [...(props.parentIndexes ?? []), i()])
        const isExpanded = createMemo(() => props.expandedKeys().includes(props.getKey(item)))
        const children = createMemo(() => props.getChildren(item))
        const isEndNode = createMemo(() => isEmpty(children()))
        const onCheck = () => {
          const checked = !props.checkedMap().get(props.getKey(item))?.checked
          const key = props.getKey(item)

          /**
           * 获取所有受影响的父节点
           * @param node
           * @param parentKeys
           * @returns
           */
          const getAllParentKeys = (node: CheckNode<T>, parentKeys: Key[] = []): Key[] => {
            if (node.parent) {
              if (checked) {
                node.parent.checkedChildCount!++
              }
              if (node.parent.checkedChildCount === node.parent.totalChildCount) {
                parentKeys.push(node.parent.key)
                return getAllParentKeys(node.parent, parentKeys)
              }
            }
            return parentKeys
          }
          /**
           * 获取所有受影响的子节点
           * @param node
           * @param parentKeys
           * @returns
           */
          const getAllChildKeys = (list: T[] | undefined, onlyEndNode = false): Key[] => {
            if (isEmpty(list)) return []

            return list!.flatMap<Key>(v => {
              const nextLevelChildren = props.getChildren(v)
              if (!isEmpty(nextLevelChildren)) {
                return [
                  ...(onlyEndNode ? [] : [props.getKey(v)]),
                  ...getAllChildKeys(nextLevelChildren!),
                ]
              }
              return [props.getKey(v)]
            })
          }

          if (props.checkStrategy === 'parent') {
            const parentKeys: Key[] = getAllParentKeys(props.checkedMap().get(key)!, [key])
            const root = props.checkedMap().get(last(parentKeys)!)!
            const addKeys = checked
              ? [root.key]
              : props
                .getChildren(root.treeNode)
                ?.map(node => props.getKey(node))
                .filter(k => !parentKeys.includes(k))
            const deleteKeys = checked
              ? getAllChildKeys(props.getChildren(root.treeNode))
              : [key, root.key].concat(getAllChildKeys(children()))
            const deleteChildDict = new Map(deleteKeys.map(k => [k, true]))
            props.setCheckedKeys(keys =>
              keys.concat(addKeys ?? []).filter(k => !deleteChildDict.has(k)),
            )
            return
          }

          let updateKeys: Key[] = []

          if (props.checkStrategy === 'all') {
            updateKeys = [key]
              .concat(getAllChildKeys(children()!))
              .concat(getAllParentKeys(props.checkedMap().get(key)!))
          } else if (props.checkStrategy === 'child') {
            if (isEndNode()) {
              updateKeys = [key]
            } else {
              updateKeys = getAllChildKeys(children()!, true)
            }
          }

          if (checked) {
            props.setCheckedKeys(keys => uniq([...keys, ...updateKeys]))
          } else {
            const deleteChildDict = new Map(updateKeys.map(k => [k, true]))
            props.setCheckedKeys(keys => keys.filter(k => !deleteChildDict.has(k)))
          }
        }

        return (
          <>
            <div
              class={cs(
                'flex items-center h-28px pb-4px',
                props.isDraggable(item) && '[border:1px_solid_var(--ant-color-primary)] bg-white',
                props.draggableNode() && 'child[]:pointer-events-none',
              )}
              draggable={props.draggable}
              onDragStart={() => {
                props.setDraggableNode(item as any)
                props.setDraggableIndexes(indexes())
              }}
              onDragEnter={() => {
                if (item !== props.draggableNode()) {
                  props.setTargetNode(item as any)
                  props.setTargetIndexes(indexes())
                }
              }}
              onDragLeave={e => {
                if (item === props.targetNode() && e.relatedTarget) {
                  props.setTargetNode(null)
                  props.setTargetIndexes(null)
                }
              }}
              onDragEnd={() => {
                props.onDrop?.({
                  dragNode: props.draggableNode()! as T,
                  dragIndexes: props.draggableIndexes()!,
                  targetNode: props.targetNode()! as T,
                  targetIndexes: props.targetIndexes()!,
                })

                props.setDraggableNode(null)
                props.setDraggableIndexes(null)
                props.setTargetNode(null)
                props.setTargetIndexes(null)
              }}
            >
              <div class="flex-shrink-0" role={'indent' as any}>
                {/* eslint-disable-next-line solid/prefer-for */}
                {Array(props.indent)
                  .fill(0)
                  .map(() => (
                    <span class="inline-block w-24px" />
                  ))}
              </div>
              <Show when={props.draggable}>
                <div class="flex-shrink-0 w-24px h-24px flex items-center justify-center">
                  <span class="i-ant-design:holder-outlined" />
                </div>
              </Show>
              <div
                class={cs(
                  'flex-shrink-0 w-24px h-24px flex items-center justify-center cursor-pointer',
                  isEndNode() && 'opacity-0',
                )}
              >
                <Show
                  when={isExpanded()}
                  fallback={
                    <span
                      class="i-ant-design:caret-right-outlined"
                      onClick={() => {
                        const key = props.getKey(item)
                        props.setExpandedKeys(l => [...l, key])
                      }}
                    />
                  }
                >
                  <span
                    class="i-ant-design:caret-down-outlined"
                    onClick={() => {
                      const key = props.getKey(item)
                      props.setExpandedKeys(l => l.filter(k => k !== key))
                    }}
                  />
                </Show>
              </div>
              <Show when={props.checkable}>
                <Checkbox
                  class="mr-8px mt-2px"
                  checked={props.checkedMap().get(props.getKey(item))?.checked}
                  indeterminate={props.checkedMap().get(props.getKey(item))?.indeterminate}
                  onChange={onCheck}
                />
              </Show>
              <div
                class={cs(
                  'h-full leading-24px hover:bg-[var(--ant-tree-node-hover-bg)] rounded-1 px-1 cursor-pointer relative min-w-0',
                  props.blockNode && 'w-full',
                  props.selectedKeys()?.includes(props.getKey(item)) &&
                    '!bg-[var(--ant-tree-node-selected-bg)]',
                  props.isTarget(item) &&
                    "before:content-[''] before:inline-block before:w-8px before:h-8px before:absolute before:bottom-0 before:left-0 before:-translate-x-full before:translate-y-1/2 before:rounded-1/2 before:[border:2px_solid_var(--ant-color-primary)] after:content-[''] after:inline-block after:h-2px after:absolute after:left-0 after:right-0 after:bottom--1px after:bg-[var(--ant-color-primary)]",
                )}
                onClick={() => {
                  const key = props.getKey(item)
                  if (props.multiple) {
                    props.setSelectedKeys(keys => {
                      if (keys.includes(key)) {
                        return keys.filter(n => n !== key)
                      }
                      return [...keys, key]
                    })
                  } else {
                    props.setSelectedKeys(keys => {
                      return keys.includes(key) ? [] : [key]
                    })
                  }

                  if (props.checkOnClick) {
                    onCheck()
                  }
                }}
              >
                {props.getTitle(item, { indexPath: indexes() })}
              </div>
            </div>

            <Show when={isExpanded() && !isEndNode()}>
              <SingleLevelTree
                {...props}
                treeData={children()}
                indent={props.indent + 1}
                parentIndexes={indexes()}
              />
            </Show>
          </>
        )
      }}
    </For>
  )
}

export default SingleLevelTree
