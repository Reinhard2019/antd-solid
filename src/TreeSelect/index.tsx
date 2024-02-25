import { splitProps, type JSXElement, untrack, createMemo, Show } from 'solid-js'
import { type Key, type StringOrJSXElement } from '../types'
import createControllableValue from '../hooks/createControllableValue'
import { get, isEmpty, isNil } from 'lodash-es'
import Tree, { type TreeProps } from '../Tree'
import SelectInput, { type SelectInputProps } from '../SelectInput'
import { unwrapStringOrJSXElement } from '../utils/solid'
import Empty from '../Empty'

export interface TreeSelectNode {
  value: Key
  label: JSXElement
  children?: TreeSelectNode[] | undefined
}

export interface TreeSelectProps<T extends {} = TreeSelectNode>
  extends Pick<
  SelectInputProps<Key>,
  'multiple' | 'allowClear' | 'class' | 'disabled' | 'placeholder' | 'status'
  >,
  Pick<TreeProps<T>, 'treeData'> {
  defaultValue?: Key | Key[] | undefined
  value?: Key | Key[] | undefined
  onChange?: (value: Key | Key[] | undefined) => void
  /**
   * 自定义节点 label、value、children 的字段
   * 默认 { label: 'label', value: 'value', children: 'children' }
   */
  fieldNames?: {
    label?: string | ((node: T) => JSXElement)
    value?: string | ((node: T) => Key)
    children?: string | ((node: T) => T[] | undefined)
  }
}

const TreeSelect = <T extends {} = TreeSelectNode>(props: TreeSelectProps<T>) => {
  const [selectInputProps] = splitProps(props, [
    'multiple',
    'allowClear',
    'class',
    'disabled',
    'placeholder',
    'status',
  ])

  const fieldNames = Object.assign(
    {
      label: 'label' as string | ((node: T) => JSXElement),
      value: 'value' as string | ((node: T) => Key),
      children: 'children' as string | ((node: T) => T[] | undefined),
    },
    untrack(() => props.fieldNames),
  )
  const getLabel = (node: T): JSXElement => {
    const labelFieldName = fieldNames.label
    return typeof labelFieldName === 'function'
      ? labelFieldName(node)
      : unwrapStringOrJSXElement(get(node, labelFieldName) as StringOrJSXElement)
  }
  const getValue = (node: T): Key => {
    const valueFieldName = fieldNames.value
    return typeof valueFieldName === 'function' ? valueFieldName(node) : get(node, valueFieldName)
  }
  const getChildren = (node: T): T[] | undefined => {
    const childrenFieldName = fieldNames.children
    return typeof childrenFieldName === 'function'
      ? childrenFieldName(node)
      : get(node, childrenFieldName)
  }

  const optionMap = createMemo(() => {
    const map = new Map<Key, T>()

    const treeForEach = (list: T[] | undefined) => {
      list?.forEach(item => {
        const key = getValue(item)
        map.set(key, item)

        const children = getChildren(item)
        if (!isEmpty(children)) {
          treeForEach(children!)
        }
      })
    }
    treeForEach(props.treeData)

    return map
  })

  const [value, setValue] = createControllableValue<Key | Key[] | undefined | null>(props)
  const valueArr = createMemo<Key[] | undefined | null>(() =>
    props.multiple
      ? (value() as Key[])
      : isNil(value())
        ? (value() as undefined | null)
        : ([value()] as Key[]),
  )
  const setValueArr = (v: Key[] | undefined) => {
    setValue(props.multiple ? v : v?.[0])
  }

  return (
    <SelectInput
      {...selectInputProps}
      optionLabelRender={v => getLabel(optionMap().get(v)!)}
      value={valueArr()}
      onChange={setValueArr}
      content={close => (
        <Show when={!isEmpty(props.treeData)} fallback={<Empty.PRESENTED_IMAGE_SIMPLE />}>
          <div class="px-4px py-8px">
            <Tree
              selectedKeys={valueArr()}
              onSelect={selectedKeys => {
                setValueArr(selectedKeys)
                if (!props.multiple) close()
              }}
              treeData={props.treeData}
              multiple={props.multiple}
              blockNode
              fieldNames={{
                title: fieldNames.label,
                key: fieldNames.value,
                children: fieldNames.children,
              }}
            />
          </div>
        </Show>
      )}
    />
  )
}

export default TreeSelect
