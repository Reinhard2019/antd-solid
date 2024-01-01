import { isEmpty } from 'lodash-es'
import {
  type Accessor,
  createContext,
  createSignal,
  Index,
  type JSXElement,
  type Setter,
  Show,
  untrack,
  useContext,
  createSelector,
} from 'solid-js'
import cs from 'classnames'

export interface TreeProps<T extends {} = {}> {
  class?: string
  defaultSelectedNodes?: T[]
  treeData?: T[]
  /**
   * 是否节点占据一行
   */
  blockNode?: boolean
  defaultExpandAll?: boolean
  /**
   * 设置节点可拖拽
   */
  draggable?: boolean
  titleRender: (
    node: T,
    info: {
      indexes: number[]
    },
  ) => JSXElement
  children: (node: T) => T[] | undefined
  onSelect?: (node: T) => void
  onDrop?: (info: {
    dragNode: T
    targetNode: T
    dragIndexes: number[]
    targetIndexes: number[]
  }) => void
}

interface SingleLevelTreeProps<T extends {} = {}> extends Omit<TreeProps<T>, 'class'> {
  indent: number
  parentIndexes?: number[]
}

const TreeContext = createContext(
  {} as unknown as {
    selectedNodes: Accessor<Array<{}>>
    setSelectedNodes: Setter<Array<{}>>
    draggableNode: Accessor<{} | null>
    setDraggableNode: Setter<{} | null>
    draggableIndexes: Accessor<number[] | null>
    setDraggableIndexes: Setter<number[] | null>
    isDraggable: (key: {} | null) => boolean
    targetNode: Accessor<{} | null>
    setTargetNode: Setter<{} | null>
    targetIndexes: Accessor<number[] | null>
    setTargetIndexes: Setter<number[] | null>
    isTarget: (key: {} | null) => boolean
    draggable: TreeProps['draggable'] | undefined
    onDrop: TreeProps['onDrop'] | undefined
  },
)

/**
 * 单层级 tree
 */
function SingleLevelTree<T extends {} = {}>(props: SingleLevelTreeProps<T>) {
  const [expanded, setExpanded] = createSignal(props.defaultExpandAll)
  const {
    selectedNodes,
    setSelectedNodes,
    draggableNode,
    setDraggableNode,
    draggableIndexes,
    setDraggableIndexes,
    isDraggable,
    targetNode,
    setTargetNode,
    targetIndexes,
    setTargetIndexes,
    isTarget,
    draggable,
    onDrop,
  } = useContext(TreeContext)

  return (
    <Index each={props.treeData}>
      {(item, i) => {
        const indexes = [...(props.parentIndexes ?? []), i]

        return (
          <>
            <div
              class={cs(
                'flex items-center h-28px pb-4px',
                isDraggable(item()) && '[border:1px_solid_var(--ant-color-primary)] bg-white',
                draggableNode() && 'child[]:pointer-events-none',
              )}
              draggable={draggable}
              onDragStart={() => {
                setDraggableNode(item() as {})
                setDraggableIndexes(indexes)
              }}
              onDragEnter={() => {
                if (item() !== draggableNode()) {
                  setTargetNode(item() as {})
                  setTargetIndexes(indexes)
                }
              }}
              onDragLeave={e => {
                if (item() === targetNode() && e.relatedTarget) {
                  setTargetNode(null)
                  setTargetIndexes(null)
                }
              }}
              onDragEnd={() => {
                onDrop?.({
                  dragNode: draggableNode()!,
                  dragIndexes: draggableIndexes()!,
                  targetNode: targetNode()!,
                  targetIndexes: targetIndexes()!,
                })

                setDraggableNode(null)
                setDraggableIndexes(null)
                setTargetNode(null)
                setTargetIndexes(null)
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
              <div class="flex-shrink-0 w-24px h-24px flex items-center justify-center">
                <span class="i-ant-design:holder-outlined" />
              </div>
              <div
                class={cs(
                  'flex-shrink-0 w-24px h-24px flex items-center justify-center cursor-pointer',
                  isEmpty(props.children(item())) && 'opacity-0',
                )}
              >
                <Show
                  when={expanded()}
                  fallback={
                    <span
                      class={'i-ant-design:plus-square-outlined'}
                      onClick={[setExpanded, true]}
                    />
                  }
                >
                  <span
                    class={'i-ant-design:minus-square-outlined'}
                    onClick={[setExpanded, false]}
                  />
                </Show>
              </div>
              <div
                class={cs(
                  'h-full leading-24px hover:bg-[var(--ant-hover-bg-color)] rounded-1 px-1 cursor-pointer relative',
                  props.blockNode && 'w-full',
                  selectedNodes()?.includes(item()) && '!bg-[var(--ant-tree-node-selected-bg)]',
                  isTarget(item()) &&
                    "before:content-[''] before:inline-block before:w-8px before:h-8px before:absolute before:bottom-0 before:left-0 before:-translate-x-full before:translate-y-1/2 before:rounded-1/2 before:[border:2px_solid_var(--ant-color-primary)] after:content-[''] after:inline-block after:h-2px after:absolute after:left-0 after:right-0 after:bottom--1px after:bg-[var(--ant-color-primary)]",
                )}
                onClick={() => {
                  setSelectedNodes([item()])
                  props.onSelect?.(item())
                }}
              >
                {props.titleRender(item(), { indexes })}
              </div>
            </div>

            <Show when={expanded() && !isEmpty(props.children(item()))}>
              <SingleLevelTree
                treeData={props.children(item())}
                indent={props.indent + 1}
                parentIndexes={indexes}
                blockNode={props.blockNode}
                defaultExpandAll={props.defaultExpandAll}
                titleRender={props.titleRender}
                children={props.children}
                onSelect={node => untrack(() => props.onSelect?.(node))}
              />
            </Show>
          </>
        )
      }}
    </Index>
  )
}

function Tree<T extends {} = {}>(props: TreeProps<T>) {
  const [selectedNodes, setSelectedNodes] = createSignal<T[]>(props.defaultSelectedNodes ?? [])

  const [draggableNode, setDraggableNode] = createSignal<T | null>(null)
  const isDraggable = createSelector<T | null, T | null>(draggableNode)
  const [draggableIndexes, setDraggableIndexes] = createSignal<number[] | null>(null)

  const [targetNode, setTargetNode] = createSignal<T | null>(null)
  const isTarget = createSelector<T | null, T | null>(targetNode)
  const [targetIndexes, setTargetIndexes] = createSignal<number[] | null>(null)

  return (
    <TreeContext.Provider
      value={{
        selectedNodes,
        setSelectedNodes: setSelectedNodes as unknown as Setter<Array<{}>>,
        draggableNode,
        setDraggableNode: setDraggableNode as unknown as Setter<{} | null>,
        draggableIndexes,
        setDraggableIndexes,
        isDraggable,
        targetNode,
        setTargetNode: setTargetNode as unknown as Setter<{} | null>,
        targetIndexes,
        setTargetIndexes,
        isTarget,
        draggable: props.draggable,
        onDrop: props.onDrop,
      }}
    >
      <SingleLevelTree
        treeData={props.treeData}
        indent={0}
        blockNode={props.blockNode}
        defaultExpandAll={props.defaultExpandAll}
        titleRender={props.titleRender}
        children={props.children}
        onSelect={node => untrack(() => props.onSelect?.(node))}
      />
    </TreeContext.Provider>
  )
}

export default Tree
