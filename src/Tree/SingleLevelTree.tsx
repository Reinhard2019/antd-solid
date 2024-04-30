/**
 * 单层级 tree
 */
import { isEmpty, last, uniq } from 'lodash-es'
import {
  Show,
  For,
  createMemo,
  type Accessor,
  type Setter,
  type JSXElement,
  createSignal,
  untrack,
} from 'solid-js'
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
  | 'indentSize'
  > {
  indentSize: number
  /**
   * 缩进次数
   */
  indent: number
  parentIndexes?: number[]
  selectedKeys: Accessor<any[]>
  setSelectedKeys: Setter<any[]>
  draggableNode: Accessor<T | null>
  setDraggableNode: Setter<T | null>
  draggableIndexes: Accessor<number[] | null>
  setDraggableIndexes: Setter<number[] | null>
  isDraggable: (key: T | null) => boolean
  expandedKeys: Accessor<any[]>
  setExpandedKeys: Setter<any[]>
  setCheckedKeys: Setter<any[]>
  checkedMap: Accessor<Map<Key, CheckNode<T>>>
  getTitle: (node: T) => JSXElement
  getKey: (node: T) => Key
  getChildren: (node: T) => T[] | undefined
  getNodeByIndexes: (indexes: number[]) => T | undefined
}

