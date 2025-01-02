import { isEmpty, remove } from 'lodash-es'
import { For, type Accessor, type JSX, Show, createMemo, createSignal, untrack } from 'solid-js'

interface TreeForProps<T> {
  each: T[] | undefined | null
  fallback?: JSX.Element
  /**
   * 下一层的 each
   */
  nextEach: (item: T) => T[] | undefined | null
  expanded?: (
    item: T,
    options: {
      index: Accessor<number>
      parentList: T[] | undefined
      parentIndexes: number[] | undefined
    },
  ) => boolean
  /**
   * 监听某个 child 隐藏或显示
   * 某些情况下，父级的显示与否取决于是否 child 是否显示
   */
  onChildChange?: (child: T, when: boolean) => void
  parentList?: T[] | undefined
  parentIndexes?: number[]
  children: (
    item: T,
    options: {
      index: Accessor<number>
      parentList: T[] | undefined
      parentIndexes: number[] | undefined
      isParent: Accessor<boolean>
      isEmptyChildren: Accessor<boolean>
      onChildChange?: (child: T, when: boolean) => void
    },
  ) => JSX.Element
}

function TreeFor<T>(props: TreeForProps<T>) {
  return (
    <For each={props.each} fallback={props.fallback}>
      {(item, index) => {
        const nextEach = createMemo(() => props.nextEach(item))
        const isParent = createMemo(() => !isEmpty(nextEach()))
        const [filteredNextEach, setFilteredNextEach] = createSignal(untrack(nextEach) ?? [])
        const isEmptyChildren = createMemo(() => isEmpty(filteredNextEach()))
        const onChildChange: TreeForProps<T>['onChildChange'] = (child, value) => {
          setFilteredNextEach(prev => {
            if (value) {
              if (prev.includes(child)) {
                return prev
              } else {
                prev.push(child)
              }
            } else {
              if (prev.includes(child)) {
                remove(prev, v => v === child)
              } else {
                return prev
              }
            }
            return [...prev]
          })
        }

        const options = {
          index,
          parentList: props.parentList,
          parentIndexes: props.parentIndexes,
          isParent,
          isEmptyChildren,
          onChildChange: props.onChildChange,
        }
        const isExpanded = createMemo(() => (props.expanded ? props.expanded(item, options) : true))

        return (
          <>
            {props.children(item, options)}
            <Show when={isParent() && isExpanded()}>
              <TreeFor
                each={nextEach()}
                nextEach={props.nextEach}
                onChildChange={onChildChange}
                expanded={props.expanded}
                children={props.children}
                parentList={[...(props.parentList ?? []), item]}
                parentIndexes={[...(props.parentIndexes ?? []), index()]}
                fallback={props.fallback}
              />
            </Show>
          </>
        )
      }}
    </For>
  )
}

export default TreeFor
