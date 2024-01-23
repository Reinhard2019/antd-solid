/**
 * 单层级 tree
 */
import { isEmpty, uniq } from 'lodash-es'
import { Show, For, createMemo, type Accessor, type Setter, type JSXElement } from 'solid-js'
import cs from 'classnames'
import Checkbox, { type CheckboxProps } from '../Checkbox'
import { type TreeNode, type TreeProps } from '.'

interface SingleLevelTreeProps<T extends {} = TreeNode>
  extends Pick<
  TreeProps<T>,
  'treeData' | 'draggable' | 'onDrop' | 'blockNode' | 'checkable' | 'multiple'
  > {
  indent: number
  parentIndexes?: number[]
  selectedNodes: Accessor<T[]>
  setSelectedNodes: Setter<T[]>
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
  expandedNodes: Accessor<T[]>
  setExpandedNodes: Setter<T[]>
  checkedNodes: Accessor<T[]>
  setCheckedNodes: Setter<T[]>
  checkedMap: Accessor<Map<T, CheckboxProps>>
  getTitle: (
    node: T,
    info: {
      indexes: number[]
    },
  ) => JSXElement
  getChildren: (node: T) => T[] | undefined
}

const SingleLevelTree = <T extends {} = TreeNode>(props: SingleLevelTreeProps<T>) => {
  return (
    <For each={props.treeData}>
      {(item, i) => {
        const indexes = createMemo(() => [...(props.parentIndexes ?? []), i()])
        const isExpanded = createMemo(() => props.expandedNodes().includes(item))
        const children = createMemo(() => props.getChildren(item))
        const isEndNode = createMemo(() => isEmpty(children()))

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
                        props.setExpandedNodes(l => [...l, item])
                      }}
                    />
                  }
                >
                  <span
                    class="i-ant-design:caret-down-outlined"
                    onClick={() => {
                      props.setExpandedNodes(l => l.filter(k => k !== item))
                    }}
                  />
                </Show>
              </div>
              <Show when={props.checkable}>
                <Checkbox
                  class="mr-8px mt-2px"
                  checked={props.checkedMap().get(item)?.checked}
                  indeterminate={props.checkedMap().get(item)?.indeterminate}
                  onChange={e => {
                    const key = item

                    if (isEndNode()) {
                      if (e.target.checked) {
                        props.setCheckedNodes(keys => [...keys, key])
                      } else {
                        props.setCheckedNodes(keys => keys.filter(k => k !== key))
                      }
                      return
                    }

                    const getAllChildrenKey = (list: T[]): T[] => {
                      return list.flatMap<T>(v => {
                        const nextLevelChildren = props.getChildren(v)
                        if (!isEmpty(nextLevelChildren)) {
                          return getAllChildrenKey(nextLevelChildren!)
                        }
                        return v
                      })
                    }
                    const allChildrenKey = getAllChildrenKey(children()!)

                    if (e.target.checked) {
                      props.setCheckedNodes(keys => uniq([...keys, ...allChildrenKey]))
                    } else {
                      const allChildrenDict = new Map(allChildrenKey.map(k => [k, true]))
                      props.setCheckedNodes(keys => keys.filter(k => !allChildrenDict.get(k)))
                    }
                  }}
                />
              </Show>
              <div
                class={cs(
                  'h-full leading-24px hover:bg-[var(--ant-hover-bg-color)] rounded-1 px-1 cursor-pointer relative min-w-0',
                  props.blockNode && 'w-full',
                  props.selectedNodes()?.includes(item) && '!bg-[var(--ant-tree-node-selected-bg)]',
                  props.isTarget(item) &&
                    "before:content-[''] before:inline-block before:w-8px before:h-8px before:absolute before:bottom-0 before:left-0 before:-translate-x-full before:translate-y-1/2 before:rounded-1/2 before:[border:2px_solid_var(--ant-color-primary)] after:content-[''] after:inline-block after:h-2px after:absolute after:left-0 after:right-0 after:bottom--1px after:bg-[var(--ant-color-primary)]",
                )}
                onClick={() => {
                  if (props.multiple) {
                    props.setSelectedNodes(nodes => {
                      if (nodes.includes(item)) {
                        return nodes.filter(n => n !== item)
                      }
                      return [...nodes, item]
                    })
                  } else {
                    props.setSelectedNodes([item])
                  }
                }}
              >
                {props.getTitle(item, { indexes: indexes() })}
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