const SingleLevelTree = <T extends {} = TreeNode>(props: SingleLevelTreeProps<T>) => {
  return (
    <For each={props.treeData}>
      {(item, i) => {
        let contentRef: HTMLDivElement | undefined

        const indexes = createMemo(() => [...(props.parentIndexes ?? []), i()])
        const children = createMemo(() => props.getChildren(item))
        /**
         * 是否是末尾节点
         */
        const isEndNode = createMemo(() => isEmpty(children()))
        const isExpanded = createMemo(
          () => !isEndNode() && props.expandedKeys().includes(props.getKey(item)),
        )
        const onCheck = () => {
          const checked = !props.checkedMap().get(props.getKey(item))?.checked
          const key = props.getKey(item)

          /**
           * 获取所有受影响的父节点
           * @param node
           * @param parentKeys
           * @returns
           */
          const getAllParentKeys = (node: CheckNode<T>, parentKeys: any[] = []): any[] => {
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

          let updateKeys: any[] = []

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

        let dragEnterClientX = 0
        const [targetIndexes, setTargetIndexes] = createSignal(untrack(indexes))
        const [isTarget, setIsTarget] = createSignal(false)
        const [targetPosition, setTargetPosition] = createSignal<'before' | 'after'>('before')
        const setTargetPositionAndLevelOffset = (
          e: DragEvent & {
            currentTarget: HTMLDivElement
            target: Element
          },
        ) => {
          const middleY = e.target.getBoundingClientRect().top + e.target.clientHeight / 2
          const position = e.clientY < middleY ? 'before' : 'after'
          setTargetPosition(position)

          if (position === 'after') {
            if (isExpanded()) {
              setTargetIndexes([...indexes(), 0])
              return
            }

            let isLastNode = props.treeData?.length === i() + 1
            if (isLastNode && e.clientX < dragEnterClientX) {
              const levelOffset = Math.ceil((e.clientX - dragEnterClientX) / props.indentSize)
              if (levelOffset < 0) {
                setTargetIndexes(() => {
                  const _indexes = [...indexes()]
                  for (let _i = 0; _i < -levelOffset; _i++) {
                    if (_i > 0) {
                      if (_indexes.length < 2) break
                      const grandfatherNode = props.getNodeByIndexes(_indexes.slice(0, -1))
                      isLastNode = grandfatherNode
                        ? props.getChildren(grandfatherNode)?.length === last(_indexes)! + 1
                        : false
                      if (!isLastNode) break
                    }
                    _indexes.pop()
                  }
                  _indexes[_indexes.length - 1] = _indexes[_indexes.length - 1] + 1
                  return _indexes
                })
                return
              }
            }

            if (isEndNode() && e.clientX > dragEnterClientX) {
              const levelOffset = (e.clientX - dragEnterClientX) / props.indentSize
              if (levelOffset >= 1) {
                setTargetIndexes([...indexes(), 0])
                return
              }
            }
          } else {
            // 上一个兄弟节点
            let prevNode = i() > 0 ? props.treeData?.[i() - 1] : undefined
            let isPrevNodeExpanded = prevNode
              ? !isEmpty(props.getChildren(prevNode)) &&
                props.expandedKeys().includes(props.getKey(prevNode))
              : false
            if (isPrevNodeExpanded && e.clientX > dragEnterClientX) {
              const levelOffset = Math.floor((e.clientX - dragEnterClientX) / props.indentSize)
              if (levelOffset > 0) {
                setTargetIndexes(() => {
                  const _indexes = [...indexes().slice(0, -1), i() - 1]
                  for (let _i = 0; _i < levelOffset; _i++) {
                    if (_i > 0) {
                      prevNode = props.getNodeByIndexes(_indexes)
                      isPrevNodeExpanded = prevNode
                        ? !isEmpty(props.getChildren(prevNode)) &&
                          props.expandedKeys().includes(props.getKey(prevNode))
                        : false
                      if (!isPrevNodeExpanded) break
                    }
                    _indexes.push(props.getChildren(prevNode!)!.length!)
                  }
                  return _indexes
                })
                return
              }
            }
          }

          setTargetIndexes(
            position === 'before' ? indexes() : [...indexes().slice(0, -1), last(indexes())! + 1],
          )
        }

        return (
          <>
            <div
              class={cs(
                'p-[var(--ant-tree-node-wrapper-padding)] relative',
                props.draggableNode() && 'child[]:pointer-events-none',
                isTarget() && [
                  'before:content-empty before:inline-block before:w-8px before:h-8px before:absolute before:left-[var(--ant-tree-target-node-left)] before:-translate-x-full before:rounded-1/2 before:[border:2px_solid_var(--ant-color-primary)]',
                  'after:content-empty after:inline-block after:h-2px after:absolute after:left-[var(--ant-tree-target-node-left)] after:right-0 after:bg-[var(--ant-color-primary)]',
                  targetPosition() === 'before'
                    ? 'before:top-0 before:translate-y--1/2 after:top--1px'
                    : 'before:bottom-0 before:translate-y-1/2 after:bottom--1px',
                ],
              )}
              style={{
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                '--ant-tree-target-node-left': `calc(${contentRef?.offsetLeft ?? 0}px + ${(contentRef && window.getComputedStyle(contentRef).paddingLeft) || '0px'} + ${(targetIndexes().length - indexes().length) * props.indentSize}px)`,
              }}
              draggable={props.draggable}
              onDragStart={() => {
                props.setDraggableNode(item as any)
                props.setDraggableIndexes(indexes())
              }}
              onDragEnd={() => {
                props.setDraggableNode(null)
                props.setDraggableIndexes(null)
              }}
              onDragOver={e => {
                e.preventDefault()
                setTargetPositionAndLevelOffset(e)
              }}
              onDragEnter={e => {
                dragEnterClientX = e.clientX
                setIsTarget(true)
                setTargetPositionAndLevelOffset(e)
              }}
              onDragLeave={() => {
                setIsTarget(false)
              }}
              onDrop={() => {
                setIsTarget(false)

                props.onDrop?.({
                  dragNode: props.draggableNode()! as T,
                  dragIndexes: props.draggableIndexes()!,
                  targetIndexes: targetIndexes(),
                })
              }}
            >
              <div
                class={cs(
                  'flex items-center relative',
                  props.isDraggable(item) &&
                    'after:content-empty after:absolute after:inset--1px after:[border:1px_solid_var(--ant-color-primary)]',
                )}
              >
                <div
                  class="flex-shrink-0"
                  aria-label="indent"
                  style={{
                    width: `${props.indent * props.indentSize}px`,
                  }}
                />
                <div
                  class={cs(
                    'flex-shrink-0 w-[var(--ant-tree-expand-icon-width)] flex items-center justify-center cursor-pointer',
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
                  ref={contentRef}
                  class={cs(
                    'rounded-[var(--ant-border-radius-sm)] px-[var(--ant-padding-xxs)] cursor-pointer relative min-w-0',
                    props.blockNode && 'w-full',
                    props.isDraggable(item) || props.selectedKeys()?.includes(props.getKey(item))
                      ? 'bg-[var(--ant-tree-node-selected-bg)]'
                      : 'hover:bg-[var(--ant-tree-node-hover-bg)]',
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
                  {props.getTitle(item)}
                </div>
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
